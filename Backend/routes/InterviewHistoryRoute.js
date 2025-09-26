import { Router } from "express";
import { deleteInterview, getInterviewHistoryDetails } from "../controllers/InterviewHistoryController.js";
import { authenticateToken } from "../middleware/AuthMiddleWare.js";

const router = Router();

// Register Interview
router.get('', authenticateToken, getInterviewHistoryDetails);

// Delete Interview
router.delete('', authenticateToken, deleteInterview);

export default router;