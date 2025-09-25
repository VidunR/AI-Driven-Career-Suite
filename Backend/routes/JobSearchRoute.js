import { Router } from "express";
import { authenticateToken } from "../middleware/AuthMiddleWare.js";
import { extractSelectedCVJobs, getJobSearchCVs, } from "../controllers/JobSearchController.js";

const router = Router();

// get: /jobsearch
router.get('', authenticateToken, getJobSearchCVs);

// post: /jobsearch
router.post('', authenticateToken, extractSelectedCVJobs);

// get jobs using keywords
//router.get('/search', authenticateToken, getJobsWithoutExtract);

export default router;