# bot_agent.py
from langchain_together import ChatTogether
from langchain.agents import initialize_agent, Tool
from langchain.tools import tool
from langchain.prompts import ChatPromptTemplate
from dotenv import load_dotenv
import requests
from bs4 import BeautifulSoup

load_dotenv()

llm_llama = ChatTogether(model="deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free", temperature=0.7)

@tool
def fetch_context(url: str) -> str:
    """Fetch and summarize from a URL to provide context to the bot, use real and accurate information"""
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
    system_prompt = (
        "You are a helpful assistant that summarizes content concisely for social media posts, don't put hashtags though "
        "(max 280 characters). Always be clear, catchy, and to the point."
    )
    
    context = ""
    if context_url:
        context = fetch_context.invoke(context_url)
    
    # Check if fetched context is meaningful
    if not context or context.startswith("Sorry") or context.startswith("Failed"):
        # Context is not useful, run prompt without context
        full_prompt = system_prompt + "\n\n" + bot_prompt + "\n\nNote: I couldn't find relevant context, so I'll try to generate from general knowledge."
    else:
        # Context is useful, include it
        full_prompt = system_prompt + "\n\n" + bot_prompt + f"\n\nContext:\n{context}"
    
    agent = initialize_agent(
        tools=tools,
        llm=llm_llama,
        agent="chat-zero-shot-react-description",
        verbose=True,
        handle_parsing_errors=True,
    )
    return lambda: agent.run(full_prompt)
