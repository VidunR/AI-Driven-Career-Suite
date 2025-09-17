-- CreateTable
CREATE TABLE `SettingsPreference` (
    `preferenceId` INTEGER NOT NULL AUTO_INCREMENT,
    `language` VARCHAR(191) NOT NULL DEFAULT 'English',
    `publicProfileVisibility` BOOLEAN NOT NULL DEFAULT true,
    `soundEffect` BOOLEAN NOT NULL DEFAULT false,
    `emailNotification` BOOLEAN NOT NULL DEFAULT true,
    `pushNotification` BOOLEAN NOT NULL DEFAULT false,
    `interviewReminder` BOOLEAN NOT NULL DEFAULT true,
    `productUpdate` BOOLEAN NOT NULL DEFAULT true,
    `shareProgress` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`preferenceId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RegisteredUser` (
    `userId` INTEGER NOT NULL AUTO_INCREMENT,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `hashedPassword` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NULL,
    `phoneNumber` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `dob` DATE NOT NULL,
    `gender` VARCHAR(191) NULL,
    `bio` VARCHAR(191) NULL,
    `createdAt` DATE NOT NULL,
    `proImgPath` VARCHAR(191) NULL,
    `preferenceId` INTEGER NOT NULL,

    UNIQUE INDEX `RegisteredUser_email_key`(`email`),
    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Project` (
    `projectId` INTEGER NOT NULL AUTO_INCREMENT,
    `projectName` VARCHAR(191) NOT NULL,
    `projectDescription` VARCHAR(191) NULL,
    `startDate` DATE NULL,
    `endDate` DATE NULL,
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`projectId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Skill` (
    `skillId` INTEGER NOT NULL AUTO_INCREMENT,
    `skillName` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`skillId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserSkill` (
    `userId` INTEGER NOT NULL,
    `skillId` INTEGER NOT NULL,

    PRIMARY KEY (`userId`, `skillId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProjectSkill` (
    `projectId` INTEGER NOT NULL,
    `skillId` INTEGER NOT NULL,

    PRIMARY KEY (`projectId`, `skillId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Education` (
    `educationId` INTEGER NOT NULL AUTO_INCREMENT,
    `degree` VARCHAR(191) NOT NULL,
    `institution` VARCHAR(191) NOT NULL,
    `startDate` DATE NULL,
    `endDate` DATE NULL,
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`educationId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Experience` (
    `experienceId` INTEGER NOT NULL AUTO_INCREMENT,
    `jobTitle` VARCHAR(191) NOT NULL,
    `company` VARCHAR(191) NOT NULL,
    `startDate` DATE NULL,
    `endDate` DATE NULL,
    `description` VARCHAR(191) NULL,
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`experienceId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cv` (
    `cvId` INTEGER NOT NULL AUTO_INCREMENT,
    `cvFilepath` VARCHAR(191) NOT NULL,
    `cvImagePath` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`cvId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Keyword` (
    `keywordId` INTEGER NOT NULL AUTO_INCREMENT,
    `keywordName` VARCHAR(191) NOT NULL,
    `keywordValue` VARCHAR(191) NOT NULL,
    `cvId` INTEGER NOT NULL,

    PRIMARY KEY (`keywordId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InterviewJobRole` (
    `interviewJobRoleId` INTEGER NOT NULL AUTO_INCREMENT,
    `jobRoleName` VARCHAR(191) NOT NULL,
    `jobRoleDescription` VARCHAR(191) NULL,

    PRIMARY KEY (`interviewJobRoleId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VideoQuestion` (
    `videoQuestionId` INTEGER NOT NULL AUTO_INCREMENT,
    `videoPath` VARCHAR(191) NOT NULL,
    `question` VARCHAR(191) NOT NULL,
    `interviewJobRoleId` INTEGER NOT NULL,

    PRIMARY KEY (`videoQuestionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Interview` (
    `interviewId` INTEGER NOT NULL AUTO_INCREMENT,
    `interviewScore` DOUBLE NOT NULL DEFAULT 0.0,
    `userId` INTEGER NOT NULL,
    `interviewJobRoleId` INTEGER NOT NULL,

    PRIMARY KEY (`interviewId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InterviewAnalysis` (
    `analyticsId` INTEGER NOT NULL AUTO_INCREMENT,
    `userAnswer` VARCHAR(191) NULL,
    `feedback` VARCHAR(191) NOT NULL,
    `scorePerQuestion` DOUBLE NOT NULL DEFAULT 0.0,
    `interviewId` INTEGER NOT NULL,
    `videoQuestionId` INTEGER NOT NULL,

    PRIMARY KEY (`analyticsId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RegisteredUser` ADD CONSTRAINT `RegisteredUser_preferenceId_fkey` FOREIGN KEY (`preferenceId`) REFERENCES `SettingsPreference`(`preferenceId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `RegisteredUser`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserSkill` ADD CONSTRAINT `UserSkill_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `RegisteredUser`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserSkill` ADD CONSTRAINT `UserSkill_skillId_fkey` FOREIGN KEY (`skillId`) REFERENCES `Skill`(`skillId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectSkill` ADD CONSTRAINT `ProjectSkill_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`projectId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectSkill` ADD CONSTRAINT `ProjectSkill_skillId_fkey` FOREIGN KEY (`skillId`) REFERENCES `Skill`(`skillId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Education` ADD CONSTRAINT `Education_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `RegisteredUser`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Experience` ADD CONSTRAINT `Experience_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `RegisteredUser`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cv` ADD CONSTRAINT `Cv_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `RegisteredUser`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Keyword` ADD CONSTRAINT `Keyword_cvId_fkey` FOREIGN KEY (`cvId`) REFERENCES `Cv`(`cvId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VideoQuestion` ADD CONSTRAINT `VideoQuestion_interviewJobRoleId_fkey` FOREIGN KEY (`interviewJobRoleId`) REFERENCES `InterviewJobRole`(`interviewJobRoleId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Interview` ADD CONSTRAINT `Interview_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `RegisteredUser`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Interview` ADD CONSTRAINT `Interview_interviewJobRoleId_fkey` FOREIGN KEY (`interviewJobRoleId`) REFERENCES `InterviewJobRole`(`interviewJobRoleId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InterviewAnalysis` ADD CONSTRAINT `InterviewAnalysis_interviewId_fkey` FOREIGN KEY (`interviewId`) REFERENCES `Interview`(`interviewId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InterviewAnalysis` ADD CONSTRAINT `InterviewAnalysis_videoQuestionId_fkey` FOREIGN KEY (`videoQuestionId`) REFERENCES `VideoQuestion`(`videoQuestionId`) ON DELETE RESTRICT ON UPDATE CASCADE;
