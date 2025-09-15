/*
  Warnings:

  - You are about to drop the `achievements` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `achievements` DROP FOREIGN KEY `Achievements_userId_fkey`;

-- DropTable
DROP TABLE `achievements`;

-- CreateTable
CREATE TABLE `Achievement` (
    `achievementId` INTEGER NOT NULL AUTO_INCREMENT,
    `achievementTitle` VARCHAR(191) NOT NULL,
    `achievementDescription` VARCHAR(191) NULL,
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`achievementId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Achievement` ADD CONSTRAINT `Achievement_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `RegisteredUser`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;
