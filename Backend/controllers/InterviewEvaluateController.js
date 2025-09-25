// Backend/controllers/InterviewEvaluateController.js
import Groq from "groq-sdk";
import prisma from "../config/db.js";

const MODEL = "llama-3.3-70b-versatile";

// strong instruction to return minified JSON only
const SYSTEM_PROMPT =
  "You are an interview evaluator. " +
  "You will receive a jobRole and an array of user responses to 5 interview questions. " +
  "For EACH response, provide: score(0-100 int), a short feedback (<= 2 sentences), " +
  "up to 3 strengths, up to 3 improvements, and flags {off_topic, profanity}. " +
  "Then compute an overall summary and overall totalScore (the average, rounded). " +
  "Return ONLY a single minified JSON object (no code fences, no commentary) exactly matching: " +
  "{ " +
  '  \\"jobRole\\": string, ' +
  '  \\"perQuestion\\": [ { \\"id\\": string, \\"question\\": string, \\"answerSummary\\": string, \\"score\\": number, \\"strengths\\": string[], \\"improvements\\": string[], \\"flags\\": { \\"off_topic\\": boolean, \\"profanity\\": boolean } } ], ' +
  '  \\"overall\\": { \\"totalScore\\": number, \\"summary\\": string, \\"strengths\\": string[], \\"improvements\\": string[] } ' +
  "}";

function safeParseFirstJson(text) {
  if (!text) return null;
  try { return JSON.parse(text); } catch {}
  try { return JSON.parse(text.replace(/```json|```/g, "").trim()); } catch {}
  const m = text.match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch {} }
  return null;
}

function normalizeFeedback(raw, payload) {
  try {
    if (raw && raw.perQuestion && raw.overall && typeof raw.overall.totalScore !== "undefined") {
      return raw;
    }
    const responses = Array.isArray(payload?.responses) ? payload.responses : [];
    const list = Array.isArray(raw?.perQuestion)
      ? raw.perQuestion
      : (Array.isArray(raw?.per_question) ? raw.per_question : []);

    const perQuestion = list.map((item, idx) => {
      const fromReq = responses[idx] || {};
      const id = item.id || item.questionId || fromReq.questionId || `q${idx + 1}`;
      const question = item.question || fromReq.questionText || "";
      const answerSummary = item.answerSummary || item.brief_feedback || item.feedback || "";
      const score = typeof item.score === "number"
        ? item.score
        : (typeof item.total_score === "number" ? item.total_score : 0);
      const flags = item.flags || { off_topic: false, profanity: false };
      return {
        id,
        question,
        answerSummary,
        score,
        strengths: item.strengths || [],
        improvements: item.improvements || item.next_steps || [],
        flags: { off_topic: !!flags.off_topic, profanity: !!flags.profanity },
      };
    });

    const overall = raw?.overall || {};
    const totalScore = typeof overall.totalScore === "number"
      ? overall.totalScore
      : (typeof overall.average_score === "number" ? Math.round(overall.average_score) : 0);

    return {
      jobRole: raw.jobRole || payload?.jobRole || "Role",
      perQuestion,
      overall: {
        totalScore,
        summary: overall.summary || overall.brief_feedback || "",
        strengths: overall.strengths || [],
        improvements: overall.improvements || overall.next_steps || [],
      },
    };
  } catch {
    return {
      jobRole: payload?.jobRole || "Role",
      perQuestion: [],
      overall: { totalScore: 0, summary: "", strengths: [], improvements: [] },
      _error: "normalize_failed",
    };
  }
}

/**
 * KEEP AS-IS: existing normalized, non-persisting endpoint logic (with better error reporting)
 */
export const evaluateInterview = async (req, res) => {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    const payload = {
      jobRole: req.body?.jobRole,
      responses: req.body?.responses,
    };

    if (!apiKey) {
      console.error("[evaluateInterview] Missing GROQ_API_KEY");
      return res.status(200).json({
        jobRole: payload.jobRole || "Role",
        perQuestion: [],
        overall: { totalScore: 0, summary: "", strengths: [], improvements: [] },
        _error: "GROQ_API_KEY_missing_on_server",
      });
    }

    if (!payload.jobRole || !Array.isArray(payload.responses) || payload.responses.length === 0) {
      console.error("[evaluateInterview] Bad Request", {
        jobRole: payload.jobRole,
        responsesLen: Array.isArray(payload.responses) ? payload.responses.length : null
      });
      return res.status(200).json({
        jobRole: payload.jobRole || "Role",
        perQuestion: [],
        overall: { totalScore: 0, summary: "", strengths: [], improvements: [] },
        _error: "bad_request_missing_jobRole_or_responses",
      });
    }

    const client = new Groq({ apiKey });

    const userPayload = {
      jobRole: payload.jobRole,
      responses: payload.responses.map((r, i) => ({
        id: r.questionId || `q${i + 1}`,
        question: (r.questionText || "").trim(),
        answer: (r.answer || "").trim(),
        secondsSpent: Number(r.secondsSpent || 0),
      })),
    };

    let completion;
    try {
      completion = await client.chat.completions.create({
        model: MODEL,
        temperature: 0.2,
        max_tokens: 1500,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: "Evaluate this interview and return JSON only:\n" + JSON.stringify(userPayload) },
        ],
      });
    } catch (e) {
      console.error("[evaluateInterview] Groq API error:", e?.response?.data || e?.message || e);
      return res.status(200).json({
        jobRole: payload.jobRole,
        perQuestion: [],
        overall: { totalScore: 0, summary: "", strengths: [], improvements: [] },
        _error: "groq_api_error",
        _detail: String(e?.response?.data || e?.message || e),
      });
    }

    const content = completion?.choices?.[0]?.message?.content || "";
    console.log("[evaluateInterview] Groq content (first 500):", content.slice(0, 500));

    const parsed = safeParseFirstJson(content);
    if (!parsed) {
      console.error("[evaluateInterview] invalid_json_from_groq");
      return res.status(200).json({
        jobRole: payload.jobRole,
        perQuestion: [],
        overall: { totalScore: 0, summary: "", strengths: [], improvements: [] },
        _error: "invalid_json_from_groq",
        _raw: content,
      });
    }

    const normalized = normalizeFeedback(parsed, payload);
    return res.json(normalized);
  } catch (e) {
    console.error("[evaluateInterview] fatal error:", e);
    return res.status(200).json({
      jobRole: req.body?.jobRole || "Role",
      perQuestion: [],
      overall: { totalScore: 0, summary: "", strengths: [], improvements: [] },
      _error: "evaluation_failed",
      _detail: String(e),
    });
  }
};

/**
 * EXACT persistence flow (unchanged logic), but WITHOUT feedbackJson field
 * because your Interview model doesn't have it in the Prisma schema.
 */
export const evaluateInterviewAndSaveRaw = async (req, res) => {
  try {
    const { jobRole, responses, difficulty } = req.body || {};

    if (!jobRole || !Array.isArray(responses) || responses.length === 0) {
      console.error("[evaluateInterviewAndSaveRaw] bad_request", {
        jobRole,
        responsesLen: Array.isArray(responses) ? responses.length : null
      });
      return res.status(400).json({ error: "jobRole and responses are required" });
    }

    if (!process.env.GROQ_API_KEY) {
      console.error("[evaluateInterviewAndSaveRaw] Missing GROQ_API_KEY");
      return res.status(500).json({ error: "GROQ_API_KEY_missing_on_server" });
    }

    const strictSystemPrompt = [
      "You are an interview evaluator.",
      "You will receive a jobRole and an array of user responses to 5 interview questions.",
      "For EACH response, provide: score(0-100 int), a short feedback (<= 2 sentences),",
      "up to 3 strengths, up to 3 improvements, and flags {off_topic, profanity}.",
      "Then compute an overall summary and overall totalScore (the average, rounded).",
      "Return STRICTLY valid JSON ONLY (no backticks, no prose) in this schema:",
      "{",
      '  "jobRole": string,',
      '  "perQuestion": [',
      "     {",
      '       "id": string,',
      '       "question": string,',
      '       "answerSummary": string,',
      '       "score": number,',
      '       "strengths": string[],',
      '       "improvements": string[],',
      '       "flags": { "off_topic": boolean, "profanity": boolean }',
      "     }",
      "  ],",
      '  "overall": { "totalScore": number, "summary": string, "strengths": string[], "improvements": string[] }',
      "}"
    ].join(" ");

    const userPayload = {
      jobRole,
      responses: responses.map((r) => ({
        id: r.questionId,
        question: r.questionText,
        answer: r.answer,
        secondsSpent: r.secondsSpent ?? null
      }))
    };

    // ---- Groq call ----
    let raw, json;
    try {
      const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const completion = await client.chat.completions.create({
        model: MODEL,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: strictSystemPrompt },
          { role: "user", content: "Evaluate this interview and return JSON only:\n" + JSON.stringify(userPayload) }
        ]
      });

      raw = completion?.choices?.[0]?.message?.content ?? "";
      console.log("[evaluateInterviewAndSaveRaw] Groq raw (first 500):", String(raw).slice(0, 500));
      json = safeParseFirstJson(raw);
      if (!json) {
        console.error("[evaluateInterviewAndSaveRaw] invalid_json_from_groq");
        return res.status(502).json({ error: "invalid_json_from_groq", raw: String(raw).slice(0, 1000) });
      }
    } catch (e) {
      console.error("[evaluateInterviewAndSaveRaw] groq_api_error:", e?.response?.data || e?.message || e);
      return res.status(502).json({
        error: "groq_api_error",
        detail: String(e?.response?.data || e?.message || e)
      });
    }

    // ---- Prisma persistence ----
    try {
      const userId = req.user?.userId;
      if (userId) {
        const userIdNum = Number(userId);
        if (Number.isNaN(userIdNum)) {
          console.warn("[evaluateInterviewAndSaveRaw] Non-numeric userId; skipping DB persist:", userId);
        } else {
          // 1) Ensure InterviewJobRole
          let role = await prisma.interviewJobRole.findFirst({
            where: { jobRoleName: jobRole },
            select: { interviewJobRoleId: true }
          });
          if (!role) {
            role = await prisma.interviewJobRole.create({
              data: { jobRoleName: jobRole, jobRoleDescription: "" },
              select: { interviewJobRoleId: true }
            });
          }

          // 2) Create Interview (NO feedbackJson here)
          const totalSeconds = responses.reduce((sum, r) => sum + (Number(r.secondsSpent) || 0), 0);
          const durationMinutes = Math.max(1, Math.round(totalSeconds / 60));
          const totalScore = Number(json?.overall?.totalScore) || 0;

          const interview = await prisma.interview.create({
            data: {
              userId: userIdNum,
              interviewJobRoleId: role.interviewJobRoleId,
              interviewDate: new Date(),
              interviewDuration: durationMinutes,
              interviewScore: totalScore,
              completedPercentage: Math.round(totalScore),
              isCompleted: true,
              experienceLevel: String(difficulty || "mid"),
              // feedbackJson: json  // ← removed to match your schema
            },
            select: { interviewId: true }
          });

          // 3) Per-question rows + ensure VideoQuestion rows exist
          const perQuestion = Array.isArray(json?.perQuestion) ? json.perQuestion : [];
          for (let i = 0; i < responses.length; i++) {
            const r = responses[i];
            const pq = perQuestion[i] || {};

            let vq = await prisma.videoQuestion.findFirst({
              where: { question: r.questionText, interviewJobRoleId: role.interviewJobRoleId },
              select: { videoQuestionId: true }
            });

            if (!vq) {
              vq = await prisma.videoQuestion.create({
                data: {
                  question: r.questionText,
                  videoPath: r.videoPath || "",
                  interviewJobRoleId: role.interviewJobRoleId
                },
                select: { videoQuestionId: true }
              });
            }

            await prisma.interviewAnalysis.create({
              data: {
                interviewId: interview.interviewId,
                videoQuestionId: vq.videoQuestionId,
                userAnswer: (r.answer || "").slice(0, 65000),
                feedback: (pq.answerSummary || "").slice(0, 65000),
                scorePerQuestion: Number(pq.score) || 0
              }
            });
          }
        }
      }
    } catch (e) {
      console.error("[evaluateInterviewAndSaveRaw] prisma_error:", e);
      return res.status(500).json({
        error: "prisma_error",
        detail: String(e?.message || e)
      });
    }

    // ---- Success ----
    return res.json(json);
  } catch (err) {
    console.error("[evaluateInterviewAndSaveRaw] fatal error:", err);
    return res.status(500).json({ error: "Evaluation failed", detail: String(err?.message || err) });
  }
};
