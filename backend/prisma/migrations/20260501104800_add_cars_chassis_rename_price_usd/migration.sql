-- AlterTable
ALTER TABLE "Car" RENAME COLUMN "priceGbp" TO "priceUsd";

-- AlterTable
ALTER TABLE "Car" ADD COLUMN "chassisNo" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Car_chassisNo_key" ON "Car"("chassisNo");

-- CreateIndex
CREATE INDEX "Car_year_priceUsd_idx" ON "Car"("year", "priceUsd");
