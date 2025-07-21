# test_bot.py
from bot_agent import create_bot_agent

# Example inputs
prompt = "Give me latest in Anime news"

bot = create_bot_agent(prompt)
result = bot()

print("Bot Output:\n", result)