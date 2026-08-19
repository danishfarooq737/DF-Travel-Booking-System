
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Travel = require('../models/Travel');

const ADMIN_EMAIL = (process.env.SEED_ADMIN_EMAIL || 'admin@DF Travel System.test').toLowerCase();
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'Admin123!';
const USER_EMAIL = (process.env.SEED_USER_EMAIL || 'jane@DF Travel System.test').toLowerCase();
const USER_PASSWORD = process.env.SEED_USER_PASSWORD || 'User1234!';

const daysFromNow = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

async function upsertUser({ name, email, password, role, phone }) {
  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`  - User already exists, skipping: ${email}`);
    return existing;
  }
  // Plain password here is intentional — User.pre('save') hashes it.
  const user = await User.create({ name, email, password, role, phone, isVerified: true });
  console.log(`  - Created ${role} user: ${email} / ${password}`);
  return user;
}

async function upsertTravel(adminId, listing) {
  const existing = await Travel.findOne({ title: listing.title });
  if (existing) {
    console.log(`  - Listing already exists, skipping: ${listing.title}`);
    return;
  }
  await Travel.create({
    ...listing,
    availableSeats: listing.availableSeats ?? listing.totalSeats,
    createdBy: adminId,
  });
  console.log(`  - Created listing: ${listing.title}`);
}

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
      'A short 3-day getaway to Barcelona covering Sagrada Familia, Park Guell, and the Gothic Quarter. Included to demonstrate the sold-out UI state.',
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

async function main() {
  await connectDB();

  console.log('\nSeeding users...');
  const admin = await upsertUser({
    name: 'DF Travel System Admin',
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: 'admin',
    phone: '+1-555-0100',
  });
  await upsertUser({
    name: 'Jane Traveler',
    email: USER_EMAIL,
    password: USER_PASSWORD,
    role: 'user',
    phone: '+1-555-0101',
  });

  console.log('\nSeeding travel listings...');
  for (const listing of listings) {
    // eslint-disable-next-line no-await-in-loop
    await upsertTravel(admin._id, listing);
  }

  console.log('\n✅ Seed complete.');
  console.log('\nLogin with:');
  console.log(`  Admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log(`  User:  ${USER_EMAIL} / ${USER_PASSWORD}`);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(async (err) => {
  console.error('\n❌ Seed failed:', err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
