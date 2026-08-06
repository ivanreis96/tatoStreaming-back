-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "resetPasswordTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "resetPasswordTokenHash" TEXT;

-- CreateIndex
CREATE INDEX "User_resetPasswordTokenHash_idx" ON "public"."User"("resetPasswordTokenHash");
