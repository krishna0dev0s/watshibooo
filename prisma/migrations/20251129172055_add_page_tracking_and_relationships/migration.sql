-- AlterTable
ALTER TABLE "Page" ADD COLUMN     "avgTimeSpent" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastVisited" TIMESTAMP(3),
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "priority" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "uniqueVisitors" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "PageVisit" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageVisit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPageProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "visitCount" INTEGER NOT NULL DEFAULT 0,
    "totalTimeSpent" INTEGER NOT NULL DEFAULT 0,
    "lastVisited" TIMESTAMP(3),
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completionPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "rating" INTEGER,
    "feedback" TEXT,
    "isFavorited" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPageProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PageVisit_pageId_idx" ON "PageVisit"("pageId");

-- CreateIndex
CREATE INDEX "PageVisit_sessionId_idx" ON "PageVisit"("sessionId");

-- CreateIndex
CREATE INDEX "PageVisit_createdAt_idx" ON "PageVisit"("createdAt");

-- CreateIndex
CREATE INDEX "UserPageProgress_userId_idx" ON "UserPageProgress"("userId");

-- CreateIndex
CREATE INDEX "UserPageProgress_pageId_idx" ON "UserPageProgress"("pageId");

-- CreateIndex
CREATE INDEX "UserPageProgress_isCompleted_idx" ON "UserPageProgress"("isCompleted");

-- CreateIndex
CREATE UNIQUE INDEX "UserPageProgress_userId_pageId_key" ON "UserPageProgress"("userId", "pageId");

-- CreateIndex
CREATE INDEX "Page_status_idx" ON "Page"("status");

-- AddForeignKey
ALTER TABLE "PageVisit" ADD CONSTRAINT "PageVisit_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPageProgress" ADD CONSTRAINT "UserPageProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPageProgress" ADD CONSTRAINT "UserPageProgress_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;
