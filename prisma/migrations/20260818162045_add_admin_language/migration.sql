-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AppSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shop" TEXT NOT NULL,
    "minAge" INTEGER NOT NULL DEFAULT 18,
    "redirectUrl" TEXT NOT NULL DEFAULT 'https://www.google.com',
    "showBrandMark" BOOLEAN NOT NULL DEFAULT true,
    "adminLanguage" TEXT NOT NULL DEFAULT 'English',
    "rememberVisitor" TEXT NOT NULL DEFAULT 'Session only',
    "rememberDays" INTEGER NOT NULL DEFAULT 30,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_AppSettings" ("createdAt", "id", "minAge", "redirectUrl", "shop", "showBrandMark", "updatedAt") SELECT "createdAt", "id", "minAge", "redirectUrl", "shop", "showBrandMark", "updatedAt" FROM "AppSettings";
DROP TABLE "AppSettings";
ALTER TABLE "new_AppSettings" RENAME TO "AppSettings";
CREATE UNIQUE INDEX "AppSettings_shop_key" ON "AppSettings"("shop");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
