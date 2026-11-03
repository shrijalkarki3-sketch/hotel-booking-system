import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: [true, 'Room must belong to a hotel'],
    },
    roomNumber: {
      type: String,
      required: [true, 'Please provide room number'],
      trim: true,
    },
    roomType: {
      type: String,
      required: [true, 'Please specify room type'],
      enum: ['Single', 'Double', 'Suite', 'Deluxe', 'Family', 'Presidential'],
    },
    description: {
      type: String,
      default: '',
    },
    pricePerNight: {
      type: Number,
      required: [true, 'Please provide price per night'],
      min: [0, 'Price per night cannot be negative'],
    },
    capacity: {
      adults: { type: Number, required: true, min: 1, default: 2 },
      children: { type: Number, default: 0, min: 0 },
    },
    amenities: [{ type: String }],
    images: [{ type: String }],
    status: {
      type: String,
      enum: ['available', 'maintenance', 'occupied'],
      default: 'available',
    },
  },
  {
    timestamps: true,
  }
);

// Query patterns for hotel detail pages and filtering
roomSchema.index({ hotelId: 1, status: 1 });
roomSchema.index({ hotelId: 1, status: 1, pricePerNight: 1 });
roomSchema.index({ status: 1, roomType: 1, 'capacity.adults': 1 });

const Room = mongoose.model('Room', roomSchema);
export default Room;
