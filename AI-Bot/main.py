# main.py
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
import io
import base64
from bot_agent import create_bot_agent
from moderation import is_prompt_safe
from topic_tagger_smart import smart_tag_topics
from image_gen import generate_image_b64, ImageGenError

app = FastAPI()

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

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/execute-bot")
def run_bot(req: BotRequest):
    try:
        bot = create_bot_agent(req.prompt, req.context_url)
        result = bot()
        return {"output": result}
    except Exception as e:
        return {"error": str(e)}

@app.post("/moderate", response_model=ModerationResponse)
def moderate_prompt(req: BotRequest):
    return is_prompt_safe(req.prompt)

@app.post("/tag-topics-smart", response_model=SmartTagResponse)
def tag_topics_smart(req: SmartTagRequest):
    result = smart_tag_topics(req.text, req.existing_topics, req.max_topics)
    return result

@app.post("/generate-image", response_model=ImageGenResponse)
def generate_image(req: ImageGenRequest):
    """
    Returns base64 PNG for easy transport to your Spring service.
    Spring can then write bytes to storage via MediaService and return a public URL.
    """
    try:
        if req.safe_check:
            mod = is_prompt_safe(req.prompt)
            if not mod.get("safe", False):
                raise HTTPException(status_code=400, detail=f"Unsafe prompt ({mod.get('classification', 'UNKNOWN')})")

        gen_kwargs = dict(
            prompt=req.prompt,
            width=req.width or 1024,
            height=req.height or 1024,
            steps=req.steps
        )
        if req.model:
            gen_kwargs["model"] = req.model

        b64 = generate_image_b64(**gen_kwargs)
        return {"b64": b64}
    except ImageGenError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"image generation failed: {e}")

@app.post("/generate-image.png")
def generate_image_png(req: ImageGenRequest):
    """
    Returns the image directly as image/png (useful for quick previews).
    """
    try:
        if req.safe_check:
            mod = is_prompt_safe(req.prompt)
            if not mod.get("safe", False):
                raise HTTPException(status_code=400, detail=f"Unsafe prompt ({mod.get('classification', 'UNKNOWN')})")

        gen_kwargs = dict(
            prompt=req.prompt,
            width=req.width or 1024,
            height=req.height or 1024,
            steps=req.steps
        )
        if req.model:
            gen_kwargs["model"] = req.model

        b64 = generate_image_b64(**gen_kwargs)
        img_bytes = base64.b64decode(b64)
        return StreamingResponse(io.BytesIO(img_bytes), media_type="image/png")
    except ImageGenError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"image generation failed: {e}")

