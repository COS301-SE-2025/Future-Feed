from fastapi import FastAPI, Request
from pydantic import BaseModel
from bot_agent import create_bot_agent

app = FastAPI()

class BotRequest(BaseModel):
    prompt: str
    context_url: str | None = None

@app.post("/execute-bot")
def run_bot(req: BotRequest):
    try:
        bot = create_bot_agent(req.prompt, req.context_url)
        result = bot()
        return {"output": result}
    except Exception as e:
        return {"error": str(e)}
