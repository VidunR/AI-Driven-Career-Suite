import { Router } from "express";
import { authenticateToken } from "../middleware/AuthMiddleWare.js";
import { getCVs, deleteCV, uploadCV, getCVDetails } from "../controllers/CVManagerController.js";
import { upload } from "../middleware/upload.js";

const router = Router();

// list CVs for current user
router.get("/", authenticateToken, getCVs);

// show one cv
router.get("/:cvID", authenticateToken, getCVDetails);

// upload a CV file
router.post("/upload", authenticateToken, upload.single("file"), uploadCV);

// delete a CV
router.delete("/:cvID", authenticateToken, deleteCV);

export default router;
