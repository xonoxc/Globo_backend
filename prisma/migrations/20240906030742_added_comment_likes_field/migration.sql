-- AlterTable
ALTER TABLE `Like` ADD COLUMN `parentCommentId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Like` ADD CONSTRAINT `Like_parentCommentId_fkey` FOREIGN KEY (`parentCommentId`) REFERENCES `Comment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
