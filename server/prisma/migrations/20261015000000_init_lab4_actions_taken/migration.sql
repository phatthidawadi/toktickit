-- CreateEnum
CREATE TYPE "ActionTakenStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN IF NOT EXISTS "version" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE IF NOT EXISTS "ActionTaken" (
    "id" SERIAL NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "actionDateTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "status" "ActionTakenStatus" NOT NULL DEFAULT 'COMPLETED',
    "followUpRequired" BOOLEAN NOT NULL DEFAULT false,
    "followUpNote" TEXT,
    "attachmentNotes" TEXT,
    "performedById" INTEGER NOT NULL,
    "assigneeId" INTEGER,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActionTaken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Ticket_updatedAt_idx" ON "Ticket"("updatedAt");
CREATE INDEX IF NOT EXISTS "ActionTaken_ticketId_idx" ON "ActionTaken"("ticketId");
CREATE INDEX IF NOT EXISTS "ActionTaken_performedById_idx" ON "ActionTaken"("performedById");
CREATE INDEX IF NOT EXISTS "ActionTaken_assigneeId_idx" ON "ActionTaken"("assigneeId");
CREATE INDEX IF NOT EXISTS "ActionTaken_actionDateTime_idx" ON "ActionTaken"("actionDateTime");
CREATE INDEX IF NOT EXISTS "ActionTaken_status_idx" ON "ActionTaken"("status");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ActionTaken_ticketId_fkey'
    ) THEN
        ALTER TABLE "ActionTaken" ADD CONSTRAINT "ActionTaken_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ActionTaken_performedById_fkey'
    ) THEN
        ALTER TABLE "ActionTaken" ADD CONSTRAINT "ActionTaken_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ActionTaken_assigneeId_fkey'
    ) THEN
        ALTER TABLE "ActionTaken" ADD CONSTRAINT "ActionTaken_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
