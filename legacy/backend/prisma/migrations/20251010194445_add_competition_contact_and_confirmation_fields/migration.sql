/*
  Warnings:

  - Added the required column `contactEmail` to the `competitions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactPhone` to the `competitions` table without a default value. This is not possible if the table is not empty.

*/

-- Step 1: Add columns as nullable first
ALTER TABLE "competitions" ADD COLUMN     "confirmationDeadlineMinutes" INTEGER,
ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "contactPhone" TEXT,
ADD COLUMN     "hasConfirmation" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maxEventPerAthlete" INTEGER;

-- Step 2: Update NULL values to empty strings for existing rows
UPDATE "competitions" SET "contactEmail" = '' WHERE "contactEmail" IS NULL;
UPDATE "competitions" SET "contactPhone" = '' WHERE "contactPhone" IS NULL;

-- Step 3: Make the columns NOT NULL
ALTER TABLE "competitions" ALTER COLUMN "contactEmail" SET NOT NULL;
ALTER TABLE "competitions" ALTER COLUMN "contactPhone" SET NOT NULL;
