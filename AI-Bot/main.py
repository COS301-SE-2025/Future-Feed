# main.py
from fastapi import FastAPI
from pydantic import BaseModel
from bot_agent import create_bot_agent
from moderation import is_prompt_safe
from topic_tagger_smart import smart_tag_topics  # <-- hardened tagger

app = FastAPI()

class BotRequest(BaseModel):
    prompt: str
    context_url: str | None = None

class ModerationResponse(BaseModel):
    safe: bool
    classification: str

class SmartTagRequest(BaseModel):
    text: str
    existing_topics: list[str]
    max_topics: int = 3

class SmartTagResponse(BaseModel):
    selected: list[str]
    new: list[str]

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
