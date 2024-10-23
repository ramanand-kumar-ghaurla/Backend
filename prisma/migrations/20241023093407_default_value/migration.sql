/*
  Warnings:

  - You are about to drop the column `blogId` on the `Catagory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Catagory" DROP COLUMN "blogId",
ALTER COLUMN "title" SET DEFAULT 'Technology';
