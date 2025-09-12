/*
  Warnings:

  - You are about to drop the column `isAccepted` on the `course_discussion_replies` table. All the data in the column will be lost.
  - You are about to drop the column `isInstructor` on the `course_discussion_replies` table. All the data in the column will be lost.
  - You are about to drop the column `chapterId` on the `course_progress` table. All the data in the column will be lost.
  - You are about to drop the column `avatar` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isInstructor` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `subscriptions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `trials` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,courseId]` on the table `course_progress` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."course_discussion_replies" DROP CONSTRAINT "course_discussion_replies_discussionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."subscriptions" DROP CONSTRAINT "subscriptions_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."trials" DROP CONSTRAINT "trials_courseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."trials" DROP CONSTRAINT "trials_userId_fkey";

-- DropIndex
DROP INDEX "public"."course_progress_courseId_userId_chapterId_key";

-- AlterTable
ALTER TABLE "public"."course_discussion_replies" DROP COLUMN "isAccepted",
DROP COLUMN "isInstructor";

-- AlterTable
ALTER TABLE "public"."course_progress" DROP COLUMN "chapterId",
ADD COLUMN     "lastWatched" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalWatched" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "avatar",
DROP COLUMN "isInstructor",
DROP COLUMN "password",
ADD COLUMN     "hashedPassword" TEXT,
ALTER COLUMN "name" DROP NOT NULL;

-- DropTable
DROP TABLE "public"."subscriptions";

-- DropTable
DROP TABLE "public"."trials";

-- CreateTable
CREATE TABLE "public"."platform_subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT NOT NULL,
    "stripeCustomerId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "planType" TEXT NOT NULL,
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "trialEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."course_accesses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "accessType" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_accesses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "platform_subscriptions_stripeSubscriptionId_key" ON "public"."platform_subscriptions"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "course_accesses_userId_courseId_key" ON "public"."course_accesses"("userId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "course_progress_userId_courseId_key" ON "public"."course_progress"("userId", "courseId");

-- AddForeignKey
ALTER TABLE "public"."course_discussion_replies" ADD CONSTRAINT "course_discussion_replies_discussionId_fkey" FOREIGN KEY ("discussionId") REFERENCES "public"."course_discussions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."platform_subscriptions" ADD CONSTRAINT "platform_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_accesses" ADD CONSTRAINT "course_accesses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_accesses" ADD CONSTRAINT "course_accesses_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
