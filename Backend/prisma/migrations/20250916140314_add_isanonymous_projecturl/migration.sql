/*
  Warnings:

  - You are about to drop the column `shareProgress` on the `settingspreference` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `project` ADD COLUMN `githublink` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `settingspreference` DROP COLUMN `shareProgress`,
    ADD COLUMN `isanonymous` BOOLEAN NOT NULL DEFAULT true;
