-- CreateTable
CREATE TABLE "ShippingRegion" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShippingRegion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShippingSchedule" (
    "id" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "shipName" TEXT NOT NULL,
    "voyage" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShippingSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShippingDepartureEntry" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "portName" TEXT NOT NULL,
    "etdText" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShippingDepartureEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShippingArrivalEntry" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "portName" TEXT NOT NULL,
    "etaText" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShippingArrivalEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShippingRegion_slug_key" ON "ShippingRegion"("slug");

-- CreateIndex
CREATE INDEX "ShippingRegion_isActive_sortOrder_idx" ON "ShippingRegion"("isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "ShippingRegion_name_idx" ON "ShippingRegion"("name");

-- CreateIndex
CREATE INDEX "ShippingSchedule_regionId_isActive_sortOrder_idx" ON "ShippingSchedule"("regionId", "isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "ShippingSchedule_company_idx" ON "ShippingSchedule"("company");

-- CreateIndex
CREATE INDEX "ShippingDepartureEntry_scheduleId_sortOrder_idx" ON "ShippingDepartureEntry"("scheduleId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ShippingDepartureEntry_scheduleId_portName_key" ON "ShippingDepartureEntry"("scheduleId", "portName");

-- CreateIndex
CREATE INDEX "ShippingArrivalEntry_scheduleId_sortOrder_idx" ON "ShippingArrivalEntry"("scheduleId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ShippingArrivalEntry_scheduleId_portName_key" ON "ShippingArrivalEntry"("scheduleId", "portName");

-- AddForeignKey
ALTER TABLE "ShippingSchedule" ADD CONSTRAINT "ShippingSchedule_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "ShippingRegion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShippingDepartureEntry" ADD CONSTRAINT "ShippingDepartureEntry_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "ShippingSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShippingArrivalEntry" ADD CONSTRAINT "ShippingArrivalEntry_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "ShippingSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
