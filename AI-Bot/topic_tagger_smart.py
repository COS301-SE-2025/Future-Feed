# topic_tagger_smart.py
import json
import os
import re
from typing import List, Dict, Tuple
from fastapi import HTTPException
from langchain.prompts import PromptTemplate
from langchain_together import ChatTogether

from sentence_transformers import SentenceTransformer, util
import numpy as np


EMB_MODEL_NAME = os.getenv("TAGGER_EMB_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
HIGH_THRESHOLD = float(os.getenv("TAGGER_HIGH_THRESHOLD", "0.45"))   
LOW_THRESHOLD  = float(os.getenv("TAGGER_LOW_THRESHOLD", "0.22"))   
MAX_ENRICHED_PHRASES = int(os.getenv("TAGGER_MAX_ENRICHED", "4"))

_EMB_MODEL = SentenceTransformer(EMB_MODEL_NAME)

_LLM = ChatTogether(
    model=os.getenv("TAGGER_LLM_MODEL", "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free"),
    temperature=0.0
)

NEW_TOPIC_PROMPT = """
You are creating ONE short, human-meaningful topic for this post because none of the existing topics fit.

Rules:
- Output JSON ONLY: {{"new": "short_topic"}}
- 1–3 words, lowercase, no punctuation, no hashtags/emojis.
- Avoid generic adjectives like "amazing", "interesting", "today".
- It must be a real subject/category a user would follow, not a random adjective.

Post:
\"\"\"{text}\"\"\" 
"""
_new_topic_tmpl = PromptTemplate.from_template(NEW_TOPIC_PROMPT)

def _sanitize_new_topic(s: str) -> str:
    if not s:
        return ""
    s = s.strip().lower()
    s = re.sub(r"[^a-z0-9 ]+", "", s)
    s = re.sub(r"\s+", " ", s).strip()
    if len(s) < 3:
        return ""
    BAD = {
        "amazing", "interesting", "cool", "today", "breaking",
        "the", "this", "that", "these", "those", "news"
    }
    if s in BAD:
        return ""
    if s in {"update", "story", "post", "random"}:
        return ""
    return s

def _enrich_topic_phrases(t: str) -> List[str]:
    """
    Create generic paraphrases for each topic *without* hardcoding domain keywords.
    This improves semantic matching while staying topic-agnostic.
    """
    t = (t or "").strip()
    out = [t]

    out.append(f"this post is about {t}")
    out.append(f"{t} discussion")
    out.append(f"{t} topic")
    return out[:MAX_ENRICHED_PHRASES]

def _topic_best_similarity(text_emb: np.ndarray, topic: str) -> float:
    phrases = _enrich_topic_phrases(topic)
    emb = _EMB_MODEL.encode(phrases, normalize_embeddings=True)
    sims = util.cos_sim(text_emb, emb).cpu().numpy()[0]  
    return float(np.max(sims)) if sims.size else 0.0

def _pick_existing_by_embeddings(
    text: str,
    existing_topics: List[str],
    max_topics: int,
    hi: float,
    lo: float
) -> Tuple[List[str], List[float]]:
    """
    1) compute best sim for each topic using enriched phrases
    2) select all >= hi
    3) if none >= hi, pick top1 if >= lo
    """
    existing_topics = [t for t in existing_topics if t and str(t).strip()]
    if not existing_topics:
        return [], []

    text_emb = _EMB_MODEL.encode([text], normalize_embeddings=True)  # (1, d)

    scores = []
    for t in existing_topics:
        s = _topic_best_similarity(text_emb, t)
        scores.append(s)

    # Rank topics by similarity
    idxs = np.argsort(-np.array(scores))
    ranked = [(existing_topics[i], float(scores[i])) for i in idxs]

    # 1) strong matches
    strong = [(t, s) for (t, s) in ranked if s >= hi]
    if strong:
        return [t.strip().lower() for (t, _) in strong[:max_topics]], [s for (_, s) in strong[:max_topics]]

    # 2) nearest-neighbor fallback
    top_t, top_s = ranked[0]
    if top_s >= lo:
        return [top_t.strip().lower()], [top_s]

    return [], scores

def _fallback_compact_subject(text: str) -> str:
    t = text.lower()
    m = re.search(r"\b([a-z0-9]+(?: [a-z0-9]+)?)\b", t)
    if not m:
        return ""
    candidate = m.group(1)
    candidate = _sanitize_new_topic(candidate)
    return candidate

def _llm_new_topic(text: str) -> Dict[str, List[str]]:
    try:
        out = (_new_topic_tmpl | _LLM).invoke({"text": text}).content
        m = re.search(r"\{.*\}", out, re.DOTALL)
        if not m:
            raise ValueError("LLM did not return a JSON object")
        data = json.loads(m.group(0))
        cand = str(data.get("new", "")).strip()
        clean = _sanitize_new_topic(cand)
        if not clean:
            clean = _fallback_compact_subject(text)
        return {"selected": [], "new": [clean] if clean else []}
    except Exception as e:
        clean = _fallback_compact_subject(text)
        if clean:
            return {"selected": [], "new": [clean]}
        raise HTTPException(status_code=500, detail=f"new-topic LLM failed: {e}")

# -------------------------
# Public API
# -------------------------

def smart_tag_topics(text: str, existing_topics: List[str], max_topics: int = 3) -> Dict[str, List[str]]:
    """
    1) Semantic match to enriched topic phrases.
    2) If none are strong, still choose the nearest if it's reasonably close (LOW_THRESHOLD).
    3) Only if nothing is close, create a new topic via LLM (filtered).
    """
    if not text or not text.strip():
        return {"selected": [], "new": []}

    # Try semantic pick
    selected, _scores = _pick_existing_by_embeddings(
        text=text,
        existing_topics=existing_topics,
        max_topics=max_topics,
        hi=HIGH_THRESHOLD,
        lo=LOW_THRESHOLD
    )
    if selected:
        return {"selected": selected[:max_topics], "new": []}

    # Otherwise propose exactly one new topic
    return _llm_new_topic(text)
