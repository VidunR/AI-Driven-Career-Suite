import { Router } from "express";
import { authenticateToken } from "../middleware/AuthMiddleWare.js";
import { createInterviewResults, getInterviewResults } from "../controllers/InterviewResultController.js";

const router = Router();

// Get: /interviewresult/{:interviewID}
router.get('/{:interviewID}', authenticateToken, getInterviewResults);

// Post: /interviewresult/{:interviewID}
router.post('/{:interviewID}', authenticateToken, createInterviewResults);

export default router;