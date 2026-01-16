/*
  Warnings:

  - You are about to drop the column `isDeleted` on the `inscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `presenceStatus` on the `inscriptions` table. All the data in the column will be lost.
  - Added the required column `presence_status` to the `inscriptions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."inscriptions" DROP COLUMN "isDeleted",
DROP COLUMN "presenceStatus",
ADD COLUMN     "presence_status" TEXT NOT NULL;
