import { googleLogin, userLoginRequest, userRegistrationRequest } from "../controllers/AuthController.js";
import { Router } from "express";

const router = Router();

// Register User
router.post('/register', userRegistrationRequest);

// Login user
router.post('/login', userLoginRequest);

export default router;