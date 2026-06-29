-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" DATETIME,
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "accountOwner" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "collaborator" BOOLEAN DEFAULT false,
    "emailVerified" BOOLEAN DEFAULT false,
    "refreshToken" TEXT,
    "refreshTokenExpires" DATETIME
);

-- CreateTable
CREATE TABLE "AppSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shop" TEXT NOT NULL,
    "minAge" INTEGER NOT NULL DEFAULT 18,
    "redirectUrl" TEXT NOT NULL DEFAULT 'https://www.google.com',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ShopPlan" (
    "shop" TEXT NOT NULL PRIMARY KEY,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Popup" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shop" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Untitled Popup',
    "config" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Translation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "popupId" INTEGER NOT NULL,
    "locale" TEXT NOT NULL,
    "heading" TEXT,
    "subheading" TEXT,
    "submitLabel" TEXT,
    "cancelLabel" TEXT,
    "submitErrorMsg" TEXT,
    "cancelErrorMsg" TEXT,
    "submitAction" TEXT,
    "cancelAction" TEXT,
    "months" TEXT,
    CONSTRAINT "Translation_popupId_fkey" FOREIGN KEY ("popupId") REFERENCES "Popup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CheckoutBanner" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shop" TEXT NOT NULL,
    "config" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TermsSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shop" TEXT NOT NULL,
    "config" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shop" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "AppSettings_shop_key" ON "AppSettings"("shop");

-- CreateIndex
CREATE INDEX "Popup_shop_idx" ON "Popup"("shop");

-- CreateIndex
CREATE UNIQUE INDEX "Translation_popupId_locale_key" ON "Translation"("popupId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "CheckoutBanner_shop_key" ON "CheckoutBanner"("shop");

-- CreateIndex
CREATE INDEX "CheckoutBanner_shop_idx" ON "CheckoutBanner"("shop");

-- CreateIndex
CREATE UNIQUE INDEX "TermsSettings_shop_key" ON "TermsSettings"("shop");

-- CreateIndex
CREATE INDEX "TermsSettings_shop_idx" ON "TermsSettings"("shop");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_shop_createdAt_idx" ON "AnalyticsEvent"("shop", "createdAt");
