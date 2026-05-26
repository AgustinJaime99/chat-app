-- CreateTable
CREATE TABLE `RoomInvite` (
    `id` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `roomId` VARCHAR(191) NOT NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `RoomInvite_token_key`(`token`),
    INDEX `RoomInvite_token_idx`(`token`),
    INDEX `RoomInvite_roomId_idx`(`roomId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RoomInvite` ADD CONSTRAINT `RoomInvite_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
