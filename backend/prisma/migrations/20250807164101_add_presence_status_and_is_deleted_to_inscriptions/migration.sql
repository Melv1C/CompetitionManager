/*
  Warnings:

  - Added the required column `isDeleted` to the `inscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `presenceStatus` to the `inscriptions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."inscriptions" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL,
ADD COLUMN     "presenceStatus" TEXT NOT NULL;
