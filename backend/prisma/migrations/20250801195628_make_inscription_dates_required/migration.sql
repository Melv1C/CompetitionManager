/*
  Warnings:

  - Made the column `inscriptionEndDate` on table `competitions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `inscriptionStartDate` on table `competitions` required. This step will fail if there are existing NULL values in that column.

*/

-- First, update NULL values with sensible defaults
UPDATE "public"."competitions" 
SET "inscriptionStartDate" = CURRENT_TIMESTAMP
WHERE "inscriptionStartDate" IS NULL;

UPDATE "public"."competitions" 
SET "inscriptionEndDate" = ("startDate" - INTERVAL '1 day')
WHERE "inscriptionEndDate" IS NULL;

-- AlterTable
ALTER TABLE "public"."competitions" ALTER COLUMN "inscriptionEndDate" SET NOT NULL,
ALTER COLUMN "inscriptionStartDate" SET NOT NULL;
