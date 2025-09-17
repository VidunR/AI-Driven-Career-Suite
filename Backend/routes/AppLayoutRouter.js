import { Router } from "express";
import { authenticateToken } from "../middleware/AuthMiddleWare.js";
import { getAppLayoutDetails } from "../controllers/AppLayoutController.js";

const router = Router();

// Layout Details
router.get('', authenticateToken, getAppLayoutDetails);

export default router;