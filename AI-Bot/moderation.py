import os
from fastapi import HTTPException
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain_together import ChatTogether  # Replace with your model wrapper

# Initialize LLM
llm = ChatTogether(
    model="meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
    temperature=0.0  # deterministic for classification tasks
)

# Moderation prompt template
MOD_PROMPT = """Classify the following user prompt as SAFE or UNSAFE. Provide just one output: "SAFE" or "UNSAFE".

User prompt:
\"\"\"{prompt}\"\"\"
"""

prompt_template = PromptTemplate.from_template(MOD_PROMPT)
chain = LLMChain(llm=llm, prompt=prompt_template)

def is_prompt_safe(prompt: str) -> dict:
    """
    Uses a local LLaMA model to classify a prompt as SAFE or UNSAFE.
    """
    if not prompt or prompt.strip() == "":
        return {"safe": False, "reason": "Prompt is empty or whitespace"}

    result = chain.run({"prompt": prompt}).strip().upper()

    if result not in {"SAFE", "UNSAFE"}:
        raise HTTPException(status_code=500, detail=f"Unexpected model output: {result}")

    return {"safe": result == "SAFE", "classification": result}
