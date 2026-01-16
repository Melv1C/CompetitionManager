-- CreateEnum
CREATE TYPE "LogType" AS ENUM ('APP', 'REQUEST');

-- CreateTable
CREATE TABLE "log" (
    "id" SERIAL NOT NULL,
    "type" "LogType" NOT NULL,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "userId" TEXT,
    "method" TEXT,
    "path" TEXT,
    "statusCode" INTEGER,
    "durationMs" INTEGER,
    "steps" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" TEXT,
    "banned" BOOLEAN,
    "banReason" TEXT,
    "banExpires" TIMESTAMP(3),
    "stripeCustomerId" TEXT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    "impersonatedBy" TEXT,
    "activeOrganizationId" TEXT,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "logo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "metadata" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "website" TEXT,

    CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT,
    "status" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "inviterId" TEXT NOT NULL,

    CONSTRAINT "invitation_pkey" PRIMARY KEY ("id")
);

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
CREATE TABLE "athlete_info" (
    "id" SERIAL NOT NULL,
    "athleteId" INTEGER NOT NULL,
    "season" INTEGER NOT NULL,
    "clubId" INTEGER NOT NULL,
    "bib" INTEGER NOT NULL,

    CONSTRAINT "athlete_info_pkey" PRIMARY KEY ("id")
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
    "amId" INTEGER,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competition_events" (
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
    "contactPhone" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "bibPermissions" TEXT[],
    "bibStartNumber" INTEGER,
    "isPaidOnline" BOOLEAN NOT NULL,
    "isSelection" BOOLEAN NOT NULL,
    "isInscriptionVisible" BOOLEAN NOT NULL,
    "inscriptionStartDate" TIMESTAMP(3) NOT NULL,
    "inscriptionEndDate" TIMESTAMP(3) NOT NULL,
    "maxEventPerAthlete" INTEGER,
    "hasConfirmation" BOOLEAN NOT NULL DEFAULT false,
    "confirmationDeadlineMinutes" INTEGER,
    "recordsFromDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "competitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inscriptions" (
    "id" SERIAL NOT NULL,
    "eid" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "athlete_id" INTEGER NOT NULL,
    "competition_event_id" INTEGER NOT NULL,
    "competition_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "stripe_session_id" TEXT,
    "inscription_date" TIMESTAMP(3) NOT NULL,
    "presence_status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "inscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
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

-- CreateTable
CREATE TABLE "records" (
    "id" SERIAL NOT NULL,
    "performance_value" DOUBLE PRECISION NOT NULL,
    "achieved_date" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "inscription_id" INTEGER NOT NULL,

    CONSTRAINT "records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "results" (
    "id" SERIAL NOT NULL,
    "eid" TEXT NOT NULL,
    "competition_id" INTEGER NOT NULL,
    "competition_event_id" INTEGER NOT NULL,
    "athlete_id" INTEGER NOT NULL,
    "inscription_id" INTEGER,
    "heat_number" INTEGER NOT NULL,
    "starting_order" INTEGER NOT NULL,
    "current_order" INTEGER NOT NULL,
    "final_order" INTEGER,
    "performance_value" DOUBLE PRECISION,
    "wind_speed" DOUBLE PRECISION,
    "points" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "result_details" (
    "id" SERIAL NOT NULL,
    "attempt_number" INTEGER NOT NULL,
    "performance_value" DOUBLE PRECISION NOT NULL,
    "attempts" TEXT[],
    "wind_speed" DOUBLE PRECISION,
    "is_best" BOOLEAN NOT NULL,
    "is_official_record" BOOLEAN NOT NULL,
    "result_id" INTEGER NOT NULL,

    CONSTRAINT "result_details_pkey" PRIMARY KEY ("id")
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

-- CreateTable
CREATE TABLE "_CategoryToCompetitionEvent" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CategoryToCompetitionEvent_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "log_type_idx" ON "log"("type");

-- CreateIndex
CREATE INDEX "log_level_idx" ON "log"("level");

-- CreateIndex
CREATE INDEX "log_userId_idx" ON "log"("userId");

-- CreateIndex
CREATE INDEX "log_createdAt_idx" ON "log"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "organization_slug_key" ON "organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "athlete_license_competitionId_key" ON "athlete"("license", "competitionId");

-- CreateIndex
CREATE UNIQUE INDEX "athlete_info_athleteId_season_key" ON "athlete_info"("athleteId", "season");

-- CreateIndex
CREATE UNIQUE INDEX "clubs_name_key" ON "clubs"("name");

-- CreateIndex
CREATE UNIQUE INDEX "clubs_abbr_key" ON "clubs"("abbr");

-- CreateIndex
CREATE UNIQUE INDEX "events_name_key" ON "events"("name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_abbr_key" ON "categories"("abbr");

-- CreateIndex
CREATE UNIQUE INDEX "categories_amId_key" ON "categories"("amId");

-- CreateIndex
CREATE UNIQUE INDEX "competition_events_eid_key" ON "competition_events"("eid");

-- CreateIndex
CREATE UNIQUE INDEX "competitions_eid_key" ON "competitions"("eid");

-- CreateIndex
CREATE UNIQUE INDEX "inscriptions_eid_key" ON "inscriptions"("eid");

-- CreateIndex
CREATE UNIQUE INDEX "records_inscription_id_key" ON "records"("inscription_id");

-- CreateIndex
CREATE UNIQUE INDEX "results_eid_key" ON "results"("eid");

-- CreateIndex
CREATE UNIQUE INDEX "results_competition_event_id_athlete_id_key" ON "results"("competition_event_id", "athlete_id");

-- CreateIndex
CREATE UNIQUE INDEX "result_details_result_id_attempt_number_key" ON "result_details"("result_id", "attempt_number");

-- CreateIndex
CREATE INDEX "_FreeClubsToCompetitions_B_index" ON "_FreeClubsToCompetitions"("B");

-- CreateIndex
CREATE INDEX "_AllowedClubsToCompetitions_B_index" ON "_AllowedClubsToCompetitions"("B");

-- CreateIndex
CREATE INDEX "_CategoryToCompetitionEvent_B_index" ON "_CategoryToCompetitionEvent"("B");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "athlete" ADD CONSTRAINT "athlete_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "athlete_info" ADD CONSTRAINT "athlete_info_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athlete"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "athlete_info" ADD CONSTRAINT "athlete_info_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competition_events" ADD CONSTRAINT "competition_events_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competition_events" ADD CONSTRAINT "competition_events_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competition_events" ADD CONSTRAINT "competition_events_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "competition_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competitions" ADD CONSTRAINT "competitions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscriptions" ADD CONSTRAINT "inscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscriptions" ADD CONSTRAINT "inscriptions_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "athlete"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscriptions" ADD CONSTRAINT "inscriptions_competition_event_id_fkey" FOREIGN KEY ("competition_event_id") REFERENCES "competition_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscriptions" ADD CONSTRAINT "inscriptions_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athlete"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "records" ADD CONSTRAINT "records_inscription_id_fkey" FOREIGN KEY ("inscription_id") REFERENCES "inscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "results" ADD CONSTRAINT "results_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "results" ADD CONSTRAINT "results_competition_event_id_fkey" FOREIGN KEY ("competition_event_id") REFERENCES "competition_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "results" ADD CONSTRAINT "results_athlete_id_fkey" FOREIGN KEY ("athlete_id") REFERENCES "athlete"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "results" ADD CONSTRAINT "results_inscription_id_fkey" FOREIGN KEY ("inscription_id") REFERENCES "inscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result_details" ADD CONSTRAINT "result_details_result_id_fkey" FOREIGN KEY ("result_id") REFERENCES "results"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FreeClubsToCompetitions" ADD CONSTRAINT "_FreeClubsToCompetitions_A_fkey" FOREIGN KEY ("A") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FreeClubsToCompetitions" ADD CONSTRAINT "_FreeClubsToCompetitions_B_fkey" FOREIGN KEY ("B") REFERENCES "competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AllowedClubsToCompetitions" ADD CONSTRAINT "_AllowedClubsToCompetitions_A_fkey" FOREIGN KEY ("A") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AllowedClubsToCompetitions" ADD CONSTRAINT "_AllowedClubsToCompetitions_B_fkey" FOREIGN KEY ("B") REFERENCES "competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToCompetitionEvent" ADD CONSTRAINT "_CategoryToCompetitionEvent_A_fkey" FOREIGN KEY ("A") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToCompetitionEvent" ADD CONSTRAINT "_CategoryToCompetitionEvent_B_fkey" FOREIGN KEY ("B") REFERENCES "competition_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
