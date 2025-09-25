// Backend/routes/InterviewRoute.js
import { Router } from "express";
import multer from "multer";
import fs from "node:fs";
import path from "node:path";
import { authenticateToken } from "../middleware/AuthMiddleWare.js";
import { createInterview, updateInterview } from "../controllers/InterviewController.js";
import { sendTransible } from "../controllers/InterviewTranscribeController.js";
import { evaluateInterviewAndSaveRaw } from "../controllers/InterviewEvaluateController.js";

const router = Router();

/**
 * Multer upload — route-level (single source of truth).
 * Ensures the uploads directory exists and matches the key 'audio'.
 */
const uploadDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({ dest: uploadDir });

// POST: /interview
router.post("", authenticateToken, createInterview);

// PUT: /interview/:interviewID 
router.put("/:interviewID", authenticateToken, updateInterview);

// POST: /interview/transcribe
router.post("/transcribe", authenticateToken, upload.single("audio"), sendTransible);

// POST: /interview/evaluate
router.post("/evaluate", authenticateToken, evaluateInterviewAndSaveRaw);

export default router;
