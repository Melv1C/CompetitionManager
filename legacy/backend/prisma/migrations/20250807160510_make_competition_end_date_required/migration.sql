/*
  Warnings:

  - Made the column `endDate` on table `competitions` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."competitions" ALTER COLUMN "endDate" SET NOT NULL;
