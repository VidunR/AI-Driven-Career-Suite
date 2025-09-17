/*
  Warnings:

  - Added the required column `interviewDuration` to the `Interview` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `interview` ADD COLUMN `completedPercentage` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `interviewDuration` TIME NOT NULL,
    ADD COLUMN `isCompleted` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `PerformanceBreakdown` (
    `preformanceId` INTEGER NOT NULL AUTO_INCREMENT,
    `preformanceName` VARCHAR(191) NOT NULL,
    `preformanceScore` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`preformanceId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InterviewAnalysisPerformanceBreakdown` (
    `analyticsId` INTEGER NOT NULL,
    `performanceId` INTEGER NOT NULL,

    PRIMARY KEY (`analyticsId`, `performanceId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `InterviewAnalysisPerformanceBreakdown` ADD CONSTRAINT `InterviewAnalysisPerformanceBreakdown_analyticsId_fkey` FOREIGN KEY (`analyticsId`) REFERENCES `InterviewAnalysis`(`analyticsId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InterviewAnalysisPerformanceBreakdown` ADD CONSTRAINT `InterviewAnalysisPerformanceBreakdown_performanceId_fkey` FOREIGN KEY (`performanceId`) REFERENCES `PerformanceBreakdown`(`preformanceId`) ON DELETE RESTRICT ON UPDATE CASCADE;
