-- 1. Create Enums
CREATE TYPE "Role" AS ENUM ('REQUESTER', 'IT_STAFF', 'ADMINISTRATOR');
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE "TicketStatus" AS ENUM ('NEW', 'OPEN', 'IN_PROGRESS', 'WAITING_FOR_REQUESTER', 'RESOLVED', 'CLOSED', 'REOPENED', 'CANCELLED');

-- 2. Create User table
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'REQUESTER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Create Unique Index on User.email (case-insensitive)
CREATE UNIQUE INDEX "User_email_key" ON "User"(LOWER("email"));

-- 3. Data Migration: Copy existing RequesterUser data into User table if RequesterUser exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'RequesterUser') THEN
        INSERT INTO "User" ("id", "name", "email", "passwordHash", "role", "isActive", "mustChangePassword", "createdAt", "updatedAt")
        SELECT 
            "id", 
            "name", 
            LOWER("email"), 
            '$2b$10$dXNUiQjMMU9pGN.dEoOeb..1jlJa9QNIkOf1IBg06zWrjdtzQmvpu',
            'REQUESTER'::"Role", 
            "isActive", 
            true, 
            "createdAt", 
            "updatedAt"
        FROM "RequesterUser"
        ON CONFLICT ("id") DO NOTHING;
        
        PERFORM setval('User_id_seq', GREATEST((SELECT MAX(id) FROM "User"), 1));
    END IF;
END $$;

-- 4. Create TicketComment table
CREATE TABLE "TicketComment" (
    "id" SERIAL NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "authorId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketComment_pkey" PRIMARY KEY ("id")
);

-- 5. Create TicketInternalNote table
CREATE TABLE "TicketInternalNote" (
    "id" SERIAL NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "authorId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketInternalNote_pkey" PRIMARY KEY ("id")
);

-- 6. Update Ticket table
ALTER TABLE "Ticket" DROP CONSTRAINT IF EXISTS "Ticket_requesterId_fkey";

ALTER TABLE "Ticket" ADD COLUMN IF NOT EXISTS "itPriority" "TicketPriority";
ALTER TABLE "Ticket" ADD COLUMN IF NOT EXISTS "assignedStaffId" INTEGER;
ALTER TABLE "Ticket" ADD COLUMN IF NOT EXISTS "isRequesterResolved" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "Ticket" ALTER COLUMN "requestedPriority" TYPE "TicketPriority" USING "requestedPriority"::"TicketPriority";

UPDATE "Ticket" SET "itPriority" = "requestedPriority" WHERE "itPriority" IS NULL;

ALTER TABLE "Ticket" ALTER COLUMN "itPriority" SET NOT NULL;

ALTER TABLE "Ticket" ALTER COLUMN "currentStatus" TYPE "TicketStatus" USING "currentStatus"::"TicketStatus";
ALTER TABLE "Ticket" ALTER COLUMN "currentStatus" SET DEFAULT 'NEW'::"TicketStatus";

-- 7. Add Foreign Key constraints
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_assignedStaffId_fkey" FOREIGN KEY ("assignedStaffId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "TicketComment" ADD CONSTRAINT "TicketComment_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TicketComment" ADD CONSTRAINT "TicketComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "TicketInternalNote" ADD CONSTRAINT "TicketInternalNote_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TicketInternalNote" ADD CONSTRAINT "TicketInternalNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 8. Create Indexes
CREATE INDEX IF NOT EXISTS "Ticket_requesterId_idx" ON "Ticket"("requesterId");
CREATE INDEX IF NOT EXISTS "Ticket_assignedStaffId_idx" ON "Ticket"("assignedStaffId");
CREATE INDEX IF NOT EXISTS "Ticket_currentStatus_idx" ON "Ticket"("currentStatus");
CREATE INDEX IF NOT EXISTS "Ticket_requestedPriority_idx" ON "Ticket"("requestedPriority");
CREATE INDEX IF NOT EXISTS "Ticket_itPriority_idx" ON "Ticket"("itPriority");
CREATE INDEX IF NOT EXISTS "TicketComment_ticketId_idx" ON "TicketComment"("ticketId");
CREATE INDEX IF NOT EXISTS "TicketInternalNote_ticketId_idx" ON "TicketInternalNote"("ticketId");

-- 9. Drop old RequesterUser table if exists
DROP TABLE IF EXISTS "RequesterUser";

