import { Router } from "express";
import { authenticateToken } from "../middleware/AuthMiddleWare.js";
import { createInterview, updateInterview } from "../controllers/InterviewController.js";

const router = Router();

// post: /interview
router.post('', authenticateToken, createInterview);

// put: /interview
router.put('/{:interviewID}', authenticateToken, updateInterview)

export default router;