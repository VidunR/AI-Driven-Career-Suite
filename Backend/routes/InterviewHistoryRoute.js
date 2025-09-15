import { Router } from "express";
import { getInterviewHistoryDetails } from "../controllers/InterviewHistoryController.js";
import { authenticateToken } from "../middleware/AuthMiddleWare.js";

const router = Router();

// Register User
router.get('', authenticateToken, getInterviewHistoryDetails);

export default router;