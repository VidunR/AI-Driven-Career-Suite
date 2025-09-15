-- CreateTable
CREATE TABLE `Achievements` (
    `achievementId` INTEGER NOT NULL AUTO_INCREMENT,
    `achievementTitle` VARCHAR(191) NOT NULL,
    `achievementDescription` VARCHAR(191) NULL,
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`achievementId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Achievements` ADD CONSTRAINT `Achievements_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `RegisteredUser`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;
