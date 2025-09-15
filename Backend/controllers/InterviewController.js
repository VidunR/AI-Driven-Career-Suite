import prisma from "../config/db.js";

// Post: /interview
// Create interview
export const createInterview = async(req, res) => {
    const userID = req.user.userId;
    const {experienceLevel, interviewJobRoleId} = req.body;

    try{
        const newInterview = await prisma.interview.create({
            data: {
                interviewDate: new Date(), 
                experienceLevel: experienceLevel,
                userId: parseInt(userID),
                interviewJobRoleId: parseInt(interviewJobRoleId)
            }
        });

        res.status(200).json(newInterview);

    }
    catch(err){
        return res.status(500).json({ errorMessage: `An error occurred: ${err}` });
    }
}

// Put: /interview/{id:interviewID}
// Update interview
export const updateInterview = async(req, res) => {
    const {interviewID} = req.params;
    const {duration, completedPercentage, isCompleted, interviewScore} = req.body;

    // Remember when inputting the values to isCompleted and interview score keep those
    // to the default value until interview is completed. We can use number of questions to check
    // whether the interview is over and update accoding to that

    try{
        const updatedInterview = await prisma.interview.update({
            where: {interviewId: parseInt(interviewID)},
            data: {
                interviewDuration: parseInt(duration),
                completedPercentage: parseInt(completedPercentage),
                isCompleted: isCompleted,
                interviewScore: parseFloat(interviewScore)
            }
        });

        res.status(200).json(updatedInterview);
    }
    catch(err){
        return res.status(500).json({ errorMessage: `An error occurred: ${err}` });
    }
}