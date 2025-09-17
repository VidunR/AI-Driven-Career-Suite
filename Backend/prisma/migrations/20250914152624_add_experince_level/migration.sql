/*
  Warnings:

  - Added the required column `experinceLevel` to the `Interview` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `interview` ADD COLUMN `experinceLevel` VARCHAR(191) NOT NULL;
