import { Router } from "express";
import { createAchievementDetails, createEducationDetails, createExperienceDetails, createProjectDetails, createSkillsDetails, deleteAchievementDetails, deleteEducationDetails, deleteExperienceDetails, deleteProjectDetails, deleteSkillDetails, getAchievementDetails, getEducationDetails, getExperienceDetails, getProjectDetails, getSkillsDetails, getUserDetails, saveCV } from "../controllers/CvBuilderController.js";
import { authenticateToken } from "../middleware/AuthMiddleWare.js";

const router = Router();

// Save generated CV
router.post('/saveCV', authenticateToken, saveCV);

// Personal Details
// GET:
router.get('/user', authenticateToken, getUserDetails);

// Education
// GET:
router.get('/education', authenticateToken, getEducationDetails);

// POST:
router.post('/education', authenticateToken, createEducationDetails);

// Delete:
router.delete('/education/{:educationID}', authenticateToken, deleteEducationDetails);

// Experience
// GET
router.get('/experience', authenticateToken, getExperienceDetails);

// POST:
router.post('/experience', authenticateToken, createExperienceDetails);

// Delete:
router.delete('/experience/{:experienceID}', authenticateToken, deleteExperienceDetails);

// Skills
// GET
router.get('/skills', authenticateToken, getSkillsDetails);

// POST
router.post('/skills', authenticateToken, createSkillsDetails);

// DELETE
router.delete('/skills/{:skillID}', authenticateToken, deleteSkillDetails);

// Achievements
// GET
router.get('/achievement', authenticateToken, getAchievementDetails);

// POST:
router.post('/achievement', authenticateToken, createAchievementDetails);

// Delete:
router.delete('/achievement/{:achievementID}', authenticateToken, deleteAchievementDetails);

// Project
// GET:
router.get('/project', authenticateToken, getProjectDetails);

// POST:
router.post('/project', authenticateToken, createProjectDetails);

// Delete:
router.delete('/project/{:projectID}', authenticateToken, deleteProjectDetails);


export default router;