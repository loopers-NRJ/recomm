/*
  Warnings:

  - You are about to drop the column `brandId` on the `Model` table. All the data in the column will be lost.
  - You are about to drop the `Brand` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BrandImage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CategoryImage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ModelImage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_CategoryToModel` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `categoryId` to the `Model` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Brand" DROP CONSTRAINT "Brand_imageId_fkey";

-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_imageId_fkey";

-- DropForeignKey
ALTER TABLE "Image" DROP CONSTRAINT "Image_productId_fkey";

-- DropForeignKey
ALTER TABLE "Model" DROP CONSTRAINT "Model_brandId_fkey";

-- DropForeignKey
ALTER TABLE "Model" DROP CONSTRAINT "Model_imageId_fkey";

-- DropForeignKey
ALTER TABLE "_CategoryToModel" DROP CONSTRAINT "_CategoryToModel_A_fkey";

-- DropForeignKey
ALTER TABLE "_CategoryToModel" DROP CONSTRAINT "_CategoryToModel_B_fkey";

-- AlterTable
ALTER TABLE "Model" DROP COLUMN "brandId",
ADD COLUMN     "categoryId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastActive" TIMESTAMP(3);

-- DropTable
DROP TABLE "Brand";

-- DropTable
DROP TABLE "BrandImage";

-- DropTable
DROP TABLE "CategoryImage";

-- DropTable
DROP TABLE "ModelImage";

-- DropTable
DROP TABLE "_CategoryToModel";

-- CreateTable
CREATE TABLE "VarientOption" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "modelId" TEXT,

    CONSTRAINT "VarientOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VarientValue" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "optionId" TEXT,
    "modelId" TEXT,

    CONSTRAINT "VarientValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProductToVarientValue" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "VarientOption_modelId_idx" ON "VarientOption"("modelId");

-- CreateIndex
CREATE UNIQUE INDEX "VarientOption_name_modelId_key" ON "VarientOption"("name", "modelId");

-- CreateIndex
CREATE INDEX "VarientValue_optionId_idx" ON "VarientValue"("optionId");

-- CreateIndex
CREATE UNIQUE INDEX "VarientValue_name_optionId_modelId_key" ON "VarientValue"("name", "optionId", "modelId");

-- CreateIndex
CREATE UNIQUE INDEX "_ProductToVarientValue_AB_unique" ON "_ProductToVarientValue"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductToVarientValue_B_index" ON "_ProductToVarientValue"("B");

-- CreateIndex
CREATE INDEX "Bid_userId_idx" ON "Bid"("userId");

-- CreateIndex
CREATE INDEX "Bid_roomId_idx" ON "Bid"("roomId");

-- CreateIndex
CREATE INDEX "Category_parentCategoryId_idx" ON "Category"("parentCategoryId");

-- CreateIndex
CREATE INDEX "Image_productId_idx" ON "Image"("productId");

-- CreateIndex
CREATE INDEX "Model_categoryId_idx" ON "Model"("categoryId");

-- CreateIndex
CREATE INDEX "Product_sellerId_idx" ON "Product"("sellerId");

-- CreateIndex
CREATE INDEX "Product_modelId_idx" ON "Product"("modelId");

-- CreateIndex
CREATE INDEX "Wish_userId_idx" ON "Wish"("userId");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Model" ADD CONSTRAINT "Model_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Model" ADD CONSTRAINT "Model_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VarientOption" ADD CONSTRAINT "VarientOption_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VarientValue" ADD CONSTRAINT "VarientValue_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "VarientOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VarientValue" ADD CONSTRAINT "VarientValue_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToVarientValue" ADD CONSTRAINT "_ProductToVarientValue_A_fkey" FOREIGN KEY ("A") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToVarientValue" ADD CONSTRAINT "_ProductToVarientValue_B_fkey" FOREIGN KEY ("B") REFERENCES "VarientValue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
