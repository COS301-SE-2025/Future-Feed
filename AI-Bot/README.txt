docker build -t my-ai-bot .
docker run -d -p 8000:8000 --name ai-bot-container my-ai-bot