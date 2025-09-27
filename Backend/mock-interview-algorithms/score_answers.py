#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys, json, requests

# DEV key (hardcoded for now) – move to env for prod
GROQ_API_KEY = "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"
GROQ_COMPLETIONS_URL = "https://api.groq.com/openai/v1/completions"
HEADERS = {"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"}

SCORING_GUIDE = """
You are an experienced hiring manager. For each answer, score on:
- Relevance (0-5)
- Clarity/Structure (0-5)
- Specificity/Examples (0-5)
- Technical Accuracy (0-5) or domain correctness if not technical
- Communication/Tone (0-5)
Rules:
- Penalize profanity and call it out.
- Be concise but specific. Use the job role context.
- Return STRICT JSON only.
For each question, return:
- score_breakdown {relevance, clarity, specificity, accuracy, communication} (0..5)
- total_score 0..100 (weight relevance & specificity higher)
- brief_feedback (2–3 sentences)
- improvement_tip (one actionable suggestion)
Also return "overall": { average_score, summary (2–3 sentences), next_steps [3 tips] }.
"""

def build_prompt(job_role, items):
    header = f"ROLE: {job_role}\n{SCORING_GUIDE}\n\n"
    body = []
    for i, it in enumerate(items, start=1):
        q = (it.get("questionText") or "").strip()
        a = (it.get("answer") or "").strip()
        t = it.get("secondsSpent") or 0
        body.append(f"Q{i}: {q}\nA{i}: {a}\nTimeSpentSec: {t}\n")
    tail = """
Return JSON exactly like:
{
  "per_question": [
    {
      "questionId": "string",
      "score_breakdown": {"relevance":0,"clarity":0,"specificity":0,"accuracy":0,"communication":0},
      "total_score": 0,
      "brief_feedback": "",
      "improvement_tip": ""
    }
  ],
  "overall": { "average_score": 0, "summary": "", "next_steps": ["","",""] }
}
"""
    return header + "\n".join(body) + tail

def main():
    try:
        payload = json.loads(sys.stdin.read() or "{}")
    except Exception as e:
        print(json.dumps({"error": f"bad_input:{e}"})); sys.exit(1)

    job = payload.get("jobRole") or "General"
    responses = payload.get("responses") or []
    if not responses:
        print(json.dumps({"error":"no_responses"})); sys.exit(0)

    prompt = build_prompt(job, responses)

    try:
        r = requests.post(
            GROQ_COMPLETIONS_URL,
            headers=HEADERS,
            json={"model":"openai/gpt-oss-20b","prompt":prompt,"max_tokens":1200,"temperature":0.2},
            timeout=90
        )
        r.raise_for_status()
        data = r.json()
        text = (data.get("choices") or [{}])[0].get("text","").strip()
    except Exception as e:
        print(json.dumps({"error":"groq_request_failed","detail":str(e)})); sys.exit(2)

    try:
        result = json.loads(text)
    except Exception:
        result = {"raw": text}

    # backfill ids + average
    qids = [it.get("questionId") for it in responses]
    if isinstance(result.get("per_question"), list):
        for i, item in enumerate(result["per_question"]):
            if "questionId" not in item:
                item["questionId"] = qids[i] if i < len(qids) else f"q{i+1}"

    if "overall" in result and "average_score" not in result["overall"]:
        scores = [int(p.get("total_score",0) or 0) for p in result.get("per_question",[]) if isinstance(p,dict)]
        if scores:
            result["overall"]["average_score"] = round(sum(scores)/len(scores))

    print(json.dumps(result, ensure_ascii=False))

if __name__ == "__main__":
    main()
