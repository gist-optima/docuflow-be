/*
  Warnings:

  - You are about to drop the column `versionId` on the `container` table. All the data in the column will be lost.
  - The primary key for the `snippet` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `version_id` on the `snippet` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "container" DROP CONSTRAINT "container_versionId_fkey";

-- DropForeignKey
ALTER TABLE "snippet" DROP CONSTRAINT "snippet_version_id_fkey";

-- AlterTable
ALTER TABLE "container" DROP COLUMN "versionId";

-- AlterTable
ALTER TABLE "snippet" DROP CONSTRAINT "snippet_pkey",
DROP COLUMN "version_id",
ADD CONSTRAINT "snippet_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "_version_container" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_version_snippet" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_version_container_AB_unique" ON "_version_container"("A", "B");

-- CreateIndex
CREATE INDEX "_version_container_B_index" ON "_version_container"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_version_snippet_AB_unique" ON "_version_snippet"("A", "B");

-- CreateIndex
CREATE INDEX "_version_snippet_B_index" ON "_version_snippet"("B");

-- AddForeignKey
ALTER TABLE "_version_container" ADD CONSTRAINT "_version_container_A_fkey" FOREIGN KEY ("A") REFERENCES "container"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_version_container" ADD CONSTRAINT "_version_container_B_fkey" FOREIGN KEY ("B") REFERENCES "version"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_version_snippet" ADD CONSTRAINT "_version_snippet_A_fkey" FOREIGN KEY ("A") REFERENCES "snippet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_version_snippet" ADD CONSTRAINT "_version_snippet_B_fkey" FOREIGN KEY ("B") REFERENCES "version"("id") ON DELETE CASCADE ON UPDATE CASCADE;
