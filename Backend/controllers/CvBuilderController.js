import prisma from "../config/db.js";

/**
 * POST /cvbuilder/saveCV
 * Body: { cvFilepath?: string, cvImagePath?: string, cvName?: string }
 * Persists a CV “record” for the logged-in user. File paths can be empty strings.
 */
export const saveCV = async (req, res) => {
  try {
    const userId = parseInt(req.user?.userId);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const relPath = `assets/CVs/${req.file.filename}`;

    const {
      cvFilepath = relPath,     
      cvImagePath = "",   
      cvName = "CV",
    } = req.body || {};

    const cvResults = await prisma.cv.create({
      data: {
        cvFilepath,
        cvImagePath,
        cvName: cvName?.trim() || "CV",
        modifiedDate: new Date(),
        userId,
      },
    });

    return res.status(200).json({ message: "CV is generated", cvResults });
  } catch (err) {
    console.error("saveCV error:", err);
    return res
      .status(500)
      .json({ errorMessage: `An error occured: ${err?.message || err}` });
  }
};

// GET /cvbuilder/user
export const getUserDetails = async (req, res) => {
  try {
    const userId = parseInt(req.user?.userId);
    const userDetails = await prisma.registeredUser.findUnique({
      where: { userId },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        country: true,
        address: true,
        linkedInURL: true,
        bio: true,
      },
    });
    return res.status(200).json(userDetails);
  } catch (err) {
    return res.status(500).json({ errorMessage: `An error occured: ${err}` });
  }
};

// GET /cvbuilder/education
export const getEducationDetails = async (req, res) => {
  try {
    const userId = parseInt(req.user?.userId);
    const educationResults = await prisma.education.findMany({
      where: { userId },
    });
    /*if (educationResults.length === 0) {
      return res.status(404).json({ message: "Resource not found." });
    }*/
    return res.status(200).json(educationResults);
  } catch (err) {
    return res.status(500).json({ errorMessage: `An error occured: ${err}` });
  }
};

// POST /cvbuilder/education
export const createEducationDetails = async (req, res) => {
  try {
    const userId = Number(req.user?.userId);
    const { degree, institution, startDate, endDate } = req.body;

    const educationResults = await prisma.education.create({
      data: {
        userId,
        degree,
        institution,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });
    return res.status(200).json(educationResults);
  } catch (err) {
    return res.status(500).json({ errorMessage: `An error occured: ${err}` });
  }
};

// DELETE /cvbuilder/education/:educationID
export const deleteEducationDetails = async (req, res) => {
  try {
    const userId = Number(req.user?.userId);
    const educationID = Number(req.params.educationID);

    const result = await prisma.education.deleteMany({
      where: { educationId: educationID, userId },
    });

    if (result.count === 0) {
      return res.status(404).json({ message: "Resource not found." });
    }
    return res.status(200).json({ message: "Education Details Successfully deleted." });
  } catch (err) {
    return res.status(500).json({ errorMessage: `An error occured: ${err}` });
  }
};

// GET /cvbuilder/experience
export const getExperienceDetails = async (req, res) => {
  try {
    const userId = Number(req.user?.userId);
    const experinceResults = await prisma.experience.findMany({ where: { userId } });
    /*if (experinceResults.length === 0) {
      return res.status(404).json({ message: "Resource not found." });
    }*/
    return res.status(200).json(experinceResults);
  } catch (err) {
    return res.status(500).json({ errorMessage: `An error occured: ${err}` });
  }
};

// POST /cvbuilder/experience
export const createExperienceDetails = async (req, res) => {
  try {
    const userId = Number(req.user?.userId);
    const { jobTitle, company, startDate, endDate, description } = req.body;

    const experinceResults = await prisma.experience.create({
      data: {
        userId,
        jobTitle,
        company,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        description,
      },
    });
    return res.status(200).json(experinceResults);
  } catch (err) {
    return res.status(500).json({ errorMessage: `An error occured: ${err}` });
  }
};

// DELETE /cvbuilder/experience/:experienceID
export const deleteExperienceDetails = async (req, res) => {
  try {
    const userId = Number(req.user?.userId);
    const experienceID = Number(req.params.experienceID);

    const result = await prisma.experience.deleteMany({
      where: { experienceId: experienceID, userId },
    });

    if (result.count === 0) {
      return res.status(404).json({ message: "Resource not found." });
    }
    return res.status(200).json({ message: "Experience Details Successfully deleted." });
  } catch (err) {
    return res.status(500).json({ errorMessage: `An error occured: ${err}` });
  }
};

// GET /cvbuilder/skills
export const getSkillsDetails = async (req, res) => {
  try {
    const userId = Number(req.user?.userId);
    const skillsResults = await prisma.userSkill.findMany({
      where: { userId },
      select: { skill: { select: { skillId: true, skillName: true } } },
    });
    /*if (skillsResults.length === 0) {
      return res.status(404).json({ message: "Resource not found." });
    }*/

    const flatSkills = skillsResults.map((u) => u.skill); 
    return res.status(200).json(flatSkills);
  } catch (err) {
    return res.status(500).json({ errorMessage: `An error occured: ${err}` });
  }
};

// POST /cvbuilder/skills
export const createSkillsDetails = async (req, res) => {
  try {
    const userId = Number(req.user?.userId);
    const { skillName } = req.body;

    const normalized = (skillName || "")
      .trim()
      .split(/\s+/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");

    let skill = await prisma.skill.findFirst({ where: { skillName: normalized } });
    if (!skill) skill = await prisma.skill.create({ data: { skillName: normalized } });

    const existing = await prisma.userSkill.findFirst({
      where: { userId, skillId: skill.skillId },
    });
    if (existing) return res.status(400).json({ message: "User already has this skill." });

    const userSkill = await prisma.userSkill.create({
      data: { userId, skillId: skill.skillId },
    });

    return res.status(201).json({ message: "Skill added.", userSkill });
  } catch (err) {
    return res.status(500).json({ errorMessage: `An error occurred: ${err?.message || err}` });
  }
};

// DELETE /cvbuilder/skills/:skillID
export const deleteSkillDetails = async (req, res) => {
  try {
    const userId = Number(req.user?.userId);
    const skillID = Number(req.params.skillID);

    const result = await prisma.userSkill.deleteMany({
      where: { skillId: skillID, userId },
    });

    if (result.count === 0) {
      return res.status(404).json({ message: "Resource not found." });
    }
    return res.status(200).json({ message: "Skill Successfully deleted." });
  } catch (err) {
    return res.status(500).json({ errorMessage: `An error occured: ${err}` });
  }
};

// GET /cvbuilder/achievement
export const getAchievementDetails = async (req, res) => {
  try {
    const userId = Number(req.user?.userId);
    const achievementResults = await prisma.achievement.findMany({ where: { userId } });
    /*if (achievementResults.length === 0) {
      return res.status(404).json({ message: "Resource not found." });
    }*/
    return res.status(200).json(achievementResults);
  } catch (err) {
    return res.status(500).json({ errorMessage: `An error occured: ${err}` });
  }
};

// POST /cvbuilder/achievement
export const createAchievementDetails = async (req, res) => {
  try {
    const userId = Number(req.user?.userId);
    const { achievementTitle, achievementDescription } = req.body;

    const achievementResults = await prisma.achievement.create({
      data: { userId, achievementTitle, achievementDescription },
    });
    return res.status(200).json(achievementResults);
  } catch (err) {
    return res.status(500).json({ errorMessage: `An error occured: ${err}` });
  }
};

// DELETE /cvbuilder/achievement/:achievementID
export const deleteAchievementDetails = async (req, res) => {
  try {
    const userId = Number(req.user?.userId);
    const achievementID = Number(req.params.achievementID);

    const result = await prisma.achievement.deleteMany({
      where: { achievementId: achievementID, userId },
    });

    if (result.count === 0) {
      return res.status(404).json({ message: "Resource not found." });
    }
    return res.status(200).json({ message: "Achievement Successfully deleted." });
  } catch (err) {
    return res.status(500).json({ errorMessage: `An error occured: ${err}` });
  }
};

// GET /cvbuilder/project
export const getProjectDetails = async (req, res) => {
  try {
    const userId = Number(req.user?.userId);
    const projectResults = await prisma.project.findMany({ where: { userId } });
    /*if (projectResults.length === 0) {
      return res.status(404).json({ message: "Resource not found." });
    }*/
    return res.status(200).json(projectResults);
  } catch (err) {
    return res.status(500).json({ errorMessage: `An error occured: ${err}` });
  }
};

// POST /cvbuilder/project
export const createProjectDetails = async (req, res) => {
  try {
    const userId = Number(req.user?.userId);
    const { projectName, projectDesciption, startDate, endDate } = req.body;

    const project = await prisma.project.create({
      data: {
        userId,
        projectName,
        projectDescription: projectDesciption,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    return res.status(200).json(project);
  } catch (err) {
    return res.status(500).json({ errorMessage: `An error occured: ${err}` });
  }
};

// DELETE /cvbuilder/project/:projectID
export const deleteProjectDetails = async (req, res) => {
  try {
    const userId = Number(req.user?.userId);
    const projectID = Number(req.params.projectID);

    const result = await prisma.project.deleteMany({
      where: { projectId: projectID, userId },
    });

    if (result.count === 0) {
      return res.status(404).json({ message: "Resource not found." });
    }
    return res.status(200).json({ message: "Project Successfully deleted." });
  } catch (err) {
    return res.status(500).json({ errorMessage: `An error occured: ${err}` });
  }
};