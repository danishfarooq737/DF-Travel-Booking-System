/**
 * seed/seed.js
 * -----------------------------------------------------------------------
 * Standalone database seed script for local testing of the Travel Booking
 * System. It talks to MongoDB directly (via the official `mongodb` driver)
 * so it works independently of the backend project — run it from the
 * frontend folder with:
 *
 *   npm run seed
 *
 * It creates:
 *   - One admin user   (see SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD in .env)
 *   - One regular user (see SEED_USER_EMAIL / SEED_USER_PASSWORD in .env)
 *   - Six sample travel listings (flight, hotel, package, tour, cruise)
 *
 * It intentionally does NOT create bookings/payments/notifications, so you
 * can exercise the full booking → payment → confirmation flow yourself
 * against realistic listings and a working login.
 *
 * Password hashing uses bcryptjs with the same salt rounds (12) as the
 * backend's User model, so the seeded accounts log in correctly through
 * the real /api/auth/login endpoint.
 *
 * Safe to re-run: existing seed users/listings (matched by email / title)
 * are skipped rather than duplicated.
 * -----------------------------------------------------------------------
 */
import 'dotenv/config';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

const uri = process.env.SEED_MONGODB_URI || 'mongodb://127.0.0.1:27017/travel-booking-system';
const adminEmail = (process.env.SEED_ADMIN_EMAIL || 'admin@DF Travel System.test').toLowerCase();
const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin123!';
const userEmail = (process.env.SEED_USER_EMAIL || 'jane@DF Travel System.test').toLowerCase();
const userPassword = process.env.SEED_USER_PASSWORD || 'User1234!';

const daysFromNow = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

async function upsertUser(users, { name, email, password, role, phone }) {
  const existing = await users.findOne({ email });
  if (existing) {
    console.log(`  - User already exists, skipping: ${email}`);
    return existing._id;
  }
  const hashed = await bcrypt.hash(password, 12);
  const now = new Date();
  const doc = {
    name,
    email,
    password: hashed,
    role,
    phone: phone || '',
    isVerified: true,
    isActive: true,
    loginAttempts: 0,
    createdAt: now,
    updatedAt: now,
  };
  const result = await users.insertOne(doc);
  console.log(`  - Created ${role} user: ${email} / ${password}`);
  return result.insertedId;
}

async function upsertTravel(travels, adminId, listing) {
  const existing = await travels.findOne({ title: listing.title });
  if (existing) {
    console.log(`  - Listing already exists, skipping: ${listing.title}`);
    return;
  }
  const now = new Date();
  await travels.insertOne({
    ...listing,
    availableSeats: listing.availableSeats ?? listing.totalSeats,
    createdBy: adminId,
    createdAt: now,
    updatedAt: now,
  });
  console.log(`  - Created listing: ${listing.title}`);
}

async function main() {
  console.log(`Connecting to ${uri}...`);
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    const users = db.collection('users');
    const travels = db.collection('travels');

    console.log('\nSeeding users...');
    const adminId = await upsertUser(users, {
      name: 'DF Travel System Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      phone: '+1-555-0100',
    });
    await upsertUser(users, {
      name: 'Jane Traveler',
      email: userEmail,
      password: userPassword,
      role: 'user',
      phone: '+1-555-0101',
    });

    console.log('\nSeeding travel listings...');
    const listings = [
      {
        title: 'Santorini Island Explorer',
        destination: 'Santorini, Greece',
        departureCity: 'Athens',
        description:
          'A 6-day guided tour through the whitewashed villages and volcanic beaches of Santorini, including a sunset catamaran cruise and wine tasting at a local vineyard.',
        images: ['https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800'],
        travelType: 'tour',
        departureDate: daysFromNow(45),
        returnDate: daysFromNow(51),
        durationDays: 6,
        totalSeats: 20,
        price: 1240,
        currency: 'USD',
        status: 'active',
      },
      {
        title: 'Tokyo Direct Flight',
        destination: 'Tokyo, Japan',
        departureCity: 'Los Angeles',
        description:
          'Non-stop economy flight from Los Angeles (LAX) to Tokyo Narita (NRT). Includes one checked bag and in-flight entertainment.',
        images: ['https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800'],
        travelType: 'flight',
        departureDate: daysFromNow(20),
        returnDate: daysFromNow(30),
        durationDays: 1,
        totalSeats: 40,
        price: 780,
        currency: 'USD',
        status: 'active',
      },
      {
        title: 'Grand Hyatt Bali Beachfront Suite',
        destination: 'Bali, Indonesia',
        departureCity: 'N/A',
        description:
          '5 nights in a beachfront suite with private pool access, daily breakfast, and complimentary airport transfers.',
        images: ['https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800'],
        travelType: 'hotel',
        departureDate: daysFromNow(60),
        returnDate: daysFromNow(65),
        durationDays: 5,
        totalSeats: 15,
        price: 950,
        currency: 'USD',
        status: 'active',
      },
      {
        title: 'Swiss Alps Adventure Package',
        destination: 'Interlaken, Switzerland',
        departureCity: 'Zurich',
        description:
          'A 7-day all-inclusive package featuring cable car rides, alpine hiking, and a stay in a mountainside chalet.',
        images: ['https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800'],
        travelType: 'package',
        departureDate: daysFromNow(90),
        returnDate: daysFromNow(97),
        durationDays: 7,
        totalSeats: 12,
        price: 2150,
        currency: 'USD',
        status: 'active',
      },
      {
        title: 'Caribbean Island Hopper Cruise',
        destination: 'Caribbean Sea',
        departureCity: 'Miami',
        description:
          '8-night cruise visiting Nassau, San Juan, and St. Thomas, with all meals and onboard entertainment included.',
        images: ['https://images.unsplash.com/photo-1548574505-5e239809ee19?w=800'],
        travelType: 'cruise',
        departureDate: daysFromNow(75),
        returnDate: daysFromNow(83),
        durationDays: 8,
        totalSeats: 30,
        price: 1680,
        currency: 'USD',
        status: 'active',
      },
      {
        title: 'Weekend in Barcelona (Sold Out)',
        destination: 'Barcelona, Spain',
        departureCity: 'New York',
        description:
          'A short 3-day getaway to Barcelona covering Sagrada Familia, Park Güell, and the Gothic Quarter. Included to demonstrate the sold-out UI state.',
        images: ['https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800'],
        travelType: 'package',
        departureDate: daysFromNow(15),
        returnDate: daysFromNow(18),
        durationDays: 3,
        totalSeats: 10,
        availableSeats: 0,
        price: 890,
        currency: 'USD',
        status: 'soldout',
      },
    ];

    for (const listing of listings) {
      // eslint-disable-next-line no-await-in-loop
      await upsertTravel(travels, adminId, listing);
    }

    console.log('\n✅ Seed complete.');
    console.log('\nLogin with:');
    console.log(`  Admin: ${adminEmail} / ${adminPassword}`);
    console.log(`  User:  ${userEmail} / ${userPassword}`);
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error('\n❌ Seed failed:', err.message);
  process.exit(1);
});
