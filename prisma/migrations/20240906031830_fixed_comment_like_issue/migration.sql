-- DropForeignKey
ALTER TABLE `Like` DROP FOREIGN KEY `Like_articleId_fkey`;

-- AlterTable
ALTER TABLE `Like` MODIFY `articleId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Like` ADD CONSTRAINT `Like_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `Article`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
