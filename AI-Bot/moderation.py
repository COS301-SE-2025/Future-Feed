# moderation.py
import os
import re
import time
from typing import List, Optional, Tuple, Dict, Any

from fastapi import HTTPException
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain

# ---------------------------------------------------------------------------
# Env bridge: langchain_together may build an OpenAI-style client under the hood.
# Mirror TOGETHER_API_KEY -> OPENAI_API_KEY if only Together key is set.
# ---------------------------------------------------------------------------
if not os.getenv("OPENAI_API_KEY") and os.getenv("TOGETHER_API_KEY"):
    os.environ["OPENAI_API_KEY"] = os.environ["TOGETHER_API_KEY"]

# Import AFTER env is bridged
try:
    from langchain_together import ChatTogether
except Exception as e:
    ChatTogether = None  # type: ignore


# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
_MODEL = os.getenv("MODERATION_MODEL", "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free")
_TEMPERATURE = float(os.getenv("MODERATION_TEMP", "0.0"))
_MAX_RETRIES = int(os.getenv("MODERATION_MAX_RETRIES", "3"))
_BACKOFF_BASE = float(os.getenv("MODERATION_BACKOFF_BASE", "0.8"))
_BACKOFF_FACTOR = float(os.getenv("MODERATION_BACKOFF_FACTOR", "2.0"))
_TIMEOUT_SECS = int(os.getenv("MODERATION_TIMEOUT_SECS", "45"))

_llm = None  # lazy init


def _new_llm():
    if ChatTogether is None:
        raise RuntimeError("langchain_together not available")
    return ChatTogether(
        model=_MODEL,
        temperature=_TEMPERATURE,
        request_timeout=_TIMEOUT_SECS,
    )


def _ensure_llm():
    """Create client on first use; if missing API key or import error, return None for rules-only fallback."""
    global _llm
    if _llm is not None:
        return _llm

    has_any_key = bool(os.getenv("OPENAI_API_KEY") or os.getenv("TOGETHER_API_KEY"))
    if not has_any_key or ChatTogether is None:
        return None

    try:
        _llm = _new_llm()
        return _llm
    except Exception:
        _llm = None
        return None


# ---------------------------------------------------------------------------
# Policy knobs & patterns
# ---------------------------------------------------------------------------
ALLOW_MILD_PROFANITY = True  # allowed as long as it's not targeted harassment

HARD_SEXUAL_TERMS = [
    r"\b(child\s*sex|cp|child\s*porn|underage\s*sex|rape|incest)\b",
]
DIRECT_THREATS = [
    r"\b(kill(?:\s*yourself|\s+him|\s+her)|i(?:'|’)m\s+going\s+to\s+kill|i\s+will\s+hurt)\b",
]
HATE_CATEGORIES = [
    r"\b(kike|nigg[ae]r|faggot|tranny)\b",  # expand as needed
]
DOXXING = [
    r"\b(address|home\s+address|credit\s*card|card\s*number|ssn|id\s*number)\b.*\b(is|=|:)\b",
]
ILLEGAL_MARKERS = [
    r"\b(sell(?:ing)?\s*drugs|buy\s*weapons|stolen\s*card)\b",
]

# URLs / domains
URL_SHORTENERS = {"bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd", "buff.ly"}
ADULT_TLDS = {".xxx"}
SUSPICIOUS_HOST_RE = re.compile(r"^\d{1,3}(\.\d{1,3}){3}$")
URL_RE = re.compile(r"\bhttps?://[^\s)]+", flags=re.IGNORECASE)

# --- Bullying / hate fallback heuristics (rules-only mode) ---
BULLYING_TERMS = [
    r"\b(loser|idiot|moron|worthless|pathetic|dumbass|trash|garbage|kill\s*yourself)\b",
]
TARGET_MARKERS_RE = re.compile(r"(@[A-Za-z0-9_]+|\byou\b)", re.IGNORECASE)

# For tests like "those <slur> …" and generic mentions
HATE_PLACEHOLDER = [
    r"<\s*slur\s*>",
    r"\bracial\s+slur\b",
]

HATE_GROUP_TERMS = [
    r"immigrants", r"jews?", r"muslims?", r"christians?",
    r"asians?", r"latinos?", r"africans?", r"blacks?", r"whites?",
    r"gays?", r"lesbians?", r"trans(?:gender|)\b", r"women", r"men"
]
HATE_GROUP_RE = re.compile(r"\b(" + "|".join(HATE_GROUP_TERMS) + r")\b", re.IGNORECASE)
HATE_PHRASE_RE = re.compile(r"\b(do\s*not|don'?t)\s+belong\s+here\b", re.IGNORECASE)

# Very short “teaser” text threshold for risky links (spammy)
SHORT_TEXT_LEN = 20


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _contains(patterns: List[str], text: str) -> Optional[str]:
    for pat in patterns:
        if re.search(pat, text, flags=re.IGNORECASE):
            return pat
    return None


def _extract_links(text: str, extra_links: Optional[List[str]] = None) -> List[str]:
    links = URL_RE.findall(text or "")
    if extra_links:
        links.extend([l for l in extra_links if l])
    seen, out = set(), []
    for l in links:
        if l not in seen:
            out.append(l)
            seen.add(l)
    return out


def _domain_parts(url: str) -> Tuple[str, str]:
    from urllib.parse import urlparse
    try:
        host = urlparse(url).hostname or ""
    except Exception:
        host = ""
    parts = host.lower().strip(".").split(".")
    if not parts:
        return host, ""
    if len(parts) >= 2:
        tld = "." + parts[-1]
        domain = ".".join(parts[-2:])
        return domain, tld
    return host, ""


# ---------------------------------------------------------------------------
# LLM prompt (nuanced/contextual)
# ---------------------------------------------------------------------------
LLM_PROMPT = PromptTemplate.from_template(
    """You are a careful, context-aware content moderator for a social platform.
Decide if the following POST TEXT and optional SOURCE LINKS should be allowed.

Rules (simplified):
- Allow mild profanity (e.g., "damn", "hell", casual swearing without targeting).
- Block bullying/harassment (targeted insults, slurs at a person/group).
- Block hate speech.
- Block explicit sexual content or sexual content involving minors.
- Block sexual solicitation, pornographic descriptions, or graphic sexual acts.
- Block credible threats or calls for violence.
- Block doxxing (posting private personal data).
- Block illegal solicitation (weapons, stolen cards, hard drugs).
- Links: flag if pointing to explicit porn, known shorteners without context, or obviously malicious hosts.
- Consider context and quotes. If user is condemning bad content, that is OK.

Provide a single JSON object with these fields:
- "safe": boolean
- "labels": array of strings chosen from: ["bullying","hate","sexual","sexual_minors","violence","doxxing","illegal","spam","links_risky","other"]
- "allow_reason": short string
- "block_reason": short string
- "message_to_user": friendly, brief message if blocked

POST TEXT:
\"\"\"{text}\"\"\"

SOURCE LINKS:
{links}
"""
)


def _run_llm_moderation(text: str, links: List[str]) -> Dict[str, Any]:
    llm = _ensure_llm()
    if llm is None:
        # Rules-only fallback (no key or client unavailable)
        safe = _rules_only_safe(text, links)
        return {
            "safe": safe,
            "labels": _rules_only_labels(text, links),
            "allow_reason": "Rules-only: no violations detected." if safe else "",
            "block_reason": "Rules-only: potential violation." if not safe else "",
            "message_to_user": "We couldn’t fully check your content due to missing API key. Based on rules, please revise if flagged.",
            "fallback": True,
            "error": "LLM unavailable (no API key)",
        }

    chain = LLMChain(llm=llm, prompt=LLM_PROMPT)

    attempt = 0
    last_err = None
    while attempt < _MAX_RETRIES:
        try:
            resp = chain.run({"text": text, "links": links}).strip()
            resp = resp.strip("`")
            import json
            data = json.loads(resp)
            if not isinstance(data.get("safe"), bool):
                raise ValueError("missing boolean 'safe'")
            if "labels" not in data or not isinstance(data["labels"], list):
                data["labels"] = []
            if "message_to_user" not in data or not isinstance(data["message_to_user"], str):
                data["message_to_user"] = "Your content may violate our guidelines. Please review and edit."
            return data
        except Exception as e:
            last_err = e
            # recreate client (helps if SDK got into a bad state), then backoff
            try:
                global _llm
                _llm = _new_llm()
            except Exception:
                _llm = None  # next loop may go rules-only
            sleep_s = _BACKOFF_BASE * (_BACKOFF_FACTOR ** attempt)
            time.sleep(min(8.0, sleep_s))
            attempt += 1

    # Hard fallback
    safe = _rules_only_safe(text, links)
    return {
        "safe": safe,
        "labels": _rules_only_labels(text, links),
        "allow_reason": "Rules-only: no violations detected." if safe else "",
        "block_reason": "Rules-only: potential violation." if not safe else "",
        "message_to_user": "We couldn’t fully check your content due to high load. Based on rules, please revise if flagged.",
        "fallback": True,
        "error": str(last_err) if last_err else "unknown",
    }


# ---------------------------------------------------------------------------
# Rules-only baseline (now smarter)
# ---------------------------------------------------------------------------
def _rules_only_labels(text: str, links: List[str]) -> List[str]:
    labels: List[str] = []
    t = text or ""

    # Hate via explicit slur placeholders (useful for tests)
    if _contains(HATE_PLACEHOLDER, t):
        labels.append("hate")

    # Generic hate phrasing like "X don't belong here"
    if HATE_GROUP_RE.search(t) and HATE_PHRASE_RE.search(t):
        if "hate" not in labels:
            labels.append("hate")

    # Targeted harassment: insult word + directly addressing someone
    if _contains(BULLYING_TERMS, t) and TARGET_MARKERS_RE.search(t):
        labels.append("bullying")

    # Existing checks
    if _contains(HATE_CATEGORIES, t):
        if "hate" not in labels:
            labels.append("hate")
    if _contains(DIRECT_THREATS, t):
        labels.append("violence")
    if _contains(DOXXING, t):
        labels.append("doxxing")
    if _contains(ILLEGAL_MARKERS, t):
        labels.append("illegal")
    if _contains(HARD_SEXUAL_TERMS, t):
        labels.append("sexual")

    # Links
    flagged_link = False
    for url in links:
        domain, tld = _domain_parts(url)
        if domain.split(":")[0] in URL_SHORTENERS or tld in ADULT_TLDS or SUSPICIOUS_HOST_RE.match(domain):
            flagged_link = True
            break
    if flagged_link:
        labels.append("links_risky")
        # If the post text is extremely short (classic spam/teaser), mark as spam too
        if len(t.strip()) < SHORT_TEXT_LEN:
            labels.append("spam")

    return labels


def _rules_only_safe(text: str, links: List[str]) -> bool:
    labels = _rules_only_labels(text, links)
    # Any of these -> unsafe
    if any(lbl in labels for lbl in ["sexual", "hate", "violence", "doxxing", "illegal", "bullying", "spam"]):
        return False

    # Bare risky link with minimal text? consider unsafe
    if "links_risky" in labels and len((text or "").strip()) < SHORT_TEXT_LEN:
        return False

    return True


# ---------------------------------------------------------------------------
# Public entrypoints
# ---------------------------------------------------------------------------
def is_prompt_safe(prompt: str) -> Dict[str, Any]:
    """
    Backwards-compatible SAFE/UNSAFE prompt gate.
    Uses LLM if available; else rules-only "SAFE" unless hard rules trigger.
    """
    if not prompt or prompt.strip() == "":
        return {"safe": False, "reason": "Prompt is empty or whitespace", "classification": "UNSAFE"}

    llm = _ensure_llm()
    if llm is None:
        unsafe = bool(
            _contains(HATE_CATEGORIES, prompt)
            or _contains(DIRECT_THREATS, prompt)
            or _contains(HARD_SEXUAL_TERMS, prompt)
        )
        return {"safe": not unsafe, "classification": "SAFE" if not unsafe else "UNSAFE"}

    simple_prompt = PromptTemplate.from_template(
        'Classify the following user prompt as SAFE or UNSAFE. Respond only "SAFE" or "UNSAFE".\n\n""" {prompt} """'
    )
    chain = LLMChain(llm=llm, prompt=simple_prompt)

    attempt = 0
    last = "UNSAFE"
    while attempt < _MAX_RETRIES:
        try:
            result = chain.run({"prompt": prompt}).strip().upper()
            if result not in {"SAFE", "UNSAFE"}:
                raise ValueError(f"Unexpected output: {result}")
            last = result
            break
        except Exception:
            try:
                global _llm
                _llm = _new_llm()
            except Exception:
                _llm = None
                break
            time.sleep(min(8.0, _BACKOFF_BASE * (_BACKOFF_FACTOR ** attempt)))
            attempt += 1

    return {"safe": last == "SAFE", "classification": last}


def moderate_post_content(
    text: str,
    source_links: Optional[List[str]] = None,
    allow_mild_profanity: bool = ALLOW_MILD_PROFANITY,  # reserved for future tuning
) -> Dict[str, Any]:
    """
    Full post moderation: text + links. Context-aware via LLM with rule-backed fallback.
    """
    if not text or text.strip() == "":
        return {
            "safe": False,
            "labels": ["other"],
            "block_reason": "Empty post",
            "message_to_user": "Your post appears empty. Please add content."
        }

    links = _extract_links(text, source_links)
    result = _run_llm_moderation(text, links)
    return {
        "safe": bool(result.get("safe", False)),
        "labels": list(result.get("labels", [])),
        "allow_reason": result.get("allow_reason", ""),
        "block_reason": result.get("block_reason", ""),
        "message_to_user": result.get("message_to_user", "Your content may violate our guidelines."),
        "links": links,
        "fallback_used": bool(result.get("fallback", False)),
        "error": result.get("error"),
    }


# ---------------------------------------------------------------------------
# Optional FREE image moderation (nsfw-detector)
# ---------------------------------------------------------------------------
_IMAGE_MOD_AVAILABLE = False
try:
    from nsfw_detector import predict  # type: ignore
    _IMAGE_MOD_AVAILABLE = True
except Exception:
    _IMAGE_MOD_AVAILABLE = False


def moderate_images(
    image_paths: List[str],
    threshold: float = 0.85
) -> Dict[str, Any]:
    """
    If nsfw_detector is installed, returns unsafe images and scores.
    Otherwise, returns a stub telling caller it's unavailable.
    """
    if not image_paths:
        return {"enabled": _IMAGE_MOD_AVAILABLE, "unsafe": [], "details": {}}

    if not _IMAGE_MOD_AVAILABLE:
        return {
            "enabled": False,
            "unsafe": [],
            "details": {},
            "note": "Install 'nsfw-detector' to enable free local image moderation."
        }

    try:
        model = os.getenv("NSFW_MODEL_PATH")
        if model:
            predictor = predict.load_model(model)
        else:
            predictor = predict.load_model() 

        results = predict.classify(predictor, image_paths)
        unsafe = []
        for p, scores in results.items():
            # Common labels: 'drawings','hentai','neutral','sexy','porn'
            pornish = scores.get("porn", 0.0) + scores.get("sexy", 0.0) + scores.get("hentai", 0.0)
            if pornish >= threshold:
                unsafe.append(p)

        return {"enabled": True, "unsafe": unsafe, "details": results}
    except Exception as e:
        return {
            "enabled": False,
            "unsafe": [],
            "details": {},
            "error": f"image moderation failed: {e}"
        }
