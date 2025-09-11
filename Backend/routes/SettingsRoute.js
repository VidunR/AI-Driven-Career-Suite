import { Router } from "express";
import { deleteAccount, getNotificationDetails, getPreference, getPrivacyDetails, saveSettings } from "../controllers/SettingsController.js";
import { authenticateToken } from "../middleware/AuthMiddleWare.js";

const router = Router();

// Notification Details
router.get('/notifications', authenticateToken , getNotificationDetails);

// Privacy Details
router.get('/privacy', authenticateToken, getPrivacyDetails);

// Preference Details
router.get('/preference', authenticateToken, getPreference);

// Account
router.delete('/account', authenticateToken, deleteAccount)

// Settings before change
router.post('/update', authenticateToken, saveSettings);

export default router;