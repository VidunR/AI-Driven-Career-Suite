import prisma from "../config/db.js";

// Get: /interviewhistory
export const getInterviewHistoryDetails = async (req, res) => {
  const userID = req.user.userId;

  try {
    const interviewHistoryResults = await prisma.interview.findMany({
      where: { userId: parseInt(userID) },
      orderBy: [{interviewDate: 'desc'}, {interviewId: 'desc'}],
      select: {
        interviewJobRole: {
          select: { jobRoleName: true },
        },
        interviewId: true,
        isCompleted: true,
        interviewDate: true,
        interviewDuration: true,
        completedPercentage: true,
      },
    });

    // Flatten jobRoleName
    const flattenedResults = interviewHistoryResults.map(item => ({
      jobRoleName: item.interviewJobRole?.jobRoleName || null,
      interviewId: item.interviewId,
      isCompleted: item.isCompleted,
      interviewDate: item.interviewDate,
      interviewDuration: item.interviewDuration,
      completedPercentage: item.completedPercentage
    }));

    res.status(200).json(flattenedResults);
  } catch (err) {
    return res.status(500).json({ errorMessage: `An error occurred: ${err}` });
  }
};

// Delete: /interviewhistory

export const deleteInterview = async(req, res) => {
  const userID = req.user.userId;
  const {interviewID} = req.body;

  try{
    const interviewDetails = await prisma.interview.delete({
      where: {interviewId: parseInt(interviewID)}
    });

    res.status(200).json({
      message: "Interview Deleted Successfully",
      interviewDetails
    });

  }
  catch(err){
    return res.status(500).json({ errorMessage: `An error occurred: ${err}` });
  }

}
