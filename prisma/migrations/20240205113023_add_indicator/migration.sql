/*
  Warnings:

  - Added the required column `indicator` to the `snippet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "snippet" ADD COLUMN     "indicator" TEXT NOT NULL;
