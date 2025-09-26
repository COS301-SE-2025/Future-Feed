# moderation.py
import os
import re
import time
import json
from typing import List, Optional, Tuple, Dict, Any

# LangChain (LCEL) — avoids deprecated LLMChain.run
from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

# ---------------------------------------------------------------------------
# Env bridge: langchain_together may build an OpenAI-style client under the hood.
# Mirror TOGETHER_API_KEY -> OPENAI_API_KEY if only Together key is set.
# ---------------------------------------------------------------------------
if not os.getenv("OPENAI_API_KEY") and os.getenv("TOGETHER_API_KEY"):
    os.environ["OPENAI_API_KEY"] = os.environ["TOGETHER_API_KEY"]

# Import AFTER env is bridged
try:
    from langchain_together import ChatTogether
except Exception:
    ChatTogether = None  # type: ignore

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
MODEL = os.getenv("MODERATION_MODEL", "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free")
TEMPERATURE = float(os.getenv("MODERATION_TEMP", "0.0"))
MAX_RETRIES = int(os.getenv("MODERATION_MAX_RETRIES", "3"))
BACKOFF_BASE = float(os.getenv("MODERATION_BACKOFF_BASE", "0.8"))
BACKOFF_FACTOR = float(os.getenv("MODERATION_BACKOFF_FACTOR", "2.0"))
TIMEOUT_SECS = int(os.getenv("MODERATION_TIMEOUT_SECS", "45"))
FORCE_RULES_ONLY = os.getenv("MODERATION_FORCE_RULES_ONLY", "").strip() not in {"", "0", "false", "False"}

_llm = None  # lazy

def _new_llm():
    if ChatTogether is None:
        raise RuntimeError("langchain_together not available")
    return ChatTogether(model=MODEL, temperature=TEMPERATURE, request_timeout=TIMEOUT_SECS)

def _ensure_llm():
    """Create client on first use; if missing API key or forced rules, return None for rules-only."""
    if FORCE_RULES_ONLY:
        return None
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

HARD_SEXUAL_TERMS = [r"\b(child\s*sex|cp|child\s*porn|underage\s*sex|rape|incest)\b"]
# Minor + sexual (distinct label)
MINOR_SEXUAL_TERMS = [
    r"\b(child(?:ren)?|minor(?:s)?|under[-\s]*age|teen(?:ager)?s?)\b.*\b(sex|porn|sexual|explicit)\b",
    r"\b(sex|porn|sexual|explicit)\b.*\b(child(?:ren)?|minor(?:s)?|under[-\s]*age|teen(?:ager)?s?)\b",
]
DIRECT_THREATS = [r"\b(kill(?:\s*yourself|\s+him|\s+her)|i(?:'|’)m\s+going\s+to\s+kill|i\s+will\s+hurt)\b"]
HATE_CATEGORIES = [r"\b(kike|nigg[ae]r|faggot|tranny)\b"]  # expand as needed
DOXXING = [r"\b(address|home\s+address|credit\s*card|card\s*number|ssn|id\s*number)\b.*\b(is|=|:)\b"]
ILLEGAL_MARKERS = [r"\b(sell(?:ing)?\s*drugs|buy\s*weapons|stolen\s*card)\b"]

# URLs / domains
URL_SHORTENERS = {"bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd", "buff.ly"}
ADULT_TLDS = {".xxx"}
SUSPICIOUS_HOST_RE = re.compile(r"^\d{1,3}(\.\d{1,3}){3}$")
URL_RE = re.compile(r"\bhttps?://[^\s)]+", flags=re.IGNORECASE)

# Bullying / hate heuristics (rules-only mode)
BULLYING_TERMS = [r"\b(loser|idiot|moron|worthless|pathetic|dumbass|trash|garbage|kill\s*yourself)\b"]
TARGET_MARKERS_RE = re.compile(r"(@[A-Za-z0-9_]+|\byou\b)", re.IGNORECASE)
HATE_PLACEHOLDER = [r"<\s*slur\s*>", r"\bracial\s+slur\b"]
HATE_GROUP_TERMS = [
    r"immigrants", r"jews?", r"muslims?", r"christians?",
    r"asians?", r"latinos?", r"africans?", r"blacks?", r"whites?",
    r"gays?", r"lesbians?", r"trans(?:gender|)\b", r"women", r"men"
]
HATE_GROUP_RE = re.compile(r"\b(" + "|".join(HATE_GROUP_TERMS) + r")\b", re.IGNORECASE)
HATE_PHRASE_RE = re.compile(r"\b(do\s*not|don'?t)\s+belong\s+here\b", re.IGNORECASE)

# Very short “teaser” text threshold for risky links (spammy)
SHORT_TEXT_LEN = 20

# Minor-condemnation allowlist (to avoid blocking clearly critical/condemning discussions)
MINOR_CONDEMNATION_TERMS = [
    r"\b(ban|banned|prohibit|prohibited|illegal|not\s+allowed|report|reported|reporting|zero[-\s]*tolerance|against|oppose|stop|combat|fight|crack\s*down|remove|take\s*down|block|censor|moderate)\b"
]

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _contains(patterns: List[str], text: str) -> Optional[str]:
    for pat in patterns:
        if re.search(pat, text or "", flags=re.IGNORECASE):
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

def _condemns_minors_sex(text: str) -> bool:
    return bool(re.search("|".join(MINOR_CONDEMNATION_TERMS), text or "", flags=re.IGNORECASE))

# ---------------------------------------------------------------------------
# Prompt (contextual moderation) — JSON-only contract
# ---------------------------------------------------------------------------
LLM_PROMPT = PromptTemplate.from_template(
    """You are a careful, context-aware content moderator for a social platform.
Return ONLY a single JSON object. No explanations, no code fences, no extra text.

Hard rule:
- Any sexual content involving minors is DISALLOWED unless the text is clearly condemning it (e.g., calling to ban, report, or remove). Neutral/supportive references MUST be blocked.

General rules:
- Allow mild profanity (e.g., "damn", "hell", casual swearing without targeting).
- Block bullying/harassment (targeted insults, slurs at a person/group).
- Block hate speech.
- Block explicit sexual content or sexual content involving minors.
- Block sexual solicitation, pornographic descriptions, or graphic sexual acts.
- Block credible threats or calls for violence.
- Block doxxing (posting private personal data).
- Block illegal solicitation (weapons, stolen cards, hard drugs).
- Links: flag if explicit porn, known shorteners without context, or obviously malicious hosts.
- Consider context and quotes. If the user condemns bad content, that is OK.

Respond with this JSON shape ONLY:
{{
  "safe": boolean,
  "labels": array of strings in ["bullying","hate","sexual","sexual_minors","violence","doxxing","illegal","spam","links_risky","other"],
  "allow_reason": string,
  "block_reason": string,
  "message_to_user": string
}}

POST TEXT:
\"\"\"{text}\"\"\"

SOURCE LINKS:
{links}
"""
)

# ---------------------------------------------------------------------------
# JSON extraction/repair (handles code fences / trailing prose)
# ---------------------------------------------------------------------------
def _coerce_json(text: str) -> Dict[str, Any]:
    s = (text or "").strip()
    # strip fenced blocks ```json ... ``` or ``` ... ```
    if s.startswith("```"):
        s = s.strip("`")
    # find first {...} balanced object
    start = s.find("{")
    if start == -1:
        raise ValueError("no JSON object start")
    depth = 0
    end = -1
    for i, ch in enumerate(s[start:], start):
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                end = i + 1
                break
    if end == -1:
        raise ValueError("unterminated JSON object")
    candidate = s[start:end]
    return json.loads(candidate)

# ---------------------------------------------------------------------------
# LLM run with backoff + JSON guard + hard overrides
# ---------------------------------------------------------------------------
def _run_llm_moderation(text: str, links: List[str]) -> Dict[str, Any]:
    llm = _ensure_llm()
    if llm is None:
        # Rules-only fallback (no key or forced rules)
        safe = _rules_only_safe(text, links)
        return {
            "safe": safe,
            "labels": _rules_only_labels(text, links),
            "allow_reason": "Rules-only: no violations detected." if safe else "",
            "block_reason": "Rules-only: potential violation." if not safe else "",
            "message_to_user": "We couldn’t fully check your content due to limited availability. Based on rules, please revise if flagged.",
            "fallback": True,
            "error": "LLM unavailable",
        }

    chain = LLM_PROMPT | llm | StrOutputParser()

    last_err = None
    for attempt in range(MAX_RETRIES):
        try:
            raw = chain.invoke({"text": text, "links": links})
            data = _coerce_json(raw)

            # Minimal schema guard
            if not isinstance(data.get("safe"), bool):
                raise ValueError("missing boolean 'safe'")
            if "labels" not in data or not isinstance(data["labels"], list):
                data["labels"] = []
            if "message_to_user" not in data or not isinstance(data["message_to_user"], str):
                data["message_to_user"] = "Your content may violate our guidelines. Please review and edit."

            # --- HARD OVERRIDE: sexual content involving minors ---
            # If heuristics detect minors + sexual, and the text does NOT clearly condemn it,
            # force unsafe regardless of the LLM classification.
            rs_labels = _rules_only_labels(text, links)
            if "sexual_minors" in rs_labels and not _condemns_minors_sex(text):
                data["safe"] = False
                if "sexual_minors" not in data.get("labels", []):
                    data.setdefault("labels", []).append("sexual_minors")
                if not data.get("block_reason"):
                    data["block_reason"] = "Sexual content referencing minors is disallowed."
                if not data.get("message_to_user"):
                    data["message_to_user"] = (
                        "We strictly prohibit any sexual content involving minors. "
                        "Please remove or rephrase this content."
                    )

            return data

        except Exception as e:
            last_err = e
            # Recreate client if SDK glitched, then backoff
            try:
                global _llm
                _llm = _new_llm()
            except Exception:
                _llm = None  # next loop may go rules-only
            sleep_s = BACKOFF_BASE * (BACKOFF_FACTOR ** attempt)
            time.sleep(min(8.0, sleep_s))

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
# Rules-only baseline (smarter)
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

    # Threats etc.
    if _contains(DIRECT_THREATS, t):
        labels.append("violence")
    if _contains(DOXXING, t):
        labels.append("doxxing")
    if _contains(ILLEGAL_MARKERS, t):
        labels.append("illegal")

    # Sexual minors vs sexual
    if _contains(MINOR_SEXUAL_TERMS, t):
        labels.append("sexual_minors")
    elif _contains(HARD_SEXUAL_TERMS, t):
        labels.append("sexual")

    # Slurs (explicit list)
    if _contains(HATE_CATEGORIES, t):
        if "hate" not in labels:
            labels.append("hate")

    # Links
    flagged_link = False
    for url in links:
        domain, tld = _domain_parts(url)
        if domain.split(":")[0] in URL_SHORTENERS or tld in ADULT_TLDS or SUSPICIOUS_HOST_RE.match(domain):
            flagged_link = True
            break
    if flagged_link:
        labels.append("links_risky")
        if len(t.strip()) < SHORT_TEXT_LEN:
            labels.append("spam")

    return labels

def _rules_only_safe(text: str, links: List[str]) -> bool:
    labels = _rules_only_labels(text, links)
    # Any of these -> unsafe
    if any(lbl in labels for lbl in ["sexual", "sexual_minors", "hate", "violence", "doxxing", "illegal", "bullying", "spam"]):
        return False
    # Bare risky link with minimal text? unsafe
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
            or _contains(MINOR_SEXUAL_TERMS, prompt)
            or _contains(HARD_SEXUAL_TERMS, prompt)
        )
        return {"safe": not unsafe, "classification": "SAFE" if not unsafe else "UNSAFE"}

    simple = PromptTemplate.from_template(
        'Classify the following user prompt as SAFE or UNSAFE. Respond only "SAFE" or "UNSAFE".\n\n""" {prompt} """'
    )
    chain = simple | llm | StrOutputParser()

    last_err = None
    for attempt in range(MAX_RETRIES):
        try:
            result = (chain.invoke({"prompt": prompt}) or "").strip().upper()
            if result not in {"SAFE", "UNSAFE"}:
                raise ValueError(f"Unexpected output: {result}")
            return {"safe": result == "SAFE", "classification": result}
        except Exception as e:
            last_err = e
            try:
                global _llm
                _llm = _new_llm()
            except Exception:
                _llm = None
                break
            time.sleep(min(8.0, BACKOFF_BASE * (BACKOFF_FACTOR ** attempt)))

    # Fallback: rules-only
    unsafe = bool(
        _contains(HATE_CATEGORIES, prompt)
        or _contains(DIRECT_THREATS, prompt)
        or _contains(MINOR_SEXUAL_TERMS, prompt)
        or _contains(HARD_SEXUAL_TERMS, prompt)
    )
    return {"safe": not unsafe, "classification": "SAFE" if not unsafe else "UNSAFE", "error": str(last_err) if last_err else None}

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

def moderate_images(image_paths: List[str], threshold: float = 0.85) -> Dict[str, Any]:
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
            predictor = predict.load_model()  # type: ignore

        results = predict.classify(predictor, image_paths)
        unsafe = []
        for p, scores in results.items():
            # Common labels: 'drawings','hentai','neutral','sexy','porn'
            pornish = scores.get("porn", 0.0) + scores.get("sexy", 0.0) + scores.get("hentai", 0.0)
            if pornish >= threshold:
                unsafe.append(p)

        return {"enabled": True, "unsafe": unsafe, "details": results}
    except Exception as e:
        return {"enabled": False, "unsafe": [], "details": {}, "error": f"image moderation failed: {e}"}
