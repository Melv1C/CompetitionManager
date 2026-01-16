-- AlterTable
ALTER TABLE "public"."inscriptions" ADD COLUMN     "payment_session_id" INTEGER;

-- CreateTable
CREATE TABLE "public"."payment_sessions" (
    "id" SERIAL NOT NULL,
    "eid" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "competition_id" INTEGER NOT NULL,
    "payment_intent_id" TEXT,
    "status" TEXT NOT NULL,
    "amount_total" DOUBLE PRECISION NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "paid_at" TIMESTAMP(3),

    CONSTRAINT "payment_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_sessions_eid_key" ON "public"."payment_sessions"("eid");

-- AddForeignKey
ALTER TABLE "public"."payment_sessions" ADD CONSTRAINT "payment_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_sessions" ADD CONSTRAINT "payment_sessions_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "public"."competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inscriptions" ADD CONSTRAINT "inscriptions_payment_session_id_fkey" FOREIGN KEY ("payment_session_id") REFERENCES "public"."payment_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
