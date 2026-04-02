-- CreateTable
CREATE TABLE "reports" (
    "id" SERIAL NOT NULL,
    "repoName" TEXT NOT NULL,
    "repoUrl" TEXT NOT NULL,
    "summaryMetrics" JSONB NOT NULL,
    "fileFindings" JSONB NOT NULL,
    "topIssues" JSONB NOT NULL,
    "score" INTEGER NOT NULL,
    "scoreGrade" TEXT NOT NULL,
    "scoreBreakdown" JSONB NOT NULL,
    "aiReport" TEXT,
    "warnings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);
