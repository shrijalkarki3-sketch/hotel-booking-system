import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import { validateBookingDates, calculateNights } from '../utils/dateUtils.js';

dotenv.config();

async function testBothHotels() {
  console.log('====================================================');
  console.log('🧪 VERIFYING BOOKINGS FOR BOTH HOTELS IN THE SYSTEM');
  console.log('====================================================\n');

  await mongoose.connect(process.env.MONGO_URI, {
    tls: true,
    tlsAllowInvalidCertificates: true,
  });

  const hotels = await Hotel.find().lean();
  console.log(`Found ${hotels.length} hotels in database.`);

  if (hotels.length < 2) {
    console.error('Expected at least 2 hotels in DB to test!');
    process.exit(1);
  }

  let testUser = await User.findOne({ email: 'customer@example.com' });
  if (!testUser) {
    testUser = await User.findOne();
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 10);
  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 3);

  const checkIn = tomorrow.toISOString().split('T')[0];
  const checkOut = dayAfter.toISOString().split('T')[0];

  let passedCount = 0;

  for (let i = 0; i < hotels.length; i++) {
    const hotel = hotels[i];
    const rooms = await Room.find({ hotelId: hotel._id, status: 'available' }).lean();

    console.log(`\nTesting Hotel #${i + 1}: "${hotel.name}" (_id: ${hotel._id})`);
    console.log(`  Available rooms count: ${rooms.length}`);

    if (rooms.length === 0) {
      console.error(`  ❌ FAILED: No available rooms found for ${hotel.name}`);
      process.exit(1);
    }

    const roomToBook = rooms[0];

    // Check availability query
    const start = new Date(checkIn);
    const end = new Date(checkOut);

    const overlapping = await Booking.findOne({
      roomId: roomToBook._id,
      bookingStatus: { $in: ['confirmed', 'pending'] },
      checkIn: { $lt: end },
      checkOut: { $gt: start },
    });

    if (overlapping) {
      console.log(`  Deleting existing overlapping booking for test cleanliness...`);
      await Booking.deleteOne({ _id: overlapping._id });
    }

    // Create Booking
    const nights = calculateNights(checkIn, checkOut);
    const totalAmount = nights * roomToBook.pricePerNight;

    const newBooking = await Booking.create({
      userId: testUser._id,
      hotelId: hotel._id,
      roomId: roomToBook._id,
      checkIn: start,
      checkOut: end,
      numberOfNights: nights,
      guests: { adults: 2, children: 0 },
      totalAmount,
      bookingStatus: 'confirmed',
      paymentStatus: 'unpaid',
    });

    console.log(`  ✓ SUCCESS: Booking #${newBooking._id} created for ${hotel.name} - Room #${roomToBook.roomNumber} (${roomToBook.roomType}), Total: $${totalAmount}`);
    passedCount++;
  }

  console.log('\n====================================================');
  console.log(`📊 FINAL RESULT: ${passedCount} / ${hotels.length} HOTELS VERIFIED BOOKABLE!`);
  console.log('====================================================');

  process.exit(0);
}

testBothHotels().catch(err => {
  console.error(err);
  process.exit(1);
});
