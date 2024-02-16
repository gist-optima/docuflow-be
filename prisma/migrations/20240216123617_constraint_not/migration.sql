-- DropForeignKey
ALTER TABLE "snippet" DROP CONSTRAINT "snippet_container_id_fkey";

-- AlterTable
ALTER TABLE "snippet" ALTER COLUMN "container_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "snippet" ADD CONSTRAINT "snippet_container_id_fkey" FOREIGN KEY ("container_id") REFERENCES "container"("id") ON DELETE SET NULL ON UPDATE CASCADE;
