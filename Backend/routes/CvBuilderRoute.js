import { Router } from "express";
import {
  saveCV,
  getUserDetails,
  getEducationDetails,
  createEducationDetails,
  deleteEducationDetails,
  getExperienceDetails,
  createExperienceDetails,
  deleteExperienceDetails,
  getSkillsDetails,
  createSkillsDetails,
  deleteSkillDetails,
  getAchievementDetails,
  createAchievementDetails,
  deleteAchievementDetails,
  getProjectDetails,
  createProjectDetails,
  deleteProjectDetails,
} from "../controllers/CvBuilderController.js";
import { authenticateToken } from "../middleware/AuthMiddleWare.js";

const router = Router();

// Save generated CV
router.post("/saveCV", authenticateToken, saveCV);

// Personal
router.get("/user", authenticateToken, getUserDetails);

// Education
router.get("/education", authenticateToken, getEducationDetails);
router.post("/education", authenticateToken, createEducationDetails);
router.delete("/education/:educationID", authenticateToken, deleteEducationDetails);

// Experience
router.get("/experience", authenticateToken, getExperienceDetails);
router.post("/experience", authenticateToken, createExperienceDetails);
router.delete("/experience/:experienceID", authenticateToken, deleteExperienceDetails);

// Skills
router.get("/skills", authenticateToken, getSkillsDetails);
router.post("/skills", authenticateToken, createSkillsDetails);
router.delete("/skills/:skillID", authenticateToken, deleteSkillDetails);

// Achievement
router.get("/achievement", authenticateToken, getAchievementDetails);
router.post("/achievement", authenticateToken, createAchievementDetails);
router.delete("/achievement/:achievementID", authenticateToken, deleteAchievementDetails);

// Project
router.get("/project", authenticateToken, getProjectDetails);
router.post("/project", authenticateToken, createProjectDetails);
router.delete("/project/:projectID", authenticateToken, deleteProjectDetails);

export default router;
