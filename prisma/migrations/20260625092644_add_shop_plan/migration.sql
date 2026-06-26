-- CreateTable
CREATE TABLE "ShopPlan" (
    "shop" TEXT NOT NULL PRIMARY KEY,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "updatedAt" DATETIME NOT NULL
);
