-- CreateTable
CREATE TABLE "CheckoutAgeVerification" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shop" TEXT NOT NULL,
    "config" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "CheckoutAgeVerification_shop_key" ON "CheckoutAgeVerification"("shop");

-- CreateIndex
CREATE INDEX "CheckoutAgeVerification_shop_idx" ON "CheckoutAgeVerification"("shop");
