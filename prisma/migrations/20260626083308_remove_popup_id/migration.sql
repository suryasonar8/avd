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
    "months" TEXT,
    CONSTRAINT "Translation_popupId_fkey" FOREIGN KEY ("popupId") REFERENCES "Popup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Popup_shop_idx" ON "Popup"("shop");

-- CreateIndex
CREATE UNIQUE INDEX "Translation_popupId_locale_key" ON "Translation"("popupId", "locale");
