# test_bot.py
import requests
from bot_agent import create_bot_agent
from moderation import is_prompt_safe

# -------- Config --------
FASTAPI_URL = "http://localhost:8000"  # or container port if docker-mapped

# Example prompt that should be blocked (injection attempt)
prompt = """Provide latest anime/manga news"""
contextURL = "https://www.crunchyroll.com/news/"

# Existing topics you already have in DB (for the test, provide a sample list).
# In production, you'd fetch from your Spring API: GET /api/topics -> [ {id,name}, ... ] -> pass names here.
existing_topics = [
    "football", "soccer", "premier league", "transfers",
    "tech", "finance", "anime", "gaming", "music", "movies"
]

def tag_topics_smart(text: str, existing: list[str], max_topics: int = 3):
    """Call FastAPI smart tagger endpoint."""
    resp = requests.post(
        f"{FASTAPI_URL}/tag-topics-smart",
        json={"text": text, "existing_topics": existing, "max_topics": max_topics},
        timeout=20,
    )
    resp.raise_for_status()
    return resp.json()  # { "selected": [...], "new": [...] }

def main():
    # 1) Moderation
    mod = is_prompt_safe(prompt)
    if not mod.get("safe", False):
        print(f"🚫 Prompt blocked. Classification: {mod.get('classification', 'UNKNOWN')}")
        return

    # 2) Run bot
    bot = create_bot_agent(prompt, contextURL)
    output = bot()
    print("\nBot Output:\n", output)

    # 3) Topic tagging (using smart tagger with existing topics)
    try:
        result = tag_topics_smart(output, existing_topics, max_topics=3)
        selected = result.get("selected", [])
        new = result.get("new", [])
        print("\nAuto-Topics:")
        print(" - Selected (existing):", selected)
        print(" - Proposed (new):    ", new)
    except Exception as e:
        print(f"\n⚠ Topic tagging failed: {e}")

if __name__ == "__main__":
    main()
