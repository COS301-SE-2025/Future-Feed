# Use a slim Python base image
FROM python:3.11-slim

# Environment settings
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# ---- Install only what you need ----
# Many AI libs (transformers, sentence-transformers) bring wheels,
# so you often don't need a full compiler toolchain. 
# Keep it minimal: just curl + ca-certificates
RUN apt-get update -o Acquire::Retries=5 && \
    apt-get install -y --no-install-recommends \
        curl \
        ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# ---- Python dependencies ----
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ---- Project files ----
COPY . .

# Expose FastAPI port
EXPOSE 8000

# Run FastAPI app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
