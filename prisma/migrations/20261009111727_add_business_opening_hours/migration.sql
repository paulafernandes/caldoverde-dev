-- CreateTable
CREATE TABLE "BusinessOpeningHour" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "settingsId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "opensAt" TEXT NOT NULL,
    "closesAt" TEXT NOT NULL,
    CONSTRAINT "BusinessOpeningHour_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "BusinessSettings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "BusinessOpeningHour_settingsId_dayOfWeek_idx" ON "BusinessOpeningHour"("settingsId", "dayOfWeek");
