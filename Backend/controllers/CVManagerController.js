import prisma from "../config/db.js";

// Get: cvmanager/
export const getCVs = async(req, res) => {
    const userID = req.user.userId;

    try{
        const getCVs = await prisma.cv.findMany({
           where: {userId: parseInt(userID)} 
        });

        return res.status(200).json(getCVs);
    }
    catch(err){
        return res.status(500).json({errorMessage: `An error occured: ${err}`});
    }
}

// Delete: cvmanager/{:cvID}
export const deleteCV = async(req, res) =>{
    const userID = req.user.userId;
    const {cvID} = req.params;

    try{
        const cvResult = await prisma.cv.deleteMany({
            where: {userId: parseInt(userID), cvId: parseInt(cvID)}
        });

        if(cvResult.count === 0){
            return res.status(404).json({message: "CV not found"})
        }

        return res.status(200).json({message: "CV deleted successfully", cvResult});
    }
    catch(err){
        return res.status(500).json({errorMessage: `An error occured: ${err}`});
    }
} 