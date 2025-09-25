import prisma from "../config/db.js";

// Get: /interviewresult/{:interviewID}

export const getInterviewResults = async(req, res) => {
    const userID = req.user.userId;
    const {interviewID} = req.params;

    try{
        const interviewResults = await prisma.interview.findUnique({
            where: {userId: parseInt(userID), interviewId: parseInt(interviewID)},
            select: {
                interviewJobRole: {
                    select: {
                        jobRoleName: true
                    }
                },
                interviewScore:true,
                interviewDuration: true,
                isCompleted: true,
                experienceLevel: true,
                feedbackJson: true,
                interview_performance_breakdown: {
                    select: {
                        performance_breakdown:{
                            select: {
                                preformanceName: true,
                                preformanceScore: true
                            }
                        }
                    }
                },
                interviewAnalysis: {
                    select: {
                        videoQuestion:{
                            select: {
                                question: true
                            }
                        },
                        userAnswer: true,
                        feedback: true,
                        scorePerQuestion: true
                    }
                }
            }

        });

        res.status(200).json(interviewResults);     
    }
    catch(err){
        return res.status(500).json({ errorMessage: `An error occurred: ${err}` });
    }
}

// Post: /interviewresult/{:interviewID}
export const createInterviewResults = async(req, res) => {
    const userID = req.user.userId;
    const {interviewID} = req.params;
    const {userAnswer, feedback, scorePerQuestion, videoQuestionId} = req.body;

    try{
        const saveResult = await prisma.interviewAnalysis.create({
            data: {
                userAnswer: userAnswer,
                feedback: feedback,
                scorePerQuestion: parseFloat(scorePerQuestion),
                videoQuestionId: parseInt(videoQuestionId),
                interviewId: parseInt(interviewID)
            }
        });

        res.status(200).json(saveResult);

    }
    catch(err){
        return res.status(500).json({ errorMessage: `An error occurred: ${err}` });
    }
}

