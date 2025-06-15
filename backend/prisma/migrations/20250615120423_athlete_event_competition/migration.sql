-- CreateTable
CREATE TABLE "athlete" (
    "id" SERIAL NOT NULL,
    "license" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "birthdate" TIMESTAMP(3) NOT NULL,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "competitionId" INTEGER,

    CONSTRAINT "athlete_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "abbr" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "abbr" TEXT NOT NULL,
    "baseCategory" TEXT NOT NULL,
    "abbrBaseCategory" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "masterAgeGroup" INTEGER,
    "order" INTEGER NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clubs" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "abbr" TEXT NOT NULL,
    "address" TEXT,
    "province" TEXT,
    "country" TEXT,
    "fedNumber" INTEGER,
    "fedAbbr" TEXT,

    CONSTRAINT "clubs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "athlete_info" (
    "id" SERIAL NOT NULL,
    "athleteId" INTEGER NOT NULL,
    "season" INTEGER NOT NULL,
    "clubId" INTEGER NOT NULL,
    "bib" INTEGER NOT NULL,

    CONSTRAINT "athlete_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetitionEvent" (
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

    CONSTRAINT "CompetitionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competitions" (
    "id" SERIAL NOT NULL,
    "eid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isPublished" BOOLEAN NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT,
    "bibPermissions" TEXT[],
    "bibStartNumber" INTEGER,
    "isPaidOnline" BOOLEAN NOT NULL,
    "isSelection" BOOLEAN NOT NULL,
    "isInscriptionVisible" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "competitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CategoryToCompetitionEvent" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CategoryToCompetitionEvent_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ClubToCompetition" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ClubToCompetition_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_FreeClubsToCompetitions" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_FreeClubsToCompetitions_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_AllowedClubsToCompetitions" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AllowedClubsToCompetitions_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "athlete_license_competitionId_key" ON "athlete"("license", "competitionId");

-- CreateIndex
CREATE UNIQUE INDEX "events_name_key" ON "events"("name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_abbr_key" ON "categories"("abbr");

-- CreateIndex
CREATE UNIQUE INDEX "clubs_name_key" ON "clubs"("name");

-- CreateIndex
CREATE UNIQUE INDEX "clubs_abbr_key" ON "clubs"("abbr");

-- CreateIndex
CREATE UNIQUE INDEX "athlete_info_athleteId_season_key" ON "athlete_info"("athleteId", "season");

-- CreateIndex
CREATE UNIQUE INDEX "CompetitionEvent_eid_key" ON "CompetitionEvent"("eid");

-- CreateIndex
CREATE UNIQUE INDEX "competitions_eid_key" ON "competitions"("eid");

-- CreateIndex
CREATE INDEX "_CategoryToCompetitionEvent_B_index" ON "_CategoryToCompetitionEvent"("B");

-- CreateIndex
CREATE INDEX "_ClubToCompetition_B_index" ON "_ClubToCompetition"("B");

-- CreateIndex
CREATE INDEX "_FreeClubsToCompetitions_B_index" ON "_FreeClubsToCompetitions"("B");

-- CreateIndex
CREATE INDEX "_AllowedClubsToCompetitions_B_index" ON "_AllowedClubsToCompetitions"("B");

-- AddForeignKey
ALTER TABLE "athlete" ADD CONSTRAINT "athlete_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "athlete_info" ADD CONSTRAINT "athlete_info_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athlete"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "athlete_info" ADD CONSTRAINT "athlete_info_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitionEvent" ADD CONSTRAINT "CompetitionEvent_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitionEvent" ADD CONSTRAINT "CompetitionEvent_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitionEvent" ADD CONSTRAINT "CompetitionEvent_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "CompetitionEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competitions" ADD CONSTRAINT "competitions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToCompetitionEvent" ADD CONSTRAINT "_CategoryToCompetitionEvent_A_fkey" FOREIGN KEY ("A") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToCompetitionEvent" ADD CONSTRAINT "_CategoryToCompetitionEvent_B_fkey" FOREIGN KEY ("B") REFERENCES "CompetitionEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClubToCompetition" ADD CONSTRAINT "_ClubToCompetition_A_fkey" FOREIGN KEY ("A") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClubToCompetition" ADD CONSTRAINT "_ClubToCompetition_B_fkey" FOREIGN KEY ("B") REFERENCES "competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FreeClubsToCompetitions" ADD CONSTRAINT "_FreeClubsToCompetitions_A_fkey" FOREIGN KEY ("A") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FreeClubsToCompetitions" ADD CONSTRAINT "_FreeClubsToCompetitions_B_fkey" FOREIGN KEY ("B") REFERENCES "competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AllowedClubsToCompetitions" ADD CONSTRAINT "_AllowedClubsToCompetitions_A_fkey" FOREIGN KEY ("A") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AllowedClubsToCompetitions" ADD CONSTRAINT "_AllowedClubsToCompetitions_B_fkey" FOREIGN KEY ("B") REFERENCES "competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
