import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';
import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';

dotenv.config();

const sampleUsers = [
  {
    name: 'System Admin',
    email: 'admin@example.com',
    password: 'password123',
    phone: '+977 9801111111',
    role: 'admin',
    status: 'active',
  },
  {
    name: 'Sarah Manager',
    email: 'manager@example.com',
    password: 'password123',
    phone: '+977 9802222222',
    role: 'hotel_manager',
    status: 'active',
  },
  {
    name: 'John Customer',
    email: 'customer@example.com',
    password: 'password123',
    phone: '+977 9803333333',
    role: 'customer',
    status: 'active',
  },
];

const sampleHotels = [
  {
    name: 'Fewa Paradise Resort & Spa',
    description: 'A tranquil luxury resort situated directly on the shore of Fewa Lake in Pokhara, featuring panoramic views of the Annapurna mountain range, infinity pool, ayurvedic spa, and fine dining restaurants.',
    location: {
      city: 'Pokhara',
      state: 'Gandaki',
      country: 'Nepal',
      address: 'Lakeside Road, Ward No. 6',
      zipCode: '33700',
      geoCoordinates: { lat: 28.2096, lng: 83.9587 },
    },
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: ['Free WiFi', 'Swimming Pool', 'Spa & Wellness', 'Mountain View', 'Lakefront Bar', 'Free Breakfast', 'Airport Shuttle', 'Parking'],
    contact: {
      phone: '+977 61 465888',
      email: 'stay@fewaparadise.com',
      website: 'https://fewaparadise.com',
    },
    rating: { average: 4.8, count: 38 },
    status: 'active',
  },
  {
    name: 'Himalayan Horizon Heritage Hotel',
    description: 'Nestled on the hilltop of Nagarkot, offering breathtaking sunrise views of Mt. Everest and Himalayan snow peaks. Features cozy fireplaces, traditional architecture, and guided nature hikes.',
    location: {
      city: 'Nagarkot',
      state: 'Bagmati',
      country: 'Nepal',
      address: 'Sunrise View Point Height',
      zipCode: '44812',
      geoCoordinates: { lat: 27.7172, lng: 85.5204 },
    },
    images: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: ['Free WiFi', 'Mountain View', 'Fireplace Room', 'Restaurant', 'Free Breakfast', 'Hiking Tours', 'Parking'],
    contact: {
      phone: '+977 1 6680099',
      email: 'info@himalayanhorizon.com',
      website: 'https://himalayanhorizon.com',
    },
    rating: { average: 4.6, count: 24 },
    status: 'active',
  },
  {
    name: 'The Royal Durbar Grand Hotel',
    description: 'Experience 5-star royal elegance in the heart of Kathmandu near Thamel and Durbar Square. World-class luxury suites, rooftop infinity pool, 24-hour room service, and international cuisine.',
    location: {
      city: 'Kathmandu',
      state: 'Bagmati',
      country: 'Nepal',
      address: 'Durbar Marg, Ward No. 1',
      zipCode: '44600',
      geoCoordinates: { lat: 27.7149, lng: 85.3168 },
    },
    images: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: ['Free WiFi', 'Swimming Pool', 'Fitness Center', 'Spa & Wellness', 'Free Breakfast', '24/7 Room Service', 'Valet Parking', 'Cocktail Lounge'],
    contact: {
      phone: '+977 1 4220011',
      email: 'reservations@royaldurbar.com',
      website: 'https://royaldurbar.com',
    },
    rating: { average: 4.9, count: 52 },
    status: 'active',
  },
  {
    name: 'Chitwan Jungle Safari Lodge',
    description: 'An eco-friendly jungle sanctuary bordering Chitwan National Park. Offers elephant safaris, canoe rides along the Rapti river, Tharu cultural dance performances, and serene riverfront cottages.',
    location: {
      city: 'Chitwan',
      state: 'Bagmati',
      country: 'Nepal',
      address: 'Sauraha Village, Riverside',
      zipCode: '44204',
      geoCoordinates: { lat: 27.5796, lng: 84.4965 },
    },
    images: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1549294413-26f195200c16?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: ['Free WiFi', 'Jungle Safari', 'River View', 'Free Breakfast', 'Cultural Shows', 'Outdoor Dining', 'Airport Pickup'],
    contact: {
      phone: '+977 56 580123',
      email: 'booking@chitwansafari.com',
      website: 'https://chitwansafari.com',
    },
    rating: { average: 4.7, count: 19 },
    status: 'active',
  },
  {
    name: 'Patan Heritage Boutique Hotel',
    description: 'A beautifully restored traditional Newari brick townhouse in Patan Durbar Square. Features wood-carved windows, courtyards, authentic traditional architecture, and rooftop terrace dining.',
    location: {
      city: 'Lalitpur',
      state: 'Bagmati',
      country: 'Nepal',
      address: 'Mangal Bazaar, Patan',
      zipCode: '44700',
      geoCoordinates: { lat: 27.6744, lng: 85.3248 },
    },
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: ['Free WiFi', 'Rooftop Terrace', 'Free Breakfast', 'Cultural Tours', 'Air Conditioning', 'Airport Shuttle'],
    contact: {
      phone: '+977 1 5543210',
      email: 'stay@patanheritage.com',
      website: 'https://patanheritage.com',
    },
    rating: { average: 4.5, count: 15 },
    status: 'active',
  },
  {
    name: 'Bhaktapur Medieval Inn & Suites',
    description: 'Located inside the UNESCO World Heritage city of Bhaktapur. Quiet, historic ambiance, stone-paved courtyards, hand-woven textiles, and traditional pottery workshops.',
    location: {
      city: 'Bhaktapur',
      state: 'Bagmati',
      country: 'Nepal',
      address: 'Taumadhi Square',
      zipCode: '44800',
      geoCoordinates: { lat: 27.671, lng: 85.4298 },
    },
    images: [
      'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1563911302283-d2bc129e7570?auto=format&fit=crop&w=1200&q=80',
    ],
    amenities: ['Free WiFi', 'Free Breakfast', 'Courtyard Garden', 'Heritage Guided Walks', 'Laundry Service'],
    contact: {
      phone: '+977 1 6612345',
      email: 'contact@bhaktapurinn.com',
      website: 'https://bhaktapurinn.com',
    },
    rating: { average: 4.4, count: 12 },
    status: 'active',
  },
];

async function seedLocal() {
  const localUri = 'mongodb://127.0.0.1:27017/hotel_booking_db';
  console.log(`Connecting to Local MongoDB: ${localUri}...`);

  await mongoose.connect(localUri, { serverSelectionTimeoutMS: 5000 });
  console.log('✓ Connected to Local MongoDB!');

  await User.deleteMany();
  await Hotel.deleteMany();
  await Room.deleteMany();
  await Review.deleteMany();
  await Booking.deleteMany();
  await Payment.deleteMany();
  console.log('Cleared existing local DB collections...');

  const createdUsers = [];
  for (const u of sampleUsers) {
    const userObj = await User.create(u);
    createdUsers.push(userObj);
  }
  const manager = createdUsers.find((u) => u.role === 'hotel_manager');
  const customer = createdUsers.find((u) => u.role === 'customer');

  console.log('Created test users.');

  for (const hotelData of sampleHotels) {
    const hotel = await Hotel.create({
      ...hotelData,
      managerId: manager._id,
    });

    const roomsToCreate = [
      {
        hotelId: hotel._id,
        roomNumber: '101',
        roomType: 'Single',
        description: 'Comfortable single room with city views and queen bed.',
        pricePerNight: Math.floor(Math.random() * 30) + 40,
        capacity: { adults: 1, children: 0 },
        amenities: ['Free WiFi', 'Air Conditioning', 'Flat Screen TV'],
        images: [hotelData.images[0]],
        status: 'available',
      },
      {
        hotelId: hotel._id,
        roomNumber: '202',
        roomType: 'Deluxe',
        description: 'Spacious deluxe room with king bed, balcony, and mini-bar.',
        pricePerNight: Math.floor(Math.random() * 50) + 90,
        capacity: { adults: 2, children: 1 },
        amenities: ['Free WiFi', 'Air Conditioning', 'Private Balcony', 'Mini Bar'],
        images: [hotelData.images[1] || hotelData.images[0]],
        status: 'available',
      },
      {
        hotelId: hotel._id,
        roomNumber: '305',
        roomType: 'Suite',
        description: 'Executive suite with living lounge, jacuzzi tub, and breakfast.',
        pricePerNight: Math.floor(Math.random() * 80) + 180,
        capacity: { adults: 2, children: 2 },
        amenities: ['Free WiFi', 'Living Room', 'Jacuzzi', 'Espresso Machine'],
        images: [hotelData.images[2] || hotelData.images[0]],
        status: 'available',
      },
      {
        hotelId: hotel._id,
        roomNumber: '401',
        roomType: 'Family',
        description: 'Family suite featuring two bedrooms and kitchenette.',
        pricePerNight: Math.floor(Math.random() * 60) + 140,
        capacity: { adults: 4, children: 2 },
        amenities: ['Free WiFi', 'Kitchenette', 'Dining Table', 'Child Beds'],
        images: [hotelData.images[0]],
        status: 'available',
      },
    ];

    await Room.insertMany(roomsToCreate);
  }

  console.log('✓ Successfully seeded 6 luxury hotels and 24 rooms into Local MongoDB!');
  process.exit(0);
}

seedLocal().catch(err => {
  console.error(err);
  process.exit(1);
});
