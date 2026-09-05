-- CreateIndex for composite queries on Ticket (requesterId, createdAt DESC)
CREATE INDEX "Ticket_requesterId_createdAt_idx" ON "Ticket"("requesterId", "createdAt" DESC);
