// prisma/seed.js
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Create Preferences
  const pref = await prisma.settingsPreference.create({
    data: {
      language: "English",
      publicProfileVisibility: true,
      soundEffect: false,
      emailNotification: true,
      pushNotification: true,
      interviewReminder: true,
      productUpdate: true,
      shareProgress: true,
    }
  })

  // Create User
  const user = await prisma.registeredUser.create({
    data: {
      firstName: "Tony",
      lastName: "Stark",
      email: "tonyStar@gmail.com",
      hashedPassword: "hashed_pw123",
      country: "Sri Lanka",
      phoneNumber: "+94770111222",
      address: "Colombo",
      dob: new Date("2000-05-15"),
      gender: "Male",
      bio: "Software Engineering undergraduate",
      createdAt: new Date(),
      proImgPath: "/uploads/profile1.png",
      preferenceId: pref.preferenceId,
    }
  })

  //  Create Skills
  const skill1 = await prisma.skill.create({ data: { skillName: "C#" } })
  const skill2 = await prisma.skill.create({ data: { skillName: "React" } })

  // Link User to Skills
  await prisma.userSkill.createMany({
    data: [
      { userId: user.userId, skillId: skill1.skillId },
      { userId: user.userId, skillId: skill2.skillId }
    ]
  })

  // Add Project
  const proj = await prisma.project.create({
    data: {
      projectName: "AI Interview Bot",
      projectDescription: "Mock interview with AI feedback",
      startDate: new Date("2024-02-01"),
      endDate: new Date("2024-05-01"),
      userId: user.userId
    }
  })

  // Link Project to Skills
  await prisma.projectSkill.createMany({
    data: [
      { projectId: proj.projectId, skillId: skill1.skillId },
      { projectId: proj.projectId, skillId: skill2.skillId }
    ]
  })

  // Education
  await prisma.education.create({
    data: {
      degree: "BSc in Software Engineering",
      institution: "University of Colombo",
      startDate: new Date("2021-01-01"),
      endDate: new Date("2025-12-31"),
      userId: user.userId
    }
  })

  // Experience
  await prisma.experience.create({
    data: {
      jobTitle: "Intern Developer",
      company: "ABC Tech",
      startDate: new Date("2024-06-01"),
      endDate: new Date("2024-08-31"),
      description: "Worked on backend services",
      userId: user.userId
    }
  })

  //  CV & Keywords
  const cv = await prisma.cv.create({
    data: {
      cvFilepath: "/uploads/cv1.pdf",
      cvImagePath: "/uploads/cv1.png",
      userId: user.userId
    }
  })
  await prisma.keyword.createMany({
    data: [
      { keywordName: "Backend", keywordValue: "Node.js", cvId: cv.cvId },
      { keywordName: "Database", keywordValue: "MySQL", cvId: cv.cvId }
    ]
  })

  // Interview Setup
  const jobRole = await prisma.interviewJobRole.create({
    data: {
      jobRoleName: "Software Engineer",
      jobRoleDescription: "General SWE interview"
    }
  })
  const question = await prisma.videoQuestion.create({
    data: {
      videoPath: "/videos/se_q1.mp4",
      question: "What is polymorphism?",
      interviewJobRoleId: jobRole.interviewJobRoleId
    }
  })
  const interview = await prisma.interview.create({
    data: {
      interviewScore: 0.0,
      userId: user.userId,
      interviewJobRoleId: jobRole.interviewJobRoleId
    }
  })
  await prisma.interviewAnalysis.create({
    data: {
      userAnswer: "It allows objects to take many forms...",
      feedback: "Good explanation but add an example.",
      scorePerQuestion: 7.5,
      interviewId: interview.interviewId,
      videoQuestionId: question.videoQuestionId
    }
  })

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
      shareProgress: false,
    }
  })

  const user2 = await prisma.registeredUser.create({
    data: {
      firstName: "Natasha",
      lastName: "Romanoff",
      email: "natasha@gmail.com",
      hashedPassword: "hashed_pw456",
      country: "USA",
      phoneNumber: "+12025551234",
      address: "New York",
      dob: new Date("1998-11-22"),
      gender: "Female",
      bio: "Cybersecurity enthusiast",
      createdAt: new Date(),
      proImgPath: "/uploads/profile2.png",
      preferenceId: pref2.preferenceId,
    }
  })

  const skill2a = await prisma.skill.create({ data: { skillName: "Python" } })
  const skill2b = await prisma.skill.create({ data: { skillName: "Django" } })

  await prisma.userSkill.createMany({
    data: [
      { userId: user2.userId, skillId: skill2a.skillId },
      { userId: user2.userId, skillId: skill2b.skillId }
    ]
  })

  const proj2 = await prisma.project.create({
    data: {
      projectName: "Web Security Analyzer",
      projectDescription: "Tool for scanning vulnerabilities",
      startDate: new Date("2023-03-01"),
      endDate: new Date("2023-08-01"),
      userId: user2.userId
    }
  })

  await prisma.projectSkill.createMany({
    data: [
      { projectId: proj2.projectId, skillId: skill2a.skillId },
      { projectId: proj2.projectId, skillId: skill2b.skillId }
    ]
  })

  await prisma.education.create({
    data: {
      degree: "BSc in Cybersecurity",
      institution: "MIT",
      startDate: new Date("2018-09-01"),
      endDate: new Date("2022-06-30"),
      userId: user2.userId
    }
  })

  await prisma.experience.create({
    data: {
      jobTitle: "Security Analyst Intern",
      company: "SecureTech",
      startDate: new Date("2022-07-01"),
      endDate: new Date("2022-12-31"),
      description: "Monitored and reported vulnerabilities",
      userId: user2.userId
    }
  })

  const cv2 = await prisma.cv.create({
    data: {
      cvFilepath: "/uploads/cv2.pdf",
      cvImagePath: "/uploads/cv2.png",
      userId: user2.userId
    }
  })

  await prisma.keyword.createMany({
    data: [
      { keywordName: "Security", keywordValue: "Penetration Testing", cvId: cv2.cvId },
      { keywordName: "Programming", keywordValue: "Python", cvId: cv2.cvId }
    ]
  })

  // --- User 3 ---
  const pref3 = await prisma.settingsPreference.create({
    data: {
      language: "French",
      publicProfileVisibility: true,
      soundEffect: true,
      emailNotification: true,
      pushNotification: false,
      interviewReminder: true,
      productUpdate: false,
      shareProgress: true,
    }
  })

  const user3 = await prisma.registeredUser.create({
    data: {
      firstName: "Bruce",
      lastName: "Banner",
      email: "bruce.banner@gmail.com",
      hashedPassword: "hashed_pw789",
      country: "Canada",
      phoneNumber: "+14165551234",
      address: "Toronto",
      dob: new Date("1995-02-18"),
      gender: "Male",
      bio: "AI and Machine Learning researcher",
      createdAt: new Date(),
      proImgPath: "/uploads/profile3.png",
      preferenceId: pref3.preferenceId,
    }
  })

  const skill3a = await prisma.skill.create({ data: { skillName: "Machine Learning" } })
  const skill3b = await prisma.skill.create({ data: { skillName: "TensorFlow" } })

  await prisma.userSkill.createMany({
    data: [
      { userId: user3.userId, skillId: skill3a.skillId },
      { userId: user3.userId, skillId: skill3b.skillId }
    ]
  })

  const proj3 = await prisma.project.create({
    data: {
      projectName: "Smart Health Predictor",
      projectDescription: "Predict health risks using ML",
      startDate: new Date("2023-05-01"),
      endDate: new Date("2024-01-01"),
      userId: user3.userId
    }
  })

  await prisma.projectSkill.createMany({
    data: [
      { projectId: proj3.projectId, skillId: skill3a.skillId },
      { projectId: proj3.projectId, skillId: skill3b.skillId }
    ]
  })

  await prisma.education.create({
    data: {
      degree: "MSc in AI",
      institution: "University of Toronto",
      startDate: new Date("2020-09-01"),
      endDate: new Date("2022-06-30"),
      userId: user3.userId
    }
  })

  await prisma.experience.create({
    data: {
      jobTitle: "ML Research Intern",
      company: "AI Labs",
      startDate: new Date("2022-07-01"),
      endDate: new Date("2023-02-28"),
      description: "Developed ML models for healthcare",
      userId: user3.userId
    }
  })

  const cv3 = await prisma.cv.create({
    data: {
      cvFilepath: "/uploads/cv3.pdf",
      cvImagePath: "/uploads/cv3.png",
      userId: user3.userId
    }
  })

  await prisma.keyword.createMany({
    data: [
      { keywordName: "AI", keywordValue: "Deep Learning", cvId: cv3.cvId },
      { keywordName: "Framework", keywordValue: "TensorFlow", cvId: cv3.cvId }
    ]
  })

  console.log("Seeding done with 3 users!")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
})
