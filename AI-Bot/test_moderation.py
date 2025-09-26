# test_moderation.py
import argparse
import json
from moderation import moderate_post_content, moderate_images

EXAMPLES = [
    {
        "name": "allowed_mild_profanity",
        "text": "This game is freakin’ hard as hell 😤 but I love it.",
        "links": [],
        "images": [],
    },
    {
        "name": "bullying_targeted",
        "text": "@john you’re such a loser, everyone hates you. Quit already.",
        "links": [],
        "images": [],
    },
    {
        "name": "hate_slur",
        "text": "We shouldn’t hire them, those <slur> don’t belong here.",
        "links": [],
        "images": [],
    },
    {
        "name": "explicit_link_shortener",
        "text": "Check this out",
        "links": ["https://bit.ly/abcd1234"],
        "images": [],
    },
    {
        "name": "sexual_minors",
        "text": "Romantic stories about underage sex shouldn’t be censored.",
        "links": [],
        "images": [],
    },
]

def main():
    parser = argparse.ArgumentParser(description="Run non-API moderation tests.")
    parser.add_argument("--text", type=str, help="Custom post text")
    parser.add_argument("--link", action="append", default=[], help="Add a source link (repeatable)")
    parser.add_argument("--image", action="append", default=[], help="Add an image path for local NSFW check (repeatable)")
    parser.add_argument("--allow-mild-profanity", action="store_true", default=True)
    parser.add_argument("--no-profanity", dest="allow_mild_profanity", action="store_false")
    parser.add_argument("--examples", action="store_true", help="Run built-in examples")
    args = parser.parse_args()

    cases = []
    if args.examples or (not args.text and not args.link and not args.image):
        cases = EXAMPLES
    else:
        cases = [{
            "name": "custom",
            "text": args.text or "",
            "links": args.link,
            "images": args.image,
        }]

    for case in cases:
        print("\n=== CASE:", case["name"], "===")
        text_result = moderate_post_content(
            text=case["text"],
            source_links=case["links"],
            allow_mild_profanity=args.allow_mild_profanity,
        )
        print("Text+Links Result:\n", json.dumps(text_result, indent=2, ensure_ascii=False))

        img_result = {}
        if case["images"]:
            img_result = moderate_images(case["images"])
            print("Image Result:\n", json.dumps(img_result, indent=2, ensure_ascii=False))

        overall_safe = text_result["safe"] and not (img_result.get("enabled") and img_result.get("unsafe"))
        print("OVERALL SAFE:", overall_safe)

if __name__ == "__main__":
    main()
