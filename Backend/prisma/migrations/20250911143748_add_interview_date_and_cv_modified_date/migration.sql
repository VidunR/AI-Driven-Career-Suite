/*
  Warnings:

  - Added the required column `modifiedDate` to the `Cv` table without a default value. This is not possible if the table is not empty.
  - Added the required column `interviewDate` to the `Interview` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `cv` ADD COLUMN `modifiedDate` DATE NOT NULL;

-- AlterTable
ALTER TABLE `interview` ADD COLUMN `interviewDate` DATE NOT NULL;
