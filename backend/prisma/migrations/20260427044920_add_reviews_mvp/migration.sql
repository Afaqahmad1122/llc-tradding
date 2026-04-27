-- CreateTable
CREATE TABLE "ReviewEligibility" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "invoiceReference" TEXT NOT NULL,
    "carId" TEXT,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReviewEligibility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "invoiceReference" TEXT NOT NULL,
    "eligibilityId" TEXT,
    "carId" TEXT,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "comment" TEXT NOT NULL,
    "country" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReviewEligibility_invoiceReference_key" ON "ReviewEligibility"("invoiceReference");

-- CreateIndex
CREATE INDEX "ReviewEligibility_userId_isUsed_idx" ON "ReviewEligibility"("userId", "isUsed");

-- CreateIndex
CREATE INDEX "ReviewEligibility_carId_idx" ON "ReviewEligibility"("carId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_invoiceReference_key" ON "Review"("invoiceReference");

-- CreateIndex
CREATE UNIQUE INDEX "Review_eligibilityId_key" ON "Review"("eligibilityId");

-- CreateIndex
CREATE INDEX "Review_isPublished_createdAt_idx" ON "Review"("isPublished", "createdAt");

-- CreateIndex
CREATE INDEX "Review_rating_idx" ON "Review"("rating");

-- CreateIndex
CREATE INDEX "Review_carId_idx" ON "Review"("carId");

-- CreateIndex
CREATE INDEX "Review_userId_createdAt_idx" ON "Review"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "ReviewEligibility" ADD CONSTRAINT "ReviewEligibility_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewEligibility" ADD CONSTRAINT "ReviewEligibility_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_eligibilityId_fkey" FOREIGN KEY ("eligibilityId") REFERENCES "ReviewEligibility"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE SET NULL ON UPDATE CASCADE;
