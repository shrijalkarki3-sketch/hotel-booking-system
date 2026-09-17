import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';

dotenv.config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function testTlsFix() {
  const uri = process.env.MONGO_URI;
  console.log('[TLS Fix Test] Connecting to MongoDB Atlas...');

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log('[TLS Fix Test] Connected successfully to DB:', mongoose.connection.name);

  const hotel111Id = '6a9e4246727f4ec0fdf8298c';
  const hotelAbcId = '6a9e1c11e6239cb266e53926';

  let rooms111 = await Room.find({ hotelId: hotel111Id });
  console.log(`Hotel "111" (${hotel111Id}) currently has ${rooms111.length} rooms.`);

  if (rooms111.length === 0) {
    const r1 = await Room.create({
      hotelId: hotel111Id,
      roomNumber: '101',
      roomType: 'Deluxe',
      description: 'Cozy deluxe room with queen bed, high-speed WiFi, and modern ensuite bath.',
      pricePerNight: 50,
      capacity: { adults: 2, children: 1 },
      amenities: ['Free WiFi', 'Air Conditioning', 'Flat Screen TV'],
      images: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80'],
      status: 'available',
    });
    console.log(`  ✓ Created Room #101 (_id: ${r1._id}) for Hotel 111`);

    const r2 = await Room.create({
      hotelId: hotel111Id,
      roomNumber: '202',
      roomType: 'Suite',
      description: 'Spacious executive suite with king bed, separate seating lounge, and balcony.',
      pricePerNight: 120,
      capacity: { adults: 2, children: 2 },
      amenities: ['Free WiFi', 'Living Room', 'Mini Bar', 'Coffee Maker'],
      images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'],
      status: 'available',
    });
    console.log(`  ✓ Created Room #202 (_id: ${r2._id}) for Hotel 111`);
  }

  const check111 = await Room.find({ hotelId: hotel111Id });
  console.log(`\n=== VERIFICATION ===`);
  console.log(`Hotel "111": ${check111.length} rooms in Atlas DB.`);

  await mongoose.disconnect();
  process.exit(0);
}

testTlsFix().catch(err => {
  console.error('[TLS Fix Error]', err);
  process.exit(1);
});
