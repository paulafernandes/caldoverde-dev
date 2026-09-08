/*
  Warnings:

  - You are about to drop the column `priceCents` on the `MenuItem` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MenuItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "categoryId" INTEGER NOT NULL,
    "subcategoryId" INTEGER,
    "imagePath" TEXT,
    "priceText" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MenuItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "MenuCategory" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MenuItem_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "MenuSubcategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_MenuItem" (
    "categoryId",
    "createdAt",
    "id",
    "imagePath",
    "priceText",
    "isVisible",
    "position",
    "subcategoryId",
    "updatedAt"
)
SELECT
    "categoryId",
    "createdAt",
    "id",
    "imagePath",
    CASE
        WHEN "priceCents" IS NULL THEN NULL
        ELSE replace(
            printf('%.2f', "priceCents" / 100.0),
            '.',
            ','
        ) || ' €'
    END,
    "isVisible",
    "position",
    "subcategoryId",
    "updatedAt"
FROM "MenuItem";
DROP TABLE "MenuItem";
ALTER TABLE "new_MenuItem" RENAME TO "MenuItem";
CREATE INDEX "MenuItem_categoryId_position_idx" ON "MenuItem"("categoryId", "position");
CREATE INDEX "MenuItem_subcategoryId_position_idx" ON "MenuItem"("subcategoryId", "position");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
