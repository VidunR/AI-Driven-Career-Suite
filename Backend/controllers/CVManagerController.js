import prisma from "../config/db.js";

// Get: cvmanager/
export const getDashboardDetails = async(req, res) => {
    const userID = req.user.userId;

    try{
        
    }
    catch(err){
        return res.status(500).json({errorMessage: `An error occured: ${err}`});
    }
}