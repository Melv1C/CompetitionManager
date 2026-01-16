/*
  Warnings:

  - You are about to drop the `CompetitionEvent` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[amId]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `amId` to the `categories` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."CompetitionEvent" DROP CONSTRAINT "CompetitionEvent_competitionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CompetitionEvent" DROP CONSTRAINT "CompetitionEvent_eventId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CompetitionEvent" DROP CONSTRAINT "CompetitionEvent_parentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_CategoryToCompetitionEvent" DROP CONSTRAINT "_CategoryToCompetitionEvent_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."inscriptions" DROP CONSTRAINT "inscriptions_competition_event_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."results" DROP CONSTRAINT "results_competition_event_id_fkey";

-- AlterTable
ALTER TABLE "public"."categories" ADD COLUMN     "amId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "public"."CompetitionEvent";

-- CreateTable
CREATE TABLE "public"."competition_events" (
    "id" SERIAL NOT NULL,
    "eid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "eventStartTime" TIMESTAMP(3) NOT NULL,
    "maxParticipants" INTEGER,
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "competitionId" INTEGER NOT NULL,
    "eventId" INTEGER NOT NULL,
    "parentId" INTEGER,

    CONSTRAINT "competition_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "competition_events_eid_key" ON "public"."competition_events"("eid");

-- CreateIndex
CREATE UNIQUE INDEX "categories_amId_key" ON "public"."categories"("amId");

-- AddForeignKey
ALTER TABLE "public"."competition_events" ADD CONSTRAINT "competition_events_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "public"."competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."competition_events" ADD CONSTRAINT "competition_events_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."competition_events" ADD CONSTRAINT "competition_events_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."competition_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inscriptions" ADD CONSTRAINT "inscriptions_competition_event_id_fkey" FOREIGN KEY ("competition_event_id") REFERENCES "public"."competition_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."results" ADD CONSTRAINT "results_competition_event_id_fkey" FOREIGN KEY ("competition_event_id") REFERENCES "public"."competition_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CategoryToCompetitionEvent" ADD CONSTRAINT "_CategoryToCompetitionEvent_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."competition_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
