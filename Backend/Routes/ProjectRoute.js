import { getProjectDtails } from "../controllers/ProjectController.js";
import { Router } from "express";

const router = Router();

router.get(`/:id`, getProjectDtails);

export default router;