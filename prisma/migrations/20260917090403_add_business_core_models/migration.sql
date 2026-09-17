-- CreateTable
CREATE TABLE "BusinessSettings" (
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
    "primaryActionUrl" TEXT,
    "defaultLanguage" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BusinessSettingsTranslation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "settingsId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    CONSTRAINT "BusinessSettingsTranslation_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "BusinessSettings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BusinessLanguage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "settingsId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "BusinessLanguage_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "BusinessSettings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BusinessSocialLink" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "settingsId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "BusinessSocialLink_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "BusinessSettings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "imagePath" TEXT NOT NULL,
    "category" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MediaAssetTranslation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mediaId" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "altText" TEXT,
    "caption" TEXT,
    CONSTRAINT "MediaAssetTranslation_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "MediaAsset" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "BusinessSettingsTranslation_language_idx" ON "BusinessSettingsTranslation"("language");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessSettingsTranslation_settingsId_language_key" ON "BusinessSettingsTranslation"("settingsId", "language");

-- CreateIndex
CREATE INDEX "BusinessLanguage_settingsId_position_idx" ON "BusinessLanguage"("settingsId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessLanguage_settingsId_language_key" ON "BusinessLanguage"("settingsId", "language");

-- CreateIndex
CREATE INDEX "BusinessSocialLink_settingsId_position_idx" ON "BusinessSocialLink"("settingsId", "position");

-- CreateIndex
CREATE INDEX "MediaAsset_position_idx" ON "MediaAsset"("position");

-- CreateIndex
CREATE INDEX "MediaAssetTranslation_language_idx" ON "MediaAssetTranslation"("language");

-- CreateIndex
CREATE UNIQUE INDEX "MediaAssetTranslation_mediaId_language_key" ON "MediaAssetTranslation"("mediaId", "language");
