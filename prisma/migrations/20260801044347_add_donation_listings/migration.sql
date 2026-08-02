-- CreateTable
CREATE TABLE "donation_listings" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL DEFAULT 0,
    "category" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "imageUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'available',
    "sellerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "donation_listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favourite_listings" (
    "userId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favourite_listings_pkey" PRIMARY KEY ("userId","listingId")
);

-- CreateIndex
CREATE INDEX "donation_listings_status_createdAt_idx" ON "donation_listings"("status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "donation_listings_category_status_idx" ON "donation_listings"("category", "status");

-- CreateIndex
CREATE INDEX "donation_listings_location_idx" ON "donation_listings"("location");

-- CreateIndex
CREATE INDEX "donation_listings_sellerId_idx" ON "donation_listings"("sellerId");

-- CreateIndex
CREATE INDEX "favourite_listings_userId_createdAt_idx" ON "favourite_listings"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "donation_listings" ADD CONSTRAINT "donation_listings_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favourite_listings" ADD CONSTRAINT "favourite_listings_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "donation_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favourite_listings" ADD CONSTRAINT "favourite_listings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
