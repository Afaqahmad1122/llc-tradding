-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('GASOLINE', 'DIESEL', 'HYBRID', 'ELECTRIC', 'PETROL', 'CNG', 'LPG', 'OTHER');

-- CreateEnum
CREATE TYPE "TransmissionType" AS ENUM ('AT', 'MT', 'CVT', 'OTHER');

-- CreateEnum
CREATE TYPE "SteeringType" AS ENUM ('RHD', 'LHD', 'OTHER');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');

-- CreateTable
CREATE TABLE "SystemMeta" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemMeta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Model" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "bodyType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Model_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Car" (
    "id" TEXT NOT NULL,
    "referenceNo" TEXT NOT NULL,
    "title" TEXT,
    "modelId" TEXT NOT NULL,
    "createdById" TEXT,
    "year" INTEGER NOT NULL,
    "mileage" INTEGER,
    "mileageUnit" TEXT NOT NULL DEFAULT 'km',
    "priceGbp" DECIMAL(12,2) NOT NULL,
    "pricePkr" DECIMAL(14,2),
    "fuel" "FuelType",
    "transmission" "TransmissionType",
    "seats" INTEGER,
    "color" TEXT,
    "drive" TEXT,
    "doors" INTEGER,
    "steering" "SteeringType",
    "engineCc" INTEGER,
    "engineCode" TEXT,
    "modelCode" TEXT,
    "country" TEXT,
    "city" TEXT,
    "specifications" JSONB,
    "features" JSONB,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdByAdmin" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Car_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarImage" (
    "id" TEXT NOT NULL,
    "carId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "key" TEXT,
    "altText" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CarImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Model_slug_key" ON "Model"("slug");

-- CreateIndex
CREATE INDEX "Model_brand_name_idx" ON "Model"("brand", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Car_referenceNo_key" ON "Car"("referenceNo");

-- CreateIndex
CREATE INDEX "Car_modelId_year_idx" ON "Car"("modelId", "year");

-- CreateIndex
CREATE INDEX "Car_isPublished_idx" ON "Car"("isPublished");

-- CreateIndex
CREATE INDEX "Car_createdById_idx" ON "Car"("createdById");

-- CreateIndex
CREATE INDEX "CarImage_carId_position_idx" ON "CarImage"("carId", "position");

-- AddForeignKey
ALTER TABLE "Car" ADD CONSTRAINT "Car_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Car" ADD CONSTRAINT "Car_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarImage" ADD CONSTRAINT "CarImage_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE CASCADE ON UPDATE CASCADE;
