import prisma from "../config/db.js";

// Capitalize
function capitalizeWords(wordSet){
    return wordSet.trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
}

// Get: /profile/overview
// Profile Overview
// First Name, last name, skills, interview, average score, rank

export const getUserOverview = async(req, res) => {
    const userID = req.user.userId;

    try{
        // Getting Names      
        const userDetails = await prisma.registeredUser.findUnique({
            where: {userId: parseInt(userID)},
            select: {firstName: true, lastName: true, proImgPath: true, currentProfessionalRole: true}
        });

        // Getting Skills
        const  userSkillDetails = await prisma.userSkill.findMany({
            where: {userId: parseInt(userID)},
            select: {
                skill: {
                    select: {skillName: true}
                }
            }
        });

        const skillNames = userSkillDetails.map(item => item.skill.skillName);

        // Getting interview list
        const interviewResults = await prisma.interview.findMany({
            where: {userId: userID},
            select: {
                interviewId: true,
                interviewScore: true
            },
            orderBy: {interviewId:'asc'}
        });

        // Total interviews
        const totalInterviews = interviewResults.length;
        let totalMarks = 0;

        interviewResults.map(obj => {totalMarks += obj.interviewScore});

        // Avg marks
        const avgMarks =  totalMarks / totalInterviews;
        const avgMarksRounded = parseFloat(avgMarks.toFixed(1));

         // Scoreboard logic
        let userRank = 0;
        const leaderboardEntryLevel = 5;

        // Ranking starts after 5 interviews

        if(interviewResults.length >= leaderboardEntryLevel){

            // gett all the interviews
            const leaderboard = await prisma.interview.groupBy({
                by: ['userId'],
                _max: {
                    interviewScore: true,
                },
                orderBy: {
                    _max: {
                    interviewScore: 'desc',
                    },
                },
            });

            // get the rank of the current user
            for (var i = 0; i < leaderboard.length; i++){
                userRank += 1;

                if(leaderboard[i].userId === parseInt(userID)){
                    break;
                }
            }
        }

        var remainingInterviews = leaderboardEntryLevel - interviewResults.length;

        // Improvment Logic
        let previousTotal = 0
        let previousAverage = 0

        if (interviewResults.length > 1){
            interviewResults.slice(0, -1).forEach(obj => {
            previousTotal += obj.interviewScore;
            });

            previousAverage = previousTotal / (totalInterviews - 1)
        }

        const improvement = parseFloat(((avgMarksRounded - previousAverage) / previousAverage) * 100).toFixed(1);


        res.status(200).json({
            firstName: userDetails.firstName,
            lastName: userDetails.lastName,
            profesisonalRole: userDetails.currentProfessionalRole,
            skils: skillNames,
            interviewCount: totalInterviews,
            averageScore: avgMarksRounded,
            rank: interviewResults.length >= leaderboardEntryLevel ? userRank :
                `-`,
            improvement: improvement
        });
    }
    catch(err){
        return res.status(500).json({errorMessage: `An error occured: ${err}`});
    }
    
}

// Get: /profile/personal
// Profile Personal Details

export const getPersonalDetails = async(req, res) => {
    const userID = req.user.userId;

    try{
        const userResults = await prisma.registeredUser.findUnique({
            where: {userId: parseInt(userID)},
            select: {
                firstName: true,
                lastName: true,
                email: true,
                phoneNumber: true,
                country: true,
                address: true,
                bio: true,
                currentProfessionalRole: true,
                targetProfessionalRole: true,
                linkedInURL: true
            }
        })

        res.status(200).json(userResults);
    }
    catch(err){
        return res.status(500).json({errorMessage: `An error occured: ${err}`});
    }
}

// PUT: /profile/personal
// Edit Personal Details
export const editUserDetails = async (req, res) => {
    const userID = req.user.userId;
    const {
        firstName, lastName, phoneNumber, country, address, bio,
        currentProfessionalRole, targetProfessionalRole, skillsToDelete} = req.body;

    // Here skillTODelete array contain Ids of each skills that will be deleted from the user

    try {
        // Validation errors array
        const errors = [];

        if (!firstName || firstName.trim().length < 2 || firstName.trim().length > 50) {
            errors.push("First name must be between 2 and 50 characters.");
        }
        if (!lastName || lastName.trim().length < 2 || lastName.trim().length > 50) {
            errors.push("Last name must be between 2 and 50 characters.");
        }

        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }

        // Update user details
        const userDetails = await prisma.registeredUser.update({
        where: { userId: parseInt(userID) },
            data: {
                firstName: capitalizeWords(firstName),
                lastName: capitalizeWords(lastName),
                phoneNumber,
                country: capitalizeWords(country),
                address,
                bio,
                currentProfessionalRole: capitalizeWords(currentProfessionalRole),
                targetProfessionalRole: capitalizeWords(targetProfessionalRole),
            },
        });

        // Delete selected skills if any
        if (Array.isArray(skillsToDelete) && skillsToDelete.length > 0) {
            await prisma.userSkill.deleteMany({
                where: {
                userId: parseInt(userID),
                skillId: { in: skillsToDelete.map(id => parseInt(id)) }
                }
            });
        }


        return res.status(200).json({ 
        message: "User details and skills updated successfully", 
        userDetails 
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ errorMessage: `An error occurred: ${err}` });
    }
};

// Get: /profile/skills
// Skill Detail
export const getSkillDetails = async(req, res) => {
    const userID = req.user.userId;

    try{
        const  userSkillDetails = await prisma.userSkill.findMany({
            where: {userId: parseInt(userID)},
            select: {
                skill: {
                    select: {skillName: true}
                }
            }
        });

        const skillNames = userSkillDetails.map(item => item.skill.skillName);

        res.json(skillNames);

    }
    catch(err){
        return res.status(500).json({errorMessage: `An error occured: ${err}`});
    }
}

// Delete: /profile/skills
// Delete Skill Detail

export const deleteSkill = async(req, res) => {
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
