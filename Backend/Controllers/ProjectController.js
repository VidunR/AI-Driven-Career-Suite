import prisma from "../config/db.js";

export const getProjectDtails = async(req, res) => {
    const {id} = req.params;

    try{
        const project = await prisma.project.findUnique({
            where: {projectId : parseInt(id)}
        });

        if (!project){
            res.status(404).json({error: "Project Not Found"});
        }

        res.status(200).json(project);
    }
    catch(err){
        res.status(500).json({errorMessage: `An error occured: ${err}`});
    }

}