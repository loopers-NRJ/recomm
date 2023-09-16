-- DropForeignKey
ALTER TABLE "Model" DROP CONSTRAINT "Model_brandId_fkey";

-- DropForeignKey
ALTER TABLE "VarientOption" DROP CONSTRAINT "VarientOption_modelId_fkey";

-- DropForeignKey
ALTER TABLE "VarientValue" DROP CONSTRAINT "VarientValue_modelId_fkey";

-- DropForeignKey
ALTER TABLE "VarientValue" DROP CONSTRAINT "VarientValue_optionId_fkey";

-- AddForeignKey
ALTER TABLE "Model" ADD CONSTRAINT "Model_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VarientOption" ADD CONSTRAINT "VarientOption_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VarientValue" ADD CONSTRAINT "VarientValue_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "VarientOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VarientValue" ADD CONSTRAINT "VarientValue_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE CASCADE ON UPDATE CASCADE;
