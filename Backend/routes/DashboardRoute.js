import { getDashboardDetails } from "../controllers/DashboardController.js";
import { Router } from "express";
import { authenticateToken } from "../middleware/AuthMiddleWare.js";

const router = Router();
router.get('', authenticateToken, getDashboardDetails);

export default router;