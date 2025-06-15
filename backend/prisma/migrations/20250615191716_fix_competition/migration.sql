/*
  Warnings:

  - You are about to drop the column `contactEmail` on the `competitions` table. All the data in the column will be lost.
  - You are about to drop the column `contactPhone` on the `competitions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "competitions" DROP COLUMN "contactEmail",
DROP COLUMN "contactPhone",
ALTER COLUMN "endDate" DROP NOT NULL;

-- AlterTable
ALTER TABLE "organization" ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "contactPhone" TEXT,
ADD COLUMN     "website" TEXT;
