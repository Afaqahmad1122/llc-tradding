CREATE TYPE "LedgerDealType" AS ENUM ('FOB', 'CNF', 'CIF');

ALTER TABLE "LedgerDeal"
ADD COLUMN "dealType" "LedgerDealType" NOT NULL DEFAULT 'FOB';
