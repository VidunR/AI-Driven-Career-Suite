import prisma from "../config/db.js";

// Get: /settings:id
export const getNotificationDetails = async (req, res) => {

    const {userID} = req.params;

    const notificationResults = await prisma.settingsPreference.findUnique({
        where: {userID: parseInt(userID)},
        select: {
            emailNotification: true,
            pushNotification: true,
            interviewReminder: true,
            productUpdate: true
        }
    });
}