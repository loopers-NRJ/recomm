-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_roomId_fkey";

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
