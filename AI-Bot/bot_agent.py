from langchain_together import ChatTogether
from langchain.agents import initialize_agent, Tool
from langchain.tools import tool
from langchain.prompts import ChatPromptTemplate
from dotenv import load_dotenv
import requests
from bs4 import BeautifulSoup

load_dotenv()

llm_llama = ChatTogether(model="meta-llama/Llama-Vision-Free", temperature=0.7)

@tool
def fetch_context(url: str) -> str:
    """Fetch and summarize from a URL to provide context to the bot"""
    try:
        response = requests.get(url, timeout=10)
        soup = BeautifulSoup(response.text, "html.parser")
        for tag in soup(["script", "style", "noscript"]):
            tag.decompose()
        paragraphs = soup.find_all("p")
        text = " ".join(p.get_text() for p in paragraphs[:10])
        clean_text = ' '.join(text.split())
        if len(clean_text) < 200:
            return "Sorry, I couldn't extract meaningful content from that page."
        return clean_text[:3000]
    except Exception as e:
        return f"Failed to fetch context: {str(e)}"

# Always define tools here
tools = [fetch_context]

def create_bot_agent(bot_prompt: str, context_url: str = None):
    full_prompt = bot_prompt
    if context_url:
        context = fetch_context.invoke(context_url)
        full_prompt += f"\n\nContext:\n{context}"

    # Always pass the non-empty tools list
    agent = initialize_agent(tools=tools, llm=llm_llama, agent="zero-shot-react-description", verbose=True)
    return lambda: agent.run(full_prompt)