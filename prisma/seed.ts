import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '../lib/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' }),
})

const SEED_PASSWORD = 'Vanashree@123'

const seedUsers = [
  { fullName: 'Aarav Sharma', email: 'aarav@example.com', phone: '+919876543210' },
  { fullName: 'Priya Deshmukh', email: 'priya@example.com', phone: '+919876543211' },
  { fullName: 'Rohit Patil', email: 'rohit@example.com', phone: '+918217578572' },
  { fullName: 'Sneha Kulkarni', email: 'sneha@example.com', phone: '+919876543213' },
]

interface SeedListing {
  title: string
  description: string
  category: string
  condition: string
  location: string
  imageUrl: string
  status: string
  sellerEmail: string
  daysAgo: number
}

const seedListings: SeedListing[] = [
  {
    title: 'Wooden study table with drawers',
    description:
      'Solid teak wood study table with 2 side drawers. Sturdy, no wobble, great for a student room. Dimensions approx 4ft x 2ft. Minor scratches on one edge, otherwise in great shape.',
    category: 'Furniture',
    condition: 'Gently Used',
    location: 'Parner',
    imageUrl: '/images/gallery/gallery-01.webp',
    status: 'available',
    sellerEmail: 'aarav@example.com',
    daysAgo: 1,
  },
  {
    title: 'Set of NCERT textbooks — Class 8',
    description:
      'Complete set of Class 8 NCERT books (all subjects) in very good condition. No torn pages or markings. Perfect for a student preparing for the next academic year.',
    category: 'Books & Study Material',
    condition: 'Like New',
    location: 'Gatewadi',
    imageUrl: '/images/gallery/gallery-02.webp',
    status: 'available',
    sellerEmail: 'priya@example.com',
    daysAgo: 2,
  },
  {
    title: 'Steel utensils set for kitchen',
    description:
      'Complete steel kitchen utensils set — 6 plates, 6 bowls, 4 glasses, 2 kadhais and serving spoons. Bought for a newlywed couple. Only lightly used, can be given as a wedding gift too.',
    category: 'Kitchen & Utensils',
    condition: 'New',
    location: 'Ahilyanagar',
    imageUrl: '/images/gallery/gallery-03.webp',
    status: 'available',
    sellerEmail: 'rohit@example.com',
    daysAgo: 3,
  },
  {
    title: "Children's bicycle — age 6 to 9",
    description:
      "Red kids bicycle with training wheels (removable), bell and side basket. Tyres recently replaced. My daughter outgrew it in 2 years. Clean and fully functional.",
    category: 'Toys',
    condition: 'Used',
    location: 'Pune',
    imageUrl: '/images/gallery/gallery-04.webp',
    status: 'available',
    sellerEmail: 'sneha@example.com',
    daysAgo: 4,
  },
  {
    title: 'Cotton sarees — 5 pieces',
    description:
      'Bundle of 5 pure cotton handloom sarees in bright colours. One has a small tear near the pallu that can be stitched. Ideal for village donation drive.',
    category: 'Clothing',
    condition: 'Like New',
    location: 'Shirdi',
    imageUrl: '/images/gallery/gallery-05.webp',
    status: 'available',
    sellerEmail: 'aarav@example.com',
    daysAgo: 5,
  },
  {
    title: 'LG 32-inch LED TV',
    description:
      'LG 32-inch LED TV, works perfectly. Remote included. Upgraded to a bigger screen, so letting this go to someone who needs it. Model: Samsung T4300.',
    category: 'Electronics',
    condition: 'Gently Used',
    location: 'Nashik',
    imageUrl: '/images/gallery/samsung.jpg',
    status: 'available',
    sellerEmail: 'rohit@example.com',
    daysAgo: 6,
  },
  {
    title: 'Wooden bookshelf — 3 shelves',
    description:
      'Solid wood bookshelf with 3 shelves and back panel. Holds roughly 80 books. Slight paint chipping on top, can be repainted easily.',
    category: 'Furniture',
    condition: 'Used',
    location: 'Ahilyanagar',
    imageUrl: '/images/gallery/gallery-07.webp',
    status: 'reserved',
    sellerEmail: 'priya@example.com',
    daysAgo: 7,
  },
  {
    title: 'Watering cans and garden tools set',
    description:
      'Two metal watering cans (5L and 10L), a garden spade, hand trowel and pruning shears. Used for our home garden. Perfect for a community plantation group.',
    category: 'Farm & Garden',
    condition: 'Used',
    location: 'Parner',
    imageUrl: '/images/gallery/gallery-08.webp',
    status: 'available',
    sellerEmail: 'rohit@example.com',
    daysAgo: 8,
  },
  {
    title: 'Folding wheelchair',
    description:
      'Lightweight folding wheelchair with padded armrests and footrests. Senior-friendly, brakes work well. Used for 6 months, in excellent condition. Giving free to anyone in genuine need.',
    category: 'Medical Equipment',
    condition: 'Gently Used',
    location: 'Mumbai',
    imageUrl: '/images/gallery/gallery-09.webp',
    status: 'available',
    sellerEmail: 'sneha@example.com',
    daysAgo: 9,
  },
  {
    title: 'Cricket kit with bat and pads',
    description:
      'Full cricket kit — MRF bat, pads, gloves, helmet and 4 tennis balls. Great for a village youth team. Bat has a couple of edges, still solid.',
    category: 'Sports',
    condition: 'Used',
    location: 'Aurangabad',
    imageUrl: '/images/gallery/gallery-10.webp',
    status: 'available',
    sellerEmail: 'aarav@example.com',
    daysAgo: 10,
  },
  {
    title: 'Electric sewing machine',
    description:
      'Usha electric sewing machine with side table. Works smoothly, recently serviced. Great for tailoring courses or home use.',
    category: 'Other',
    condition: 'Gently Used',
    location: 'Ahmednagar',
    imageUrl: '/images/gallery/gallery-11.webp',
    status: 'available',
    sellerEmail: 'priya@example.com',
    daysAgo: 11,
  },
  {
    title: 'Kids storybooks bundle — 20 books',
    description:
      '20 children storybooks — Panchatantra, Akbar-Birbal, rhymes and picture books. All in readable condition. Perfect for a school library.',
    category: 'Books & Study Material',
    condition: 'Used',
    location: 'Gatewadi',
    imageUrl: '/images/gallery/gallery-12.webp',
    status: 'available',
    sellerEmail: 'sneha@example.com',
    daysAgo: 12,
  },
  {
    title: 'Pressure cooker 5 litre',
    description:
      'Prestige 5 litre pressure cooker with 2 extra gaskets and safety valve. Body has minor scratches but cooks perfectly.',
    category: 'Kitchen & Utensils',
    condition: 'Gently Used',
    location: 'Pune',
    imageUrl: '/images/gallery/gallery-13.webp',
    status: 'available',
    sellerEmail: 'rohit@example.com',
    daysAgo: 13,
  },
  {
    title: 'Laptop bag with sleeve',
    description:
      '15.6-inch laptop backpack with padded sleeve, USB port and rain cover. Bought 3 months ago, barely used.',
    category: 'Other',
    condition: 'Like New',
    location: 'Nashik',
    imageUrl: '/images/gallery/gallery-14.webp',
    status: 'available',
    sellerEmail: 'aarav@example.com',
    daysAgo: 14,
  },
  {
    title: 'Reclining office chair',
    description:
      'Ergonomic office chair with recline, lumbar support and armrests. Fabric slightly worn but frame and mechanism are solid.',
    category: 'Furniture',
    condition: 'Used',
    location: 'Mumbai',
    imageUrl: '/images/gallery/gallery-15.webp',
    status: 'donated',
    sellerEmail: 'priya@example.com',
    daysAgo: 15,
  },
  {
    title: 'School bags — 6 pieces',
    description:
      '6 school backpacks (age 6-12), colourful and sturdy. Some lightly used, all zippers working. Great for a back-to-school donation drive.',
    category: 'Clothing',
    condition: 'New',
    location: 'Parner',
    imageUrl: '/images/gallery/gallery-16.webp',
    status: 'available',
    sellerEmail: 'sneha@example.com',
    daysAgo: 16,
  },
]

async function main() {
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10)

  const userMap: Record<string, { id: string }> = {}
  for (const u of seedUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, hashedPassword: passwordHash },
      select: { id: true },
    })
    userMap[u.email] = user
  }
  console.log(`Seeded ${Object.keys(userMap).length} users (password: ${SEED_PASSWORD})`)

  let created = 0
  for (const listing of seedListings) {
    const exists = await prisma.donationListing.findFirst({
      where: { title: listing.title, sellerId: userMap[listing.sellerEmail].id },
      select: { id: true },
    })
    if (exists) continue

    const createdAt = new Date(Date.now() - listing.daysAgo * 24 * 60 * 60 * 1000)
    await prisma.donationListing.create({
      data: {
        title: listing.title,
        description: listing.description,
        category: listing.category,
        condition: listing.condition,
        location: listing.location,
        imageUrl: listing.imageUrl,
        status: listing.status,
        sellerId: userMap[listing.sellerEmail].id,
        createdAt,
      },
    })
    created++
  }
  console.log(`Created ${created} new donation listings`)

  const favouritePairs: Array<[string, string]> = [
    ['aarav@example.com', 'Folding wheelchair'],
    ['aarav@example.com', 'Kids storybooks bundle — 20 books'],
    ['priya@example.com', "Children's bicycle — age 6 to 9"],
  ]
  let favourites = 0
  for (const [email, title] of favouritePairs) {
    const listing = await prisma.donationListing.findFirst({
      where: { title, status: 'available' },
      select: { id: true },
    })
    if (!listing) continue
    const user = userMap[email]
    await prisma.favouriteListing.upsert({
      where: { userId_listingId: { userId: user.id, listingId: listing.id } },
      update: {},
      create: { userId: user.id, listingId: listing.id },
    })
    favourites++
  }
  console.log(`Seeded ${favourites} favourites`)
}

main()
  .then(() => console.log('Seed complete'))
  .catch((err) => {
    console.error('Seed failed:', err)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
