/*
  Warnings:

  - You are about to drop the column `tag` on the `Blog` table. All the data in the column will be lost.
  - Added the required column `catagoryId` to the `Blog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Blog" DROP COLUMN "tag",
ADD COLUMN     "catagoryId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Catagory" (
    "id" TEXT NOT NULL,
    "title" "Tag" NOT NULL,
    "blogId" TEXT NOT NULL,

    CONSTRAINT "Catagory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Blog" ADD CONSTRAINT "Blog_catagoryId_fkey" FOREIGN KEY ("catagoryId") REFERENCES "Catagory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
