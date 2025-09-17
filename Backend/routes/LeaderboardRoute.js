import { Router } from "express";
import { authenticateToken } from "../middleware/AuthMiddleWare.js";
import { getAllTimeRank, getMonthlyRank, getWeeklyRank } from "../controllers/LeaderboardController.js";

const router = Router();

// Weekly Leaderboard
router.get('/weekly', authenticateToken , getWeeklyRank);

// Monthly Leaderboard
router.get('/monthly', authenticateToken , getMonthlyRank);

// Alltime Leaderboard
router.get('/alltime', authenticateToken , getAllTimeRank);

export default router;