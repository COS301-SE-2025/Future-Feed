# main.py
import asyncio
import base64
import io
import os
from typing import Any, Dict, List, Optional

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, HttpUrl

from bot_agent import create_bot_agent
from moderation import (
    is_prompt_safe,
    moderate_post_content,
    moderate_images,
)
from topic_tagger_smart import smart_tag_topics
from image_gen import generate_image_b64, ImageGenError


# ------------------------------------------------------------------------------
# App setup
# ------------------------------------------------------------------------------
app = FastAPI(title="FutureFeed AI Service", version="1.0.0")

# Optional CORS (tune for your frontend domains)
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ALLOW_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------------------------
# Simple concurrency guard so we don't overload LLM/image providers
# ------------------------------------------------------------------------------
MAX_CONCURRENCY = int(os.getenv("MAX_CONCURRENCY", "8"))  # tune per instance
_semaphore = asyncio.Semaphore(MAX_CONCURRENCY)

async def with_slot():
    await _semaphore.acquire()
    try:
        yield
    finally:
        _semaphore.release()


# ------------------------------------------------------------------------------
# Pydantic models
# ------------------------------------------------------------------------------
class BotRequest(BaseModel):
    prompt: str
    context_url: Optional[str] = None


class ModerationResponse(BaseModel):
    safe: bool
    classification: str


class SmartTagRequest(BaseModel):
    text: str
    existing_topics: List[str]
    max_topics: int = 3


class SmartTagResponse(BaseModel):
    selected: List[str]
    new: List[str]


class ImageGenRequest(BaseModel):
    prompt: str
    width: Optional[int] = 1024
    height: Optional[int] = 1024
    steps: Optional[int] = None
    model: Optional[str] = None
    safe_check: bool = True


class ImageGenResponse(BaseModel):
    b64: str


class PostModerationRequest(BaseModel):
    text: str
    links: Optional[List[HttpUrl]] = None
    image_paths: Optional[List[str]] = None  # server-side paths (optional)
    allow_mild_profanity: bool = True


class PostModerationResponse(BaseModel):
    safe: bool
    labels: List[str]
    allow_reason: Optional[str] = ""
    block_reason: Optional[str] = ""
    message_to_user: str
    links: List[str] = []
    image_checks: Dict[str, Any] = {}
    fallback_used: bool = False


# ------------------------------------------------------------------------------
# Health
# ------------------------------------------------------------------------------
@app.get("/health")
def health():
    return {"status": "ok"}


# ------------------------------------------------------------------------------
# Bot execution
# ------------------------------------------------------------------------------
@app.post("/execute-bot")
async def run_bot(req: BotRequest, _slot=Depends(with_slot)):
    try:
        bot = create_bot_agent(req.prompt, req.context_url)
        # If create_bot_agent returns a callable that may do blocking IO,
        # wrap it to avoid blocking the loop.
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, bot)
        return {"output": result}
    except HTTPException:
        raise
    except Exception as e:
        # Avoid crashing caller; return structured error
        return {"error": str(e)}


# ------------------------------------------------------------------------------
# Prompt-only moderation (kept for image prompt gating)
# ------------------------------------------------------------------------------
@app.post("/moderate", response_model=ModerationResponse)
async def moderate_prompt(req: BotRequest, _slot=Depends(with_slot)):
    result = is_prompt_safe(req.prompt)
    # Ensure expected fields
    safe = bool(result.get("safe", False))
    classification = str(result.get("classification", "UNSAFE"))
    return {"safe": safe, "classification": classification}


# ------------------------------------------------------------------------------
# Full post moderation: text + links + optional local image moderation
# ------------------------------------------------------------------------------
@app.post("/moderate-post", response_model=PostModerationResponse)
async def moderate_post(req: PostModerationRequest, _slot=Depends(with_slot)):
    try:
        text_result = moderate_post_content(
            text=req.text,
            source_links=[str(u) for u in (req.links or [])],
            allow_mild_profanity=req.allow_mild_profanity,
        )

        img_result: Dict[str, Any] = {}
        if req.image_paths:
            img_result = moderate_images(req.image_paths)

        # If images flagged unsafe, mark whole post unsafe with message
        images_unsafe = bool(img_result.get("enabled")) and bool(img_result.get("unsafe"))
        safe = bool(text_result["safe"]) and not images_unsafe

        message = text_result.get("message_to_user", "Your content may violate our guidelines.")
        if images_unsafe:
            message = "Your image appears to contain adult/NSFW content. Please use a different image."

        return {
            "safe": safe,
            "labels": list(text_result.get("labels", [])),
            "allow_reason": text_result.get("allow_reason", ""),
            "block_reason": text_result.get("block_reason", ""),
            "message_to_user": message,
            "links": list(text_result.get("links", [])),
            "image_checks": img_result,
            "fallback_used": bool(text_result.get("fallback_used", False)),
        }
    except HTTPException:
        raise
    except Exception as e:
        # Never crash the service; give a clear response
        raise HTTPException(status_code=500, detail=f"moderation failed: {e}")


# ------------------------------------------------------------------------------
# Smart topic tagging
# ------------------------------------------------------------------------------
@app.post("/tag-topics-smart", response_model=SmartTagResponse)
async def tag_topics_smart(req: SmartTagRequest, _slot=Depends(with_slot)):
    try:
        result = smart_tag_topics(req.text, req.existing_topics, req.max_topics)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"topic tagging failed: {e}")


# ------------------------------------------------------------------------------
# Image generation (b64)
# ------------------------------------------------------------------------------
@app.post("/generate-image", response_model=ImageGenResponse)
async def generate_image(req: ImageGenRequest, _slot=Depends(with_slot)):
    """
    Returns base64 PNG for easy transport to your Spring service.
    Spring can then write bytes to storage via MediaService and return a public URL.
    """
    try:
        if req.safe_check:
            mod = is_prompt_safe(req.prompt)
            if not mod.get("safe", False):
                raise HTTPException(
                    status_code=400,
                    detail=f"Unsafe prompt ({mod.get('classification', 'UNKNOWN')})"
                )

        gen_kwargs: Dict[str, Any] = dict(
            prompt=req.prompt,
            width=req.width or 1024,
            height=req.height or 1024,
            steps=req.steps
        )
        if req.model:
            gen_kwargs["model"] = req.model

        # Offload potentially blocking call
        loop = asyncio.get_event_loop()
        b64 = await loop.run_in_executor(None, lambda: generate_image_b64(**gen_kwargs))
        return {"b64": b64}

    except ImageGenError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"image generation failed: {e}")


# ------------------------------------------------------------------------------
# Image generation (direct PNG)
# ------------------------------------------------------------------------------
@app.post("/generate-image.png")
async def generate_image_png(req: ImageGenRequest, _slot=Depends(with_slot)):
    """
    Returns the image directly as image/png (useful for quick previews).
    """
    try:
        if req.safe_check:
            mod = is_prompt_safe(req.prompt)
            if not mod.get("safe", False):
                raise HTTPException(
                    status_code=400,
                    detail=f"Unsafe prompt ({mod.get('classification', 'UNKNOWN')})"
                )

        gen_kwargs: Dict[str, Any] = dict(
            prompt=req.prompt,
            width=req.width or 1024,
            height=req.height or 1024,
            steps=req.steps
        )
        if req.model:
            gen_kwargs["model"] = req.model

        loop = asyncio.get_event_loop()
        b64 = await loop.run_in_executor(None, lambda: generate_image_b64(**gen_kwargs))
        img_bytes = base64.b64decode(b64)
        return StreamingResponse(io.BytesIO(img_bytes), media_type="image/png")

    except ImageGenError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"image generation failed: {e}")
