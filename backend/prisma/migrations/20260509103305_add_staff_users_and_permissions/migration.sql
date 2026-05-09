-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'STAFF';

-- CreateTable
CREATE TABLE "StaffPermission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "carsCreate" BOOLEAN NOT NULL DEFAULT false,
    "carsRead" BOOLEAN NOT NULL DEFAULT false,
    "carsUpdate" BOOLEAN NOT NULL DEFAULT false,
    "carsDelete" BOOLEAN NOT NULL DEFAULT false,
    "shippingCreate" BOOLEAN NOT NULL DEFAULT false,
    "shippingRead" BOOLEAN NOT NULL DEFAULT false,
    "shippingUpdate" BOOLEAN NOT NULL DEFAULT false,
    "shippingDelete" BOOLEAN NOT NULL DEFAULT false,
    "reviewsCreate" BOOLEAN NOT NULL DEFAULT false,
    "reviewsRead" BOOLEAN NOT NULL DEFAULT false,
    "reviewsUpdate" BOOLEAN NOT NULL DEFAULT false,
    "reviewsDelete" BOOLEAN NOT NULL DEFAULT false,
    "contactCreate" BOOLEAN NOT NULL DEFAULT false,
    "contactRead" BOOLEAN NOT NULL DEFAULT false,
    "contactUpdate" BOOLEAN NOT NULL DEFAULT false,
    "contactDelete" BOOLEAN NOT NULL DEFAULT false,
    "careersCreate" BOOLEAN NOT NULL DEFAULT false,
    "careersRead" BOOLEAN NOT NULL DEFAULT false,
    "careersUpdate" BOOLEAN NOT NULL DEFAULT false,
    "careersDelete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffPermission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StaffPermission_userId_key" ON "StaffPermission"("userId");

-- AddForeignKey
ALTER TABLE "StaffPermission" ADD CONSTRAINT "StaffPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
