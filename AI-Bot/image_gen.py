# image_gen.py
import os
import json
import base64
import requests
from typing import Optional

class ImageGenError(Exception):
    pass

# Try the official Together SDK; fall back to raw HTTP if missing
try:
    from together import Together  # pip install together
    _HAS_TOGETHER = True
except Exception:
    _HAS_TOGETHER = False

TOGETHER_API_KEY = os.getenv("TOGETHER_API_KEY")
DEFAULT_MODEL = os.getenv("IMAGE_MODEL", "black-forest-labs/FLUX.1-schnell")
# IMPORTANT: default to 8 (schnell requires 1..12)
DEFAULT_STEPS = int(os.getenv("IMAGE_STEPS", "8"))
TOGETHER_IMG_URL = "https://api.together.xyz/v1/images/generations"

def _clamp_steps(steps: Optional[int]) -> int:
    s = DEFAULT_STEPS if steps is None else int(steps)
    return max(1, min(12, s))  # schnell constraint

def _generate_with_sdk(prompt: str, width: int, height: int, model: str, steps: Optional[int]) -> str:
    if not TOGETHER_API_KEY:
        raise ImageGenError("TOGETHER_API_KEY is missing")
    client = Together(api_key=TOGETHER_API_KEY)
    resp = client.images.generate(
        prompt=prompt,
        model=model,
        width=width,
        height=height,
        steps=_clamp_steps(steps),
        n=1,
        response_format="b64_json",
    )
    try:
        b64 = resp.data[0].b64_json
        base64.b64decode(b64, validate=True)
        return b64
    except Exception as e:
        raise ImageGenError(f"Unexpected Together SDK response: {e}")

def _generate_with_http(prompt: str, width: int, height: int, model: str, steps: Optional[int]) -> str:
    if not TOGETHER_API_KEY:
        raise ImageGenError("TOGETHER_API_KEY is missing")

    payload = {
        "model": model,
        "prompt": prompt,
        "steps": _clamp_steps(steps),   # <-- clamp here
        "width": width,
        "height": height,
        "n": 1,
        "response_format": "base64",    # returns data[0].b64_json
        "output_format": "png",
    }
    headers = {
        "Authorization": f"Bearer {TOGETHER_API_KEY}",
        "Content-Type": "application/json",
    }
    r = requests.post(TOGETHER_IMG_URL, headers=headers, data=json.dumps(payload), timeout=60)
    if r.status_code // 100 != 2:
        raise ImageGenError(f"Together API error {r.status_code}: {r.text}")

    data = r.json()
    try:
        b64 = data["data"][0]["b64_json"]
        base64.b64decode(b64, validate=True)
        return b64
    except Exception as e:
        raise ImageGenError(f"Unexpected Together HTTP response: {e}")

def generate_image_b64(
    prompt: str,
    width: int = 1024,
    height: int = 1024,
    model: str = DEFAULT_MODEL,
    steps: Optional[int] = None
) -> str:
    """
    Returns a base64 PNG string.
    Prefers Together SDK if available; otherwise falls back to HTTP.
    Steps are clamped to [1, 12] for FLUX.1 schnell.
    """
    if _HAS_TOGETHER:
        return _generate_with_sdk(prompt, width, height, model, steps)
    return _generate_with_http(prompt, width, height, model, steps)
