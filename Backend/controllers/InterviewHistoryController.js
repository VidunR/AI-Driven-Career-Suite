import prisma from "../config/db.js";

// Get: /interviewhistory
export const getInterviewHistoryDetails = async (req, res) => {
  const userID = req.user.userId;

  try {
    const interviewHistoryResults = await prisma.interview.findMany({
      where: { userId: parseInt(userID) },
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
