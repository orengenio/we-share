-- AlterTable
ALTER TABLE "User" ADD COLUMN "passwordResetToken" TEXT UNIQUE,
                   ADD COLUMN "passwordResetExpiry" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "User_passwordResetToken_key" ON "User"("passwordResetToken");
CREATE INDEX "User_passwordResetToken_idx" ON "User"("passwordResetToken");
