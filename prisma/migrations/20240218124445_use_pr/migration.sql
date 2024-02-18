-- AlterTable
ALTER TABLE "version" ALTER COLUMN "tag" SET DEFAULT 'main';

-- CreateTable
CREATE TABLE "pull_request" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "from_tag" TEXT NOT NULL,
    "to_tag" TEXT NOT NULL,
    "project_id" INTEGER NOT NULL,

    CONSTRAINT "pull_request_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pull_request" ADD CONSTRAINT "pull_request_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
