/*
  Warnings:

  - You are about to drop the column `experinceLevel` on the `interview` table. All the data in the column will be lost.
  - Added the required column `experienceLevel` to the `Interview` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `interview` DROP COLUMN `experinceLevel`,
    ADD COLUMN `experienceLevel` VARCHAR(191) NOT NULL;
