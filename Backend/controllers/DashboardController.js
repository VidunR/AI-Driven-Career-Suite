import prisma from "../config/db.js";

// Get: dashboard/
export const getDashboardDetails = async(req, res) => {
    const userID = req.user.userId;

    try{
        // Return the first and last name
        const names = await prisma.registeredUser.findUnique({
            where: {userId: parseInt(userID)},
            select: {firstName: true, lastName: true}
        });

        // Return all the cvs belongs to the user
        const cvResults = await prisma.cv.findMany({
            where: {userId: parseInt(userID)}
        });

        // Return all the interviews belongs to the user
        const interviewResults = await prisma.interview.findMany({
            where: {userId: parseInt(userID)}
        });

        var highestInterviewScore = 0;

        // Finding the highest interview score
        for(var i=0; i < interviewResults.length; i++){
            if (interviewResults[i].interviewScore > highestInterviewScore){
                highestInterviewScore = interviewResults[i].interviewScore
            }
        }

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

        return res.status(200).json(
            {
                firstName: names.firstName,
                lastName: names.lastName,
                cvCount: cvResults.length || 0,
                interviewCount: interviewResults.length || 0,
                highestScore: highestInterviewScore,
                leaderboardRank: interviewResults.length >= leaderboardEntryLevel ? userRank : 
                `-`
            }
        );
    }
    catch(err){
        return res.status(500).json({errorMessage: `An error occured: ${err}`});
    }
}