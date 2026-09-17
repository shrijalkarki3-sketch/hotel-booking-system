import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import { connectDB } from '../config/db.js';

dotenv.config();

async function auditAllHotelsAndRooms() {
  await connectDB();
  console.log('===========================================================');
  console.log('       FULL HOTEL & ROOM BOOKING ELIGIBILITY AUDIT         ');
  console.log('===========================================================\n');

  const hotels = await Hotel.find().lean();
  const customer = await User.findOne({ role: 'customer' });

  console.log(`Found ${hotels.length} hotels in database.\n`);

  let totalHotels = hotels.length;
  let bookableHotelsCount = 0;
  let totalRoomsCount = 0;
  let bookableRoomsCount = 0;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 20);
  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 2);

  for (let i = 0; i < hotels.length; i++) {
    const hotel = hotels[i];
    const rooms = await Room.find({ hotelId: hotel._id }).lean();
    totalRoomsCount += rooms.length;

    console.log(`Hotel #${i + 1}: "${hotel.name}" (City: ${hotel.location.city}, Status: ${hotel.status})`);
    console.log(`  Total rooms listed: ${rooms.length}`);

    let hotelBookable = false;

    for (const room of rooms) {
      const isAvailableStatus = !room.status || room.status.toLowerCase() === 'available';
      if (!isAvailableStatus) {
        console.log(`    ⚠️ Room #${room.roomNumber} (${room.roomType}) status is "${room.status}" (NOT AVAILABLE)`);
        continue;
      }

      // Check for overlap
      const overlapping = await Booking.findOne({
        roomId: room._id,
        bookingStatus: { $in: ['confirmed', 'pending'] },
        checkIn: { $lt: dayAfter },
        checkOut: { $gt: tomorrow },
      });

      if (!overlapping) {
        bookableRoomsCount++;
        hotelBookable = true;
        console.log(`    ✓ Room #${room.roomNumber} (${room.roomType}, $${room.pricePerNight}/night) -> ELIGIBLE & BOOKABLE`);
      } else {
        console.log(`    ⚠️ Room #${room.roomNumber} (${room.roomType}) has overlapping booking`);
      }
    }

    if (hotelBookable) {
      bookableHotelsCount++;
    } else {
      console.error(`  ❌ HOTEL NOT BOOKABLE: No bookable rooms found for ${hotel.name}`);
    }

    console.log('');
  }

  console.log('===========================================================');
  console.log(`SUMMARY: ${bookableHotelsCount} / ${totalHotels} Hotels are 100% BOOKABLE`);
  console.log(`ROOMS:   ${bookableRoomsCount} / ${totalRoomsCount} Rooms are READY FOR RESERVATION`);
  console.log('===========================================================');

  if (bookableHotelsCount === totalHotels) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

auditAllHotelsAndRooms().catch(err => {
  console.error(err);
  process.exit(1);
});
