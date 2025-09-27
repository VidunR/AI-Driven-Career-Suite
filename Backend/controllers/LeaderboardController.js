import prisma from "../config/db.js";

// GET: /leaderboard/weekly
// Returns weekly leaderboard

export const getWeeklyRank = async (req, res) => {
    const userID = req.user.userId;

    try {
        // Get the start of this week
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        // Fetch all users with interviews from this week
        const weeklyResults = await prisma.registeredUser.findMany({
            select: {
                userId: true,
                firstName: true,
                lastName: true,
                interview: {
                where: {
                    interviewDate: {
                        gte: startOfWeek
                    }
                },
                select: {
                    interviewId: true,
                    interviewScore: true
                }
                },
                settingsPreference: {
                    select: {
                        isanonymous: true
                    }
                }
            }
        });

        console.log(weeklyResults);

        // Calculate average score and number of interviews
        let rankedUsers = weeklyResults.map(user => {
            const numInterviews = user.interview.length;
            const totalScore = user.interview.reduce((acc, i) => acc + i.interviewScore, 0);
            const avgScore = numInterviews > 0 ? parseFloat(totalScore / numInterviews).toFixed(1) : 0;

            return {
                userId: user.userId,
                firstName: !user.settingsPreference?.isanonymous ? user.firstName : "anonymous",
                lastName: !user.settingsPreference?.isanonymous ? user.lastName : (Math.random() * 100000).toFixed(0) + user.userId,
                numberOfInterviews: numInterviews,
                avgScore
                };
            }
        );

        // Filter out users with no interviews this week
        rankedUsers = rankedUsers.filter(u => u.numberOfInterviews > 0);

        // Sort descending by avgScore
        rankedUsers.sort((a, b) => b.avgScore - a.avgScore);

        // Assign ranks
        rankedUsers = rankedUsers.map((u, idx) => ({
            ...u,
            rank: idx + 1
        }));

        // Get top 10
        const top10 = rankedUsers.slice(0, 10);

        // Get current user
        const currentUser = rankedUsers.find(u => u.userId === userID);

        // Get last player
        const lastPlayer = rankedUsers[rankedUsers.length - 1];

        // Build final response
        let response = [...top10];

        if (currentUser && !top10.some(u => u.userId === currentUser.userId)) {
            response.push(currentUser);
        }

        if (lastPlayer && !response.some(u => u.userId === lastPlayer.userId)) {
            response.push(lastPlayer);
        }

        return res.json(response);

    } catch (err) {
        console.error(err);
        return res.status(500).json({errorMessage: `An error occured: ${err}`});
    }
};

// GET: /leaderboard/monthly
// Returns monthly leaderboard

export const getMonthlyRank = async (req, res) => {
    const userID = req.user.userId;

    try {
        const now = new Date();

        // Get first day of the current month
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        firstDayOfMonth.setHours(0, 0, 0, 0);

        // Fetch all users with interviews from this month
        const monthlyResults = await prisma.registeredUser.findMany({
            select: {
                userId: true,
                firstName: true,
                lastName: true,
                interview: {
                    where: {
                        interviewDate: {
                            gte: firstDayOfMonth
                        }
                    },
                    select: {
                        interviewId: true,
                        interviewScore: true
                    }
                },
                settingsPreference: {
                    select: {
                        isanonymous: true
                    }
                }
            }
        });

        // Calculate average score and number of interviews
        let rankedUsers = monthlyResults.map(user => {
            const numInterviews = user.interview.length;
            const totalScore = user.interview.reduce((acc, i) => acc + i.interviewScore, 0);
            const avgScore = numInterviews > 0 ? parseFloat(totalScore / numInterviews).toFixed(1) : 0;

            return {
                userId: user.userId,
                firstName: !user.settingsPreference?.isanonymous ? user.firstName : "anonymous",
                lastName: !user.settingsPreference?.isanonymous ? user.lastName : (Math.random() * 100000).toFixed(0) + user.userId,
                numberOfInterviews: numInterviews,
                avgScore
            };
        });

        // Filter out users with no interviews this month
        rankedUsers = rankedUsers.filter(u => u.numberOfInterviews > 0);

        // Sort descending by avgScore
        rankedUsers.sort((a, b) => b.avgScore - a.avgScore);

        // Assign ranks
        rankedUsers = rankedUsers.map((u, idx) => ({
            ...u,
            rank: idx + 1
        }));

        // Get top 10
        const top10 = rankedUsers.slice(0, 10);

        // Get current user
        const currentUser = rankedUsers.find(u => u.userId === userID);

        // Get last player
        const lastPlayer = rankedUsers[rankedUsers.length - 1];

        // Build final response
        let response = [...top10];

        if (currentUser && !top10.some(u => u.userId === currentUser.userId)) {
            response.push(currentUser);
        }

        if (lastPlayer && !response.some(u => u.userId === lastPlayer.userId)) {
            response.push(lastPlayer);
        }

        return res.json(response);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ errorMessage: `An error occurred: ${err}` });
    }
};


// GET: /leaderboard/alltime
// Returns all time leaderboard

export const getAllTimeRank = async (req, res) => {
    const userID = req.user.userId;

    try {
        // Fetch all users with all interviews
        const allTimeResults = await prisma.registeredUser.findMany({
            select: {
                userId: true,
                firstName: true,
                lastName: true,
                interview: {
                    select: {
                        interviewId: true,
                        interviewScore: true
                    }
                },
                settingsPreference: {
                    select: {
                        isanonymous: true
                    }
                }
            }
        });

        // Calculate average score and number of interviews
        let rankedUsers = allTimeResults.map(user => {
            const numInterviews = user.interview.length;
            const totalScore = user.interview.reduce((acc, i) => acc + i.interviewScore, 0);
            const avgScore = numInterviews > 0 ? parseFloat(totalScore / numInterviews).toFixed(1): 0;

            return {
                userId: user.userId,
                firstName: !user.settingsPreference?.isanonymous ? user.firstName : "anonymous",
                lastName: !user.settingsPreference?.isanonymous ? user.lastName : (Math.random() * 100000).toFixed(0) + user.userId,
                numberOfInterviews: numInterviews,
                avgScore
            };
        });

        // Filter out users with no interviews
        rankedUsers = rankedUsers.filter(u => u.numberOfInterviews > 0);

        // Sort descending by avgScore
        rankedUsers.sort((a, b) => b.avgScore - a.avgScore);

        // Assign ranks
        rankedUsers = rankedUsers.map((u, idx) => ({
            ...u,
            rank: idx + 1
        }));

        // Get top 10
        const top10 = rankedUsers.slice(0, 10);

        // Get current user
        const currentUser = rankedUsers.find(u => u.userId === userID);

        // Get last player
        const lastPlayer = rankedUsers[rankedUsers.length - 1];

        // Build final response
        let response = [...top10];

        if (currentUser && !top10.some(u => u.userId === currentUser.userId)) {
            response.push(currentUser);
        }

        if (lastPlayer && !response.some(u => u.userId === lastPlayer.userId)) {
            response.push(lastPlayer);
        }

        return res.json(response);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ errorMessage: `An error occurred: ${err}` });
    }
};

