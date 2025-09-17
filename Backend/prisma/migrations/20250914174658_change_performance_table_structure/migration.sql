/*
  Warnings:

  - You are about to drop the `interviewanalysisperformancebreakdown` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `interviewanalysisperformancebreakdown` DROP FOREIGN KEY `InterviewAnalysisPerformanceBreakdown_analyticsId_fkey`;

-- DropForeignKey
ALTER TABLE `interviewanalysisperformancebreakdown` DROP FOREIGN KEY `InterviewAnalysisPerformanceBreakdown_performanceId_fkey`;

-- DropTable
DROP TABLE `interviewanalysisperformancebreakdown`;

-- CreateTable
CREATE TABLE `InterviewPerformanceBreakdown` (
    `interviewId` INTEGER NOT NULL,
    `performanceId` INTEGER NOT NULL,

    PRIMARY KEY (`interviewId`, `performanceId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `InterviewPerformanceBreakdown` ADD CONSTRAINT `InterviewPerformanceBreakdown_interviewId_fkey` FOREIGN KEY (`interviewId`) REFERENCES `Interview`(`interviewId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InterviewPerformanceBreakdown` ADD CONSTRAINT `InterviewPerformanceBreakdown_performanceId_fkey` FOREIGN KEY (`performanceId`) REFERENCES `PerformanceBreakdown`(`preformanceId`) ON DELETE RESTRICT ON UPDATE CASCADE;
