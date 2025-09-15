import prisma from "../config/db.js";

// Used to get the preferenceId
const gettingPreferenceId = async (userId) => {
    try {
        const preference = await prisma.registeredUser.findUnique({
            where: { userId: parseInt(userId) },
            select: { preferenceId: true }
        });

        return preference?.preferenceId;
    } catch (err) {
        console.error("Error getting preferenceId:", err);
    }
};


// Get: /settings/notifications
export const getNotificationDetails = async (req, res) => {
    const userID = req.user.userId;

    try{
        const preferenceId = await gettingPreferenceId(userID);

        const notificationResults = await prisma.settingsPreference.findUnique({
            where: {preferenceId: parseInt(preferenceId)},
            select: {
                emailNotification: true,
                pushNotification: true,
                interviewReminder: true,
                productUpdate: true
            }
        });

        if (!notificationResults){
            res.status(404).json("Resource not found");
        }

        res.status(200).json(notificationResults);
    }
    catch(err){
        return res.status(500).json({errorMessage: `An error occured: ${err}`});
    }
}

// Get: /settings/privacy
export const getPrivacyDetails = async (req, res) => {
    const userID = req.user.userId;

    try{
        const preferenceId = await gettingPreferenceId(userID);

        const privacyResults = await prisma.settingsPreference.findUnique({
            where: {preferenceId: parseInt(preferenceId)},
            select: {
                publicProfileVisibility: true,
                shareProgress: true
            }
        });

        if (!privacyResults){
            res.status(404).json("Resource not found");
        }

        res.status(200).json(privacyResults);
    }
    catch(err){
        return res.status(500).json({errorMessage: `An error occured: ${err}`});
    }
}

// Get: /settings/preferences
export const getPreference = async (req, res) => {
    const userID = req.user.userId;

    try{
        const preferenceId = await gettingPreferenceId(userID);

        const preferencesResults = await prisma.settingsPreference.findUnique({
            where: {preferenceId: parseInt(preferenceId)},
            select: {
                language: true,
                soundEffect: true
            }
        });

        if (!preferencesResults){
            res.status(404).json("Resource not found");
        }

        res.status(200).json(preferencesResults);
    }
    catch(err){
        return res.status(500).json({errorMessage: `An error occured: ${err}`});
    }
}

// Post: /settings
// Check if the settings exists if so use it, if not create a new settings
export const saveSettings = async (req, res) => {
  const { emailNotification, pushNotification, interviewReminder, productUpdate,
          publicProfileVisibility, shareProgress, language, soundEffect } = req.body;

  const userID = req.user.userId;

  try {
    // Check if a preference with these settings exists
    let preference = await prisma.settingsPreference.findFirst({
      where: {
        emailNotification,
        pushNotification,
        interviewReminder,
        productUpdate,
        publicProfileVisibility,
        shareProgress,
        language,
        soundEffect
      }
    });

    // If not, create a new preference
    if (!preference) {
      preference = await prisma.settingsPreference.create({
        data: {
          emailNotification: emailNotification,
          pushNotification: pushNotification,
          interviewReminder: interviewReminder,
          productUpdate: productUpdate,
          publicProfileVisibility: publicProfileVisibility,
          shareProgress: shareProgress,
          language: language,
          soundEffect: soundEffect
        }
      });
    }

    // Link user to this preference
    await prisma.registeredUser.update({
      where: { userId: parseInt(userID) },
      data: { preferenceId: preference.preferenceId }
    });

    // Return the preference
    return res.status(200).json({ preferenceId: preference.preferenceId });

  } catch (err) {
    return res.status(500).json({ errorMessage: `An error occurred: ${err}` });
  }
};


// Delete: /settings/account
export const deleteAccount = async (req, res) => {
    const userID = req.user.userId;

    try{
        const account = await prisma.registeredUser.delete({
            where: {userId: parseInt(userID)},
        });

        if (!account){
            res.status(404).json("Resource not found");
        }

        res.status(200).json({message: "Account succefully deleted", account});
    }
    catch(err){
        return res.status(500).json({errorMessage: `An error occured: ${err}`});
    }
}









// Post: /settings/notifications
export const updateNotifictionsDetails = async(req, res) => {
    const preferenceId = await gettingPreferenceId(userID);

    try{
        const preferenceId = await gettingPreferenceId(userID);

    }
    catch(err){
        return res.status(500).json({errorMessage: `An error occured: ${err}`});
    }

}