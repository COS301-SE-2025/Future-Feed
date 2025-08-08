# test_bot.py
from bot_agent import create_bot_agent

# Example inputs
prompt = "Summarize the latest soccer news."
contextURL = "https://www.skysports.com/"

bot = create_bot_agent(prompt,contextURL)
result = bot()

print("Bot Output:\n", result)