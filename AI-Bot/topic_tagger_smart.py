# topic_tagger_smart.py
import json
import re
from typing import List, Dict
from fastapi import HTTPException
from langchain.prompts import PromptTemplate
from langchain_together import ChatTogether

# Use a smaller model for classification to avoid free-tier rate limits.
TAGGER_MODEL = "meta-llama/Llama-3.2-3B-Instruct"  # change if unavailable

tagger_llm = ChatTogether(
    model=TAGGER_MODEL,
    temperature=0.2
)

SMART_TAG_PROMPT = """
You are a topic assigner. You are given:
1) a post's text
2) a list of existing topics (controlled vocabulary)

Your job:
- Return up to {max_topics} topics for this post.
- Prefer choosing from the existing topics list when a good match exists.
- Only include "new" topics if no existing topic fits well.
- All topics lowercased, single or double-word strings.

Output ONLY a JSON object, nothing else, with exactly:
{{
  "selected": ["topic_from_existing", ...],
  "new": ["new_topic_if_needed", ...]
}}

existing_topics = {existing_topics}

text = \"\"\"{text}\"\"\"
"""

prompt = PromptTemplate.from_template(SMART_TAG_PROMPT)
chain = prompt | tagger_llm


def _extract_json_object(s: str) -> str:
    """
    Try to pull the first top-level JSON object from a messy LLM string.
    """
    # Quick-path: if it already parses, use it.
    try:
        json.loads(s)
        return s
    except Exception:
        pass

    # Look for a {...} block with a basic regex (non-greedy).
    # This won't handle nested braces perfectly but works well for flat payloads.
    m = re.search(r"\{.*\}", s, flags=re.DOTALL)
    if m:
        candidate = m.group(0)
        # Try tightening by removing trailing junk after last closing brace
        last_brace = candidate.rfind("}")
        if last_brace != -1:
            candidate = candidate[:last_brace+1]
        # Validate
        try:
            json.loads(candidate)
            return candidate
        except Exception:
            pass

    raise ValueError("No valid JSON object found in model output")


def _fallback_keyword_match(text: str, existing_topics: List[str], max_topics: int) -> List[str]:
    """
    Very simple fallback: choose topics that appear as whole words in the text
    (or whose tokens intersect strongly).
    """
    if not text:
        return []

    t = text.lower()
    tokens = set(re.findall(r"[a-z0-9]+", t))
    scored = []
    for topic in existing_topics:
        topic_l = topic.lower().strip()
        ttoks = set(re.findall(r"[a-z0-9]+", topic_l))
        # score = overlap ratio
        overlap = len(tokens.intersection(ttoks))
        if overlap > 0:
            scored.append((overlap, topic_l))
    # sort by overlap desc, then topic name asc for determinism
    scored.sort(key=lambda x: (-x[0], x[1]))
    return [name for _, name in scored[:max_topics]]


def smart_tag_topics(text: str, existing_topics: List[str], max_topics: int = 3) -> Dict[str, List[str]]:
    """
    Return {"selected": [...], "new": [...]} with robust JSON handling and a fallback.
    """
    if not text or not text.strip():
        return {"selected": [], "new": []}

    # Normalize existing topics
    existing_norm = sorted({t.strip().lower() for t in existing_topics if t and t.strip()})

    # 1) Try LLM route
    try:
        raw = chain.invoke({
            "text": text,
            "existing_topics": existing_norm,
            "max_topics": max_topics
        }).content

        cleaned = _extract_json_object(raw.strip())
        data = json.loads(cleaned)

        selected = [str(t).strip().lower() for t in data.get("selected", []) if str(t).strip()]
        new = [str(t).strip().lower() for t in data.get("new", []) if str(t).strip()]

        # Move any non-existing from selected -> new
        selected_final, new_final = [], []
        for s in selected:
            if s in existing_norm:
                selected_final.append(s)
            else:
                new_final.append(s)

        # Filter 'new' if they actually exist
        for n in new:
            if n not in existing_norm:
                new_final.append(n)

        # De-dup and enforce limits
        def dedup_keep_order(seq): 
            seen = set(); out = []
            for x in seq:
                if x not in seen:
                    out.append(x); seen.add(x)
            return out

        selected_final = dedup_keep_order(selected_final)[:max_topics]
        remaining = max(0, max_topics - len(selected_final))
        new_final = dedup_keep_order(new_final)[:remaining]

        return {"selected": selected_final, "new": new_final}

    except Exception as e:
        # 2) Fallback to keyword match
        try:
            sel = _fallback_keyword_match(text, existing_norm, max_topics)
            return {"selected": sel, "new": []}
        except Exception as inner:
            # If even fallback fails, surface a clean 500 with a hint
            raise HTTPException(
                status_code=500, 
                detail=f"Topic tagging failed. Model error: {str(e)}; Fallback error: {str(inner)}"
            )
