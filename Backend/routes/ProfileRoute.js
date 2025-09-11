import { Router } from "express";
import { authenticateToken } from "../middleware/AuthMiddleWare.js";
import { editUserDetails, getPersonalDetails, getSkillDetails, getUserOverview } from "../controllers/ProfileController.js";

const router = Router();

// Overview Details
router.get('/overview', authenticateToken , getUserOverview);

// Personal Details
router.get('/personal', authenticateToken, getPersonalDetails);

// Update Details
router.put('/personal', authenticateToken, editUserDetails);

// Skills Details
router.get('/skills', authenticateToken, getSkillDetails)

export default router;