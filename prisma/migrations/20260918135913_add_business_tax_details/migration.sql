-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BusinessSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'business',
    "name" TEXT NOT NULL,
    "logoPath" TEXT,
    "faviconPath" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "postalCode" TEXT,
    "city" TEXT,
    "countryCode" TEXT,
    "taxId" TEXT,
    "fiscalAddressSameAsBusiness" BOOLEAN NOT NULL DEFAULT true,
    "fiscalAddressLine1" TEXT,
    "fiscalAddressLine2" TEXT,
    "fiscalPostalCode" TEXT,
    "fiscalCity" TEXT,
    "fiscalCountryCode" TEXT,
    "primaryActionUrl" TEXT,
    "defaultLanguage" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_BusinessSettings" ("addressLine1", "addressLine2", "city", "countryCode", "createdAt", "defaultLanguage", "email", "faviconPath", "id", "logoPath", "name", "phone", "postalCode", "primaryActionUrl", "updatedAt") SELECT "addressLine1", "addressLine2", "city", "countryCode", "createdAt", "defaultLanguage", "email", "faviconPath", "id", "logoPath", "name", "phone", "postalCode", "primaryActionUrl", "updatedAt" FROM "BusinessSettings";
DROP TABLE "BusinessSettings";
ALTER TABLE "new_BusinessSettings" RENAME TO "BusinessSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
