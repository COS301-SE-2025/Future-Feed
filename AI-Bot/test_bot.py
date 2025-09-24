# test_bot.py
import argparse
import base64
import os
import sys
import time
from pathlib import Path

from image_gen import generate_image_b64, ImageGenError

DEFAULT_PROMPT = "a vibrant anime-style city skyline at dusk, cinematic lighting, detailed, 4k"
DEFAULT_SIZE = 768  # square px

def save_png(b64: str, size: int, out: Path | None) -> Path:
    img_bytes = base64.b64decode(b64)
    if out is None:
        out_dir = Path.cwd() / "generated_images"
        out_dir.mkdir(exist_ok=True)
        out = out_dir / f"gen_{int(time.time())}_{size}.png"
    else:
        out.parent.mkdir(parents=True, exist_ok=True)
    out.write_bytes(img_bytes)
    return out

def maybe_open(path: Path):
    try:
        if sys.platform.startswith("darwin"):
            os.system(f'open "{path}"')
        elif os.name == "nt":
            os.startfile(path)  # type: ignore[attr-defined]
        else:
            os.system(f'xdg-open "{path}"')
    except Exception as e:
        print(f"⚠ Could not auto-open image: {e}")

def main():
    parser = argparse.ArgumentParser(description="Generate an image and save it as PNG (Together/OpenAI backend).")
    parser.add_argument("--prompt", type=str, default=DEFAULT_PROMPT, help="Image prompt")
    parser.add_argument("--size", type=int, default=DEFAULT_SIZE, help="Square size in px (e.g., 512/768/1024)")
    parser.add_argument("--steps", type=int, default=None, help="Diffusion steps (FLUX.1 schnell requires 1..12)")
    parser.add_argument("--out", type=Path, default=None, help="Output file path (e.g., ./generated_images/my.png)")
    parser.add_argument("--open", dest="auto_open", action="store_true", help="Open the image after saving")
    args = parser.parse_args()

    size = int(args.size)
    print(f"\n🎨 Generating ({size}x{size}, steps={args.steps or 'default'})")
    print(f"📝 Prompt: {args.prompt!r}")

    try:
        b64 = generate_image_b64(
            prompt=args.prompt,
            width=size,
            height=size,
            steps=args.steps  
        )
        out_path = save_png(b64, size, args.out)
        print(f"✅ Saved: {out_path.resolve()}")

        if args.auto_open:
            maybe_open(out_path)

    except ImageGenError as e:
        print(f"❌ Image generation failed: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    # Providers:
    # - Together: export IMAGE_PROVIDER=together, TOGETHER_API_KEY=...
    # - OpenAI:   export IMAGE_PROVIDER=openai,   OPENAI_API_KEY=...
    main()
