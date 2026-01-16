/*
  Warnings:

  - You are about to drop the column `amount_paid` on the `inscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `payment_session_id` on the `inscriptions` table. All the data in the column will be lost.
  - You are about to drop the `payment_sessions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."inscriptions" DROP CONSTRAINT "inscriptions_payment_session_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."payment_sessions" DROP CONSTRAINT "payment_sessions_competition_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."payment_sessions" DROP CONSTRAINT "payment_sessions_user_id_fkey";

-- AlterTable
ALTER TABLE "public"."inscriptions" DROP COLUMN "amount_paid",
DROP COLUMN "payment_session_id";

-- DropTable
DROP TABLE "public"."payment_sessions";

-- CreateTable
CREATE TABLE "public"."transactions" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "athleteId" INTEGER NOT NULL,
    "competitionId" INTEGER NOT NULL,
    "amountPaid" DOUBLE PRECISION NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL,
    "stripeSessionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "public"."athlete"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "public"."competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
