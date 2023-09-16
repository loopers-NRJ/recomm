/*
  Warnings:

  - You are about to drop the column `highestBidedRoomId` on the `Bid` table. All the data in the column will be lost.
  - You are about to drop the column `highestBidId` on the `Room` table. All the data in the column will be lost.
  - Added the required column `title` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Bid" DROP CONSTRAINT "Bid_highestBidedRoomId_fkey";

-- DropIndex
DROP INDEX "Bid_highestBidedRoomId_key";

-- AlterTable
ALTER TABLE "Bid" DROP COLUMN "highestBidedRoomId";

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "parentCategoryId" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "highestBidId";

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentCategoryId_fkey" FOREIGN KEY ("parentCategoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
