import { googleLogin, linkedinLogin, userLoginRequest, userRegistrationRequest } from "../controllers/AuthController.js";
import { Router } from "express";

const router = Router();

// Register User
router.post('/register', userRegistrationRequest);

// Login user
router.post('/login', userLoginRequest);

// Google register/ login
router.post('/google', googleLogin);

// LinkedIn register/login
router.post('/linkedin', linkedinLogin);

export default router;