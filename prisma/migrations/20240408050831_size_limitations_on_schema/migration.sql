/*
  Warnings:

  - You are about to alter the column `title` on the `Article` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `password` on the `User` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(20)`.

*/
-- AlterTable
ALTER TABLE `Article` MODIFY `title` VARCHAR(100) NOT NULL,
    MODIFY `content` VARCHAR(1000) NOT NULL;

-- AlterTable
ALTER TABLE `User` MODIFY `password` VARCHAR(20) NOT NULL;
