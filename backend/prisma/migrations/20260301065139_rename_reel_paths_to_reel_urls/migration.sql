/*
  Warnings:

  - You are about to drop the column `reelPaths` on the `Video` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Video" DROP COLUMN "reelPaths",
ADD COLUMN     "reelUrls" TEXT;
