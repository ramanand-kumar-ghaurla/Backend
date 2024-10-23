/*
  Warnings:

  - You are about to drop the column `catagoryId` on the `Blog` table. All the data in the column will be lost.
  - You are about to drop the `Catagory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Blog" DROP CONSTRAINT "Blog_catagoryId_fkey";

-- AlterTable
ALTER TABLE "Blog" DROP COLUMN "catagoryId",
ADD COLUMN     "tag" "Tag" NOT NULL DEFAULT 'Technology';

-- DropTable
DROP TABLE "Catagory";
