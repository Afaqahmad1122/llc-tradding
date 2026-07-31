-- CreateEnum
CREATE TYPE "CarEventType" AS ENUM ('DETAIL_VIEW', 'WHATSAPP_CLICK', 'EMAIL_CLICK');

-- CreateTable
CREATE TABLE "CarEvent" (
    "id" TEXT NOT NULL,
    "carId" TEXT NOT NULL,
    "type" "CarEventType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CarEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CarEvent_carId_type_createdAt_idx" ON "CarEvent"("carId", "type", "createdAt");

-- AddForeignKey
ALTER TABLE "CarEvent" ADD CONSTRAINT "CarEvent_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE CASCADE ON UPDATE CASCADE;
