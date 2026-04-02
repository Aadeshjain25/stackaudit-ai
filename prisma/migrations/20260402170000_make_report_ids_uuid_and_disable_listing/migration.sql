CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE "reports"
ADD COLUMN "public_id" UUID NOT NULL DEFAULT gen_random_uuid();

ALTER TABLE "feedback"
ADD COLUMN "reportId_v2" UUID;

UPDATE "feedback" AS f
SET "reportId_v2" = r."public_id"
FROM "reports" AS r
WHERE f."reportId" = r."id";

DELETE FROM "feedback"
WHERE "reportId_v2" IS NULL;

ALTER TABLE "reports" DROP CONSTRAINT "reports_pkey";
ALTER TABLE "reports" DROP COLUMN "id";
ALTER TABLE "reports" RENAME COLUMN "public_id" TO "id";
ALTER TABLE "reports" ADD CONSTRAINT "reports_pkey" PRIMARY KEY ("id");

ALTER TABLE "feedback" DROP COLUMN "reportId";
ALTER TABLE "feedback" RENAME COLUMN "reportId_v2" TO "reportId";
ALTER TABLE "feedback" ALTER COLUMN "reportId" SET NOT NULL;
