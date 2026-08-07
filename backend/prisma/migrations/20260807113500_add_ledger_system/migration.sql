-- CreateEnum
CREATE TYPE "LedgerCurrency" AS ENUM ('JPY', 'USD', 'PKR', 'AED');

-- CreateEnum
CREATE TYPE "LedgerDealStatus" AS ENUM ('PENDING_CONFIRMATION', 'CONFIRMED', 'IN_TRANSIT', 'ARRIVED', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LedgerPaymentType" AS ENUM ('DOWN_PAYMENT', 'INSTALLMENT', 'FINAL_PAYMENT', 'REFUND', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "LedgerPaymentMethod" AS ENUM ('BANK_TRANSFER', 'CASH', 'CARD', 'ONLINE', 'OTHER');

-- CreateEnum
CREATE TYPE "LedgerDocumentType" AS ENUM ('INVOICE', 'PURCHASE_RECEIPT', 'INSPECTION_SHEET', 'EXPORT_CERTIFICATE', 'BILL_OF_LADING', 'SHIPPING_INVOICE', 'PAYMENT_RECEIPT', 'OTHER');

-- CreateEnum
CREATE TYPE "LedgerEventType" AS ENUM ('DEAL_CREATED', 'DEAL_UPDATED', 'PAYMENT_ADDED', 'PAYMENT_DELETED', 'DOCUMENT_ADDED', 'DOCUMENT_UPDATED', 'DOCUMENT_DELETED', 'NOTE_ADDED');

-- CreateTable
CREATE TABLE "LedgerDeal" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "carId" TEXT NOT NULL,
    "createdById" TEXT,
    "totalAmount" DECIMAL(14,2) NOT NULL,
    "currency" "LedgerCurrency" NOT NULL DEFAULT 'JPY',
    "downPaymentRequired" DECIMAL(14,2),
    "dueDate" TIMESTAMP(3),
    "status" "LedgerDealStatus" NOT NULL DEFAULT 'PENDING_CONFIRMATION',
    "note" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LedgerDeal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LedgerPayment" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" "LedgerCurrency" NOT NULL,
    "type" "LedgerPaymentType" NOT NULL DEFAULT 'INSTALLMENT',
    "method" "LedgerPaymentMethod" NOT NULL DEFAULT 'OTHER',
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "referenceNo" TEXT,
    "note" TEXT,
    "receivedById" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LedgerPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LedgerDocument" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "type" "LedgerDocumentType" NOT NULL DEFAULT 'OTHER',
    "title" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "fileUrl" TEXT,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER,
    "visibleToCustomer" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "uploadedById" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LedgerDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LedgerEvent" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "type" "LedgerEventType" NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LedgerEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LedgerDeal_orderNumber_key" ON "LedgerDeal"("orderNumber");

-- CreateIndex
CREATE INDEX "LedgerDeal_userId_createdAt_idx" ON "LedgerDeal"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "LedgerDeal_carId_idx" ON "LedgerDeal"("carId");

-- CreateIndex
CREATE INDEX "LedgerDeal_status_createdAt_idx" ON "LedgerDeal"("status", "createdAt");

-- CreateIndex
CREATE INDEX "LedgerDeal_currency_idx" ON "LedgerDeal"("currency");

-- CreateIndex
CREATE INDEX "LedgerDeal_deletedAt_idx" ON "LedgerDeal"("deletedAt");

-- CreateIndex
CREATE INDEX "LedgerPayment_dealId_paidAt_idx" ON "LedgerPayment"("dealId", "paidAt");

-- CreateIndex
CREATE INDEX "LedgerPayment_receivedById_idx" ON "LedgerPayment"("receivedById");

-- CreateIndex
CREATE INDEX "LedgerPayment_type_idx" ON "LedgerPayment"("type");

-- CreateIndex
CREATE INDEX "LedgerPayment_deletedAt_idx" ON "LedgerPayment"("deletedAt");

-- CreateIndex
CREATE INDEX "LedgerDocument_dealId_type_idx" ON "LedgerDocument"("dealId", "type");

-- CreateIndex
CREATE INDEX "LedgerDocument_uploadedById_idx" ON "LedgerDocument"("uploadedById");

-- CreateIndex
CREATE INDEX "LedgerDocument_visibleToCustomer_idx" ON "LedgerDocument"("visibleToCustomer");

-- CreateIndex
CREATE INDEX "LedgerDocument_deletedAt_idx" ON "LedgerDocument"("deletedAt");

-- CreateIndex
CREATE INDEX "LedgerEvent_dealId_createdAt_idx" ON "LedgerEvent"("dealId", "createdAt");

-- CreateIndex
CREATE INDEX "LedgerEvent_createdById_idx" ON "LedgerEvent"("createdById");

-- CreateIndex
CREATE INDEX "LedgerEvent_type_idx" ON "LedgerEvent"("type");

-- AddForeignKey
ALTER TABLE "LedgerDeal" ADD CONSTRAINT "LedgerDeal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerDeal" ADD CONSTRAINT "LedgerDeal_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerDeal" ADD CONSTRAINT "LedgerDeal_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerPayment" ADD CONSTRAINT "LedgerPayment_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "LedgerDeal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerPayment" ADD CONSTRAINT "LedgerPayment_receivedById_fkey" FOREIGN KEY ("receivedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerDocument" ADD CONSTRAINT "LedgerDocument_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "LedgerDeal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerDocument" ADD CONSTRAINT "LedgerDocument_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEvent" ADD CONSTRAINT "LedgerEvent_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "LedgerDeal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEvent" ADD CONSTRAINT "LedgerEvent_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
