/*
  Warnings:

  - Added the required column `tag` to the `version` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "version" ADD COLUMN     "tag" TEXT NOT NULL DEFAULT '';
