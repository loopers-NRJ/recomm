-- DropForeignKey
ALTER TABLE "Bid" DROP CONSTRAINT "Bid_highestBidedRoomId_fkey";

-- AlterTable
ALTER TABLE "Bid" ALTER COLUMN "highestBidedRoomId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_highestBidedRoomId_fkey" FOREIGN KEY ("highestBidedRoomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;
