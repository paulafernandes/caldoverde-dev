/*
  Warnings:

  - Made the column `locale` on table `BusinessLanguage` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BusinessLanguage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "settingsId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "BusinessLanguage_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "BusinessSettings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_BusinessLanguage" ("id", "isEnabled", "language", "locale", "position", "settingsId") SELECT "id", "isEnabled", "language", "locale", "position", "settingsId" FROM "BusinessLanguage";
DROP TABLE "BusinessLanguage";
ALTER TABLE "new_BusinessLanguage" RENAME TO "BusinessLanguage";
CREATE INDEX "BusinessLanguage_settingsId_position_idx" ON "BusinessLanguage"("settingsId", "position");
CREATE UNIQUE INDEX "BusinessLanguage_settingsId_language_key" ON "BusinessLanguage"("settingsId", "language");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
