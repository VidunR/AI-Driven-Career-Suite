import prisma from "../config/db.js";


// Get: /applayout/
// First Name, last name, Email and Image

export const getAppLayoutDetails = async(req, res) => {
    const userID = req.user.userId;

    try{
        const userDetails = await prisma.registeredUser.findUnique({
            where: {userId: parseInt(userID)},
            select: {
                firstName: true,
                lastName: true,
                email: true,
                proImgPath: true
            }
        });

        return res.status(200).json(userDetails);
    }
    catch(err){
        return res.status(500).json({ errorMessage: `An error occurred: ${err}` });
    }
}



