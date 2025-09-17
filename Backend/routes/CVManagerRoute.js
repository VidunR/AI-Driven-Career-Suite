import { Router } from "express";
import { authenticateToken } from "../middleware/AuthMiddleWare.js";
import { deleteCV, getCVs } from "../controllers/CVManagerController.js";

const router = Router();

// get all cvs
router.get('', authenticateToken, getCVs);

// Login user
router.delete('/{:cvID}', authenticateToken, deleteCV);

export default router;