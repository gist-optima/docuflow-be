/*
  Warnings:

  - Added the required column `order` to the `container` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order` to the `snippet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "container" ADD COLUMN     "order" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "snippet" ADD COLUMN     "order" INTEGER NOT NULL;
