// prisma/seed.js
import { PrismaClient } from '@prisma/client';
import bcrypt from "bcrypt";

const saltRounds = 10;
const prisma = new PrismaClient();

// helper for random date between Jan 1 2025 and Sep 1 2025
function randomDate() {
  const start = new Date("2025-01-01");
  const end = new Date("2025-09-01");
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// helper for random interview duration in minutes
function randomDurationMinutes() {
  const minMinutes = 30;
  const maxMinutes = 120;
  return Math.floor(Math.random() * (maxMinutes - minMinutes + 1)) + minMinutes;
}

async function main() {
  const randomScore = () => Math.floor(Math.random() * 101);

  // Create performance breakdown categories
  const perf1 = await prisma.performanceBreakdown.create({
    data: { preformanceName: "Communication", preformanceScore: 0 }
  });
  const perf2 = await prisma.performanceBreakdown.create({
    data: { preformanceName: "Technical Knowledge", preformanceScore: 0 }
  });
  const perf3 = await prisma.performanceBreakdown.create({
    data: { preformanceName: "Problem Solving", preformanceScore: 0 }
  });

  // Helper to create interview analysis and link performance breakdowns
  async function createInterviewAnalysis(interviewId, videoQuestionId, answer, feedback) {
    const analysis = await prisma.interviewAnalysis.create({
      data: {
        userAnswer: answer,
        feedback: feedback,
        scorePerQuestion: randomScore(),
        interviewId,
        videoQuestionId
      }
    });

    // Create InterviewPerformanceBreakdown directly connected to Interview
    await prisma.interviewPerformanceBreakdown.createMany({
      data: [
        { interviewId, performanceId: perf1.preformanceId },
        { interviewId, performanceId: perf2.preformanceId },
        { interviewId, performanceId: perf3.preformanceId },
      ]
    });
  }

  // --- User 1 ---
  const pref = await prisma.settingsPreference.create({
    data: {
      language: "English",
      publicProfileVisibility: true,
      soundEffect: false,
      emailNotification: true,
      pushNotification: true,
      interviewReminder: true,
      productUpdate: true,
      isanonymous: true,
    }
  });

  const user = await prisma.registeredUser.create({
    data: {
      firstName: "Tony",
      lastName: "Stark",
      email: "tonyStar@gmail.com",
      hashedPassword: await bcrypt.hash("Hashed_pw123@", saltRounds),
      country: "Sri Lanka",
      phoneNumber: "+94770111222",
      address: "Colombo",
      dob: new Date("2000-05-15"),
      gender: "Male",
      bio: "Software Engineering undergraduate",
      createdAt: new Date(),
      proImgPath: "/uploads/profile1.png",
      preferenceId: pref.preferenceId,
      currentProfessionalRole: "Backend Developer Intern",
      targetProfessionalRole: "Full Stack Developer",
      linkedInURL: "https://linkedIn/Tony"
    }
  });

  const skill1 = await prisma.skill.create({ data: { skillName: "C#" } });
  const skill2 = await prisma.skill.create({ data: { skillName: "React" } });

  await prisma.userSkill.createMany({
    data: [
      { userId: user.userId, skillId: skill1.skillId },
      { userId: user.userId, skillId: skill2.skillId }
    ]
  });

  const proj = await prisma.project.create({
    data: {
      projectName: "AI Interview Bot",
      projectDescription: "Mock interview with AI feedback",
      startDate: new Date("2024-02-01"),
      endDate: new Date("2024-05-01"),
      userId: user.userId
    }
  });

  await prisma.projectSkill.createMany({
    data: [
      { projectId: proj.projectId, skillId: skill1.skillId },
      { projectId: proj.projectId, skillId: skill2.skillId }
    ]
  });

  await prisma.education.create({
    data: {
      degree: "BSc in Software Engineering",
      institution: "University of Colombo",
      startDate: new Date("2021-01-01"),
      endDate: new Date("2025-12-31"),
      userId: user.userId
    }
  });

  await prisma.experience.create({
    data: {
      jobTitle: "Intern Developer",
      company: "ABC Tech",
      startDate: new Date("2024-06-01"),
      endDate: new Date("2024-08-31"),
      description: "Worked on backend services",
      userId: user.userId
    }
  });

  await prisma.achievement.create({
    data: {
      achievementTitle: "Iron man of the year 2010-2022",
      achievementDescription: "I'm Iron Man",
      userId: user.userId
    }
  })

  const cv = await prisma.cv.create({
    data: {
      cvFilepath: "/uploads/cv1.pdf",
      cvImagePath: "/uploads/cv1.png",
      userId: user.userId,
      modifiedDate: randomDate()
    }
  });
  await prisma.keyword.createMany({
    data: [
      { keywordName: "Backend", keywordValue: "Node.js", cvId: cv.cvId },
      { keywordName: "Database", keywordValue: "MySQL", cvId: cv.cvId }
    ]
  });

  const jobRole = await prisma.interviewJobRole.create({
    data: {
      jobRoleName: "Software Engineer",
      jobRoleDescription: "General SWE interview"
    }
  });
  const question = await prisma.videoQuestion.create({
    data: {
      videoPath: "/videos/se_q1.mp4",
      question: "What is polymorphism?",
      interviewJobRoleId: jobRole.interviewJobRoleId
    }
  });

  for (let i = 0; i < 3; i++) {
    const interview = await prisma.interview.create({
      data: {
        interviewScore: randomScore(),
        interviewDate: randomDate(),
        interviewDuration: randomDurationMinutes(),
        isCompleted: i % 2 === 0, 
        completedPercentage: i % 2 === 0 ? 100 : 50,
        experienceLevel: ["Junior", "Mid", "Senior"][i % 3],
        userId: user.userId,
        interviewJobRoleId: jobRole.interviewJobRoleId
      }
    });

    await createInterviewAnalysis(
      interview.interviewId,
      question.videoQuestionId,
      `Answer ${i + 1} by Tony Stark...`,
      `Feedback for answer ${i + 1}`
    );
  }

  // --- User 2 ---
  const pref2 = await prisma.settingsPreference.create({
    data: {
      language: "English",
      publicProfileVisibility: false,
      soundEffect: true,
      emailNotification: false,
      pushNotification: true,
      interviewReminder: false,
      productUpdate: true,
      isanonymous: false,
    }
  });

  const user2 = await prisma.registeredUser.create({
    data: {
      firstName: "Natasha",
      lastName: "Romanoff",
      email: "natasha@gmail.com",
      hashedPassword: await bcrypt.hash("Hashed_pw123@", saltRounds),
      country: "USA",
      phoneNumber: "+12025551234",
      address: "New York",
      dob: new Date("1998-11-22"),
      gender: "Female",
      bio: "Cybersecurity enthusiast",
      createdAt: new Date(),
      proImgPath: "/uploads/profile2.png",
      preferenceId: pref2.preferenceId,
      currentProfessionalRole: "Security Analyst Intern",
      targetProfessionalRole: "Cybersecurity Engineer",
      linkedInURL: "https://linkedIn/Natasha"
    }
  });

  const skill2a = await prisma.skill.create({ data: { skillName: "Python" } });
  const skill2b = await prisma.skill.create({ data: { skillName: "Django" } });

  await prisma.userSkill.createMany({
    data: [
      { userId: user2.userId, skillId: skill2a.skillId },
      { userId: user2.userId, skillId: skill2b.skillId }
    ]
  });

  const proj2 = await prisma.project.create({
    data: {
      projectName: "Web Security Analyzer",
      projectDescription: "Tool for scanning vulnerabilities",
      startDate: new Date("2023-03-01"),
      endDate: new Date("2023-08-01"),
      userId: user2.userId
    }
  });

  await prisma.projectSkill.createMany({
    data: [
      { projectId: proj2.projectId, skillId: skill2a.skillId },
      { projectId: proj2.projectId, skillId: skill2b.skillId }
    ]
  });

  await prisma.education.create({
    data: {
      degree: "BSc in Cybersecurity",
      institution: "MIT",
      startDate: new Date("2018-09-01"),
      endDate: new Date("2022-06-30"),
      userId: user2.userId
    }
  });

  await prisma.experience.create({
    data: {
      jobTitle: "Security Analyst Intern",
      company: "SecureTech",
      startDate: new Date("2022-07-01"),
      endDate: new Date("2022-12-31"),
      description: "Monitored and reported vulnerabilities",
      userId: user2.userId
    }
  });

await prisma.achievement.create({
  data: {
    achievementTitle: "Avenger",
    achievementDescription: "IDK why I'm here",
    userId: user2.userId
  }
})

  const cv2 = await prisma.cv.create({
    data: {
      cvFilepath: "/uploads/cv2.pdf",
      cvImagePath: "/uploads/cv2.png",
      userId: user2.userId,
      modifiedDate: randomDate()
    }
  });

  await prisma.keyword.createMany({
    data: [
      { keywordName: "Security", keywordValue: "Penetration Testing", cvId: cv2.cvId },
      { keywordName: "Programming", keywordValue: "Python", cvId: cv2.cvId }
    ]
  });

  for (let i = 0; i < 3; i++) {
    const interview = await prisma.interview.create({
      data: {
        interviewScore: randomScore(),
        interviewDate: randomDate(),
        interviewDuration: randomDurationMinutes(),
        isCompleted: i % 2 === 0,
        completedPercentage: i % 2 === 0 ? 100 : 50,
        experienceLevel: ["Junior", "Intermediate", "Senior"][i % 3],
        userId: user2.userId,
        interviewJobRoleId: jobRole.interviewJobRoleId
      }
    });
    await createInterviewAnalysis(
      interview.interviewId,
      question.videoQuestionId,
      `Answer ${i + 1} by Natasha...`,
      `Feedback for answer ${i + 1}`
    );
  }

  // --- User 3 ---
  const pref3 = await prisma.settingsPreference.create({
    data: {
      language: "English",
      publicProfileVisibility: true,
      soundEffect: true,
      emailNotification: true,
      pushNotification: false,
      interviewReminder: true,
      productUpdate: false,
      isanonymous: true,
    }
  });

  const user3 = await prisma.registeredUser.create({
    data: {
      firstName: "Bruce",
      lastName: "Banner",
      email: "bruce@gmail.com",
      hashedPassword: await bcrypt.hash("Hashed_pw123@", saltRounds),
      country: "Sri Lanka",
      phoneNumber: "+94778889999",
      address: "Kandy",
      dob: new Date("1995-12-18"),
      gender: "Male",
      bio: "AI/ML Researcher",
      createdAt: new Date(),
      proImgPath: "/uploads/profile3.png",
      preferenceId: pref3.preferenceId,
      currentProfessionalRole: "ML Engineer",
      targetProfessionalRole: "AI Scientist",
      linkedInURL: "https://linkedIn/Bruce"
    }
  });

  const skill3a = await prisma.skill.create({ data: { skillName: "TensorFlow" } });
  const skill3b = await prisma.skill.create({ data: { skillName: "PyTorch" } });

  await prisma.userSkill.createMany({
    data: [
      { userId: user3.userId, skillId: skill3a.skillId },
      { userId: user3.userId, skillId: skill3b.skillId }
    ]
  });

  const proj3 = await prisma.project.create({
    data: {
      projectName: "Medical Imaging AI",
      projectDescription: "Deep learning model for X-ray classification",
      startDate: new Date("2022-01-01"),
      endDate: new Date("2022-09-01"),
      userId: user3.userId
    }
  });

  await prisma.projectSkill.createMany({
    data: [
      { projectId: proj3.projectId, skillId: skill3a.skillId },
      { projectId: proj3.projectId, skillId: skill3b.skillId }
    ]
  });

  await prisma.education.create({
    data: {
      degree: "MSc in AI",
      institution: "Stanford University",
      startDate: new Date("2017-09-01"),
      endDate: new Date("2019-06-30"),
      userId: user3.userId
    }
  });

  await prisma.experience.create({
    data: {
      jobTitle: "Machine Learning Engineer",
      company: "MediTech AI",
      startDate: new Date("2019-07-01"),
      endDate: new Date("2022-12-31"),
      description: "Developed AI solutions for healthcare",
      userId: user3.userId
    }
  });

  await prisma.achievement.create({
    data: {
      achievementTitle: "Hulk",
      achievementDescription: "Hulk",
      userId: user3.userId
    }
  })

  const cv3 = await prisma.cv.create({
    data: {
      cvFilepath: "/uploads/cv3.pdf",
      cvImagePath: "/uploads/cv3.png",
      userId: user3.userId,
      modifiedDate: randomDate()
    }
  });

  await prisma.keyword.createMany({
    data: [
      { keywordName: "AI", keywordValue: "Deep Learning", cvId: cv3.cvId },
      { keywordName: "Medical", keywordValue: "Radiology", cvId: cv3.cvId }
    ]
  });

  for (let i = 0; i < 3; i++) {
    const interview = await prisma.interview.create({
      data: {
        interviewScore: randomScore(),
        interviewDate: randomDate(),
        interviewDuration: randomDurationMinutes(),
        isCompleted: i % 2 === 0,
        completedPercentage: i % 2 === 0 ? 100 : 50,
        experienceLevel: ["Junior", "Intermediate", "Senior"][i % 3],
        userId: user3.userId,
        interviewJobRoleId: jobRole.interviewJobRoleId
      }
    });
    await createInterviewAnalysis(
      interview.interviewId,
      question.videoQuestionId,
      `Answer ${i + 1} by Bruce...`,
      `Feedback for answer ${i + 1}`
    );
  }

  console.log("Seeding done with 3 users, interviews, and performance breakdowns!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });