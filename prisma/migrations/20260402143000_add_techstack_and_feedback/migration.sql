-- AlterTable
ALTER TABLE "reports"
ADD COLUMN "techStack" JSONB NOT NULL DEFAULT '[]';

-- CreateTable
CREATE TABLE "feedback" (
    "id" SERIAL NOT NULL,
    "reportId" INTEGER NOT NULL,
    "rating" TEXT NOT NULL,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);
