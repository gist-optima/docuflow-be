-- AlterTable
ALTER TABLE "version" ADD COLUMN     "merge_parent_id" INTEGER,
ADD COLUMN     "parent_id" INTEGER;

-- AddForeignKey
ALTER TABLE "version" ADD CONSTRAINT "version_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "version"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "version" ADD CONSTRAINT "version_merge_parent_id_fkey" FOREIGN KEY ("merge_parent_id") REFERENCES "version"("id") ON DELETE SET NULL ON UPDATE CASCADE;
