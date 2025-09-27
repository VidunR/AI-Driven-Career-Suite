import { Router } from "express";
import { authenticateToken } from "../middleware/AuthMiddleWare.js";
import { createInterviewResults, getInterviewResults } from "../controllers/InterviewResultController.js";

const router = Router();

router.get('/:interviewID', authenticateToken, getInterviewResults);
router.post('/:interviewID', authenticateToken, createInterviewResults);

export default router;
