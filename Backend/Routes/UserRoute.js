import { deleteUser, getUserDetails, updateUser } from "../controllers/UserController.js";
import { Router } from "express";

const router = Router();

// Get user details by ID
router.get(`/:id`, getUserDetails);

// Update user details
router.put(`/:id`, updateUser)

// Delete user details
router.delete(`/:id`, deleteUser);

export default router;