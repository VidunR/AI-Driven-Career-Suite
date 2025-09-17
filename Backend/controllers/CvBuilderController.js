import prisma from "../config/db.js";


// Post: cvbuilder/saveCV
export const saveCV = async(req, res) => {
    const userID = req.user.userId;

    const {cvFilepath, cvImagePath} = req.body;

    try{
        const cvResults = await prisma.cv.create({
            data: {
                cvFilepath: cvFilepath,
                cvImagePath: cvImagePath,
                modifiedDate: new Date(),
                userId: parseInt(userID)
            }
        });

        return res.status(200).json({
            message: "CV is generated",
            cvResults
        });
        
    }
    catch(err){
        return res.status(500).json({errorMessage: `An error occured: ${err}`});
    }
}

// Get: cvbuilder/user
export const getUserDetails = async(req, res) => {
    const userID = req.user.userId;

    try{
        const userDetails = await prisma.registeredUser.findUnique({
            where: {userId: userID},
            select: {
                firstName:true,
                lastName: true,
                email: true,
                phoneNumber: true,
                country: true,
                address: true,
                linkedInURL: true,
                bio: true
            }
        });

        return res.status(200).json(userDetails);
    }
    catch(err){
        return res.status(500).json({errorMessage: `An error occured: ${err}`});
    }
}

// Get: cvbuilder/education
export const getEducationDetails = async(req, res) => {
    const userID = req.user.userId;

    try{
        const educationResults = await prisma.education.findMany({
            where: {userId: parseInt(userID)}
        });

        if (educationResults.count === 0){
            return res.status(404).json({message: "Resource not found."});   
        }


        return res.status(200).json(educationResults);   
    }
    catch(err){
        return res.status(500).json({errorMessage: `An error occured: ${err}`});
    }
}

// Post: cvbuilder/education
export const createEducationDetails = async(req, res) => {
    const userID = req.user.userId;
    const {degree, institution, startDate, endDate} = req.body;

    try{
        const educationResults = await prisma.education.create({
            data: {
                userId: parseInt(userID),
                degree: degree,
                institution: institution,
                startDate: new Date(startDate),
                endDate: new Date(endDate)
            }
        });

        return res.status(200).json(educationResults);   
    }
    catch(err){
        return res.status(500).json({errorMessage: `An error occured: ${err}`});
    }
}

// Delete: cvbuilder/education/{:educationID}
export const deleteEducationDetails = async(req, res) => {
    const userID = req.user.userId;
    const {educationID} = req.params;

    try{
        const educationResults = await prisma.education.deleteMany({
            where: {educationId: parseInt(educationID), userId: parseInt(userID)}
        })

        if (educationResults.count === 0){
            return res.status(404).json({message: "Resource not found."});   
        }

        return res.status(200).json({message: "Education Details Successfully deleted."})
    }
    catch(err){
        return res.status(500).json({errorMessage: `An error occured: ${err}`});
    }
}


// Get: cvbuilder/experience
export const getExperienceDetails = async(req, res) => {
    const userID = req.user.userId;

    try{
        const experinceResults = await prisma.experience.findMany({
            where: {userId: parseInt(userID)}
        });

        if (experinceResults.count === 0){
            return res.status(404).json({message: "Resource not found."});   
        }

        return res.status(200).json(experinceResults);   
    }
    catch(err){
        return res.status(500).json({errorMessage: `An error occured: ${err}`});
    }
}

// Post: cvbuilder/experience
export const createExperienceDetails = async(req, res) => {
    const userID = req.user.userId;
    const {jobTitle, company, startDate, endDate, description} = req.body;

    try{
        const experinceResults = await prisma.experience.create({
            data: {
                userId: parseInt(userID),
                jobTitle: jobTitle,
                company: company,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                description: description
            }
        });

        return res.status(200).json(experinceResults);   
    }
    catch(err){
        return res.status(500).json({errorMessage: `An error occured: ${err}`});
    }
}

// Delete: cvbuilder/education/{:experienceID}
export const deleteExperienceDetails = async(req, res) => {
    const {experienceID} = req.params;
    const userID = req.user.userId;

    try{
        const experienceResults = await prisma.experience.deleteMany({
            where: {experienceId: parseInt(experienceID), userId: parseInt(userID)}
        });

        if (experienceResults.count === 0){
            return res.status(404).json({message: "Resource not found."});   
        }

        return res.status(200).json({message: "Experience Details Successfully deleted."})
    }
    catch(err){
        return res.status(500).json({errorMessage: `An error occured: ${err}`});
    }
}

// Get: cvbuilder/skills
export const getSkillsDetails = async(req, res) => {
    const userID = req.user.userId;

    try{
        const skillsResults = await prisma.userSkill.findMany({
            where: {userId: parseInt(userID)},
            select: {
                skill:{
                    select: {
                        skillName: true
                    }
                }
            }
        });

        if (skillsResults.count === 0){
            return res.status(404).json({message: "Resource not found."});   
        }

        return res.status(200).json(skillsResults);   
    }
    catch(err){
        return res.status(500).json({errorMessage: `An error occured: ${err}`});
    }
}

// Post: cvbuilder/skills
export const createSkillsDetails = async (req, res) => {
  const userID = req.user.userId;
  const { skillName } = req.body;

  const correctSkillsName = skillName.trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  try {
    // Find skill if it already exists
    let skill = await prisma.skill.findFirst({
      where: { skillName: correctSkillsName },
    });

    // If skill doesn't exist, create it
    if (!skill) {
      skill = await prisma.skill.create({
        data: { skillName: correctSkillsName },
      });
    }

    // Check if user already has this skill
    const existingUserSkill = await prisma.userSkill.findFirst({
      where: {
        userId: userID,
        skillId: skill.skillId,
      },
    });

    if (existingUserSkill) {
      return res.status(400).json({ message: "User already has this skill." });
    }

    // Link user to skill
    const userSkill = await prisma.userSkill.create({
      data: {
        user: { connect: { userId: userID } },
        skill: { connect: { skillId: skill.skillId } },
      },
    });

    return res.status(201).json({
      message: "Skill successfully added and linked to user.",
      userSkill,
    });
  } catch (err) {
    return res.status(500).json({
      errorMessage: `An error occurred: ${err.message}`,
    });
  }
};


// Delete: cvbuilder/skills/{:skillID}
export const deleteSkillDetails = async(req, res) => {
    const {skillID} = req.params;
    const userID = req.user.userId;

    try{
        const skillResults = await prisma.userSkill.deleteMany({
            where: {skillId: parseInt(skillID), userId: parseInt(userID)}
        })

        if (skillResults.count === 0){
            return res.status(404).json({message: "Resource not found."});   
        }

        return res.status(200).json({message: "Skill Successfully deleted."})
    }
    catch(err){
        return res.status(500).json({errorMessage: `An error occured: ${err}`});
    }
}

// Get: cvbuilder/achievement
export const getAchievementDetails = async(req, res) => {
    const userID = req.user.userId;

    try{
        const achievementResults = await prisma.achievement.findMany({
            where: {userId: parseInt(userID)}
        });

        if (achievementResults.count === 0){
            return res.status(404).json({message: "Resource not found."});   
        }

        return res.status(200).json(achievementResults);   
    }
    catch(err){
        return res.status(500).json({errorMessage: `An error occured: ${err}`});
    }
}

// Post: cvbuilder/achievement
export const createAchievementDetails = async(req, res) => {
    const userID = req.user.userId;
    const {achievementTitle, achievementDescription} = req.body;

    try{
        const achievementResults = await prisma.achievement.create({
            data: {
                userId: parseInt(userID),
                achievementTitle: achievementTitle,
                achievementDescription: achievementDescription
            }
        });

        return res.status(200).json(achievementResults);   
    }
    catch(err){
        return res.status(500).json({errorMessage: `An error occured: ${err}`});
    }
}

// Delete: cvbuilder/achievement/{:achievementID}
export const deleteAchievementDetails = async(req, res) => {
    const {achievementID} = req.params;
    const userID = req.user.userId;

    try{
        const achievementResults = await prisma.achievement.deleteMany({
            where: {achievementId: parseInt(achievementID), userId: parseInt(userID)}
        })

        if (achievementResults.count === 0){
            return res.status(404).json({message: "Resource not found."});   
        }

        return res.status(200).json({message: "Achievement Successfully deleted."})
    }
    catch(err){
        return res.status(500).json({errorMessage: `An error occured: ${err}`});
    }
}

// Get: cvbuilder/project
export const getProjectDetails = async(req, res) => {
    const userID = req.user.userId;

    try{
        const projectResults = await prisma.project.findMany({
            where: {userId: parseInt(userID)}
        });

        if (projectResults.count === 0){
            return res.status(404).json({message: "Resource not found."});   
        }

        return res.status(200).json(projectResults);   
    }
    catch(err){
        return res.status(500).json({errorMessage: `An error occured: ${err}`});
    }
}

// Post: cvbuilder/project
export const createProjectDetails = async(req, res) => {
    const userID = req.user.userId;
    const {projectName, projectDesciption, startDate, endDate} = req.body;

    try{
        const achievementResults = await prisma.project.create({
            data: {
                userId: parseInt(userID),
                projectName: projectName,
                projectDescription: projectDesciption,
                startDate: startDate,
                endDate: endDate
            }
        });

        return res.status(200).json(achievementResults);   
    }
    catch(err){
        return res.status(500).json({errorMessage: `An error occured: ${err}`});
    }
}

// Delete: cvbuilder/project/{:projectID}
export const deleteProjectDetails = async(req, res) => {
    const {projectID} = req.params;
    const userID = req.user.userId;

    try{
        const projectResults = await prisma.project.deleteMany({
            where: {projectId: parseInt(projectID), userId: parseInt(userID)}
        });

        if (projectResults.count === 0){
            return res.status(404).json({message: "Resource not found."});   
        }

        return res.status(200).json({message: "Project Successfully deleted."})
    }
    catch(err){
        return res.status(500).json({errorMessage: `An error occured: ${err}`});
    }
}
