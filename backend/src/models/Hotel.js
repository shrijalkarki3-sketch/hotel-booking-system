import mongoose from 'mongoose';

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide hotel name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide hotel description'],
    },
    location: {
      city: { type: String, required: true, trim: true },
      state: { type: String, trim: true, default: '' },
      country: { type: String, required: true, trim: true, default: 'Nepal' },
      address: { type: String, required: true, trim: true },
      zipCode: { type: String, trim: true, default: '' },
      geoCoordinates: {
        lat: { type: Number, default: 0 },
        lng: { type: Number, default: 0 },
      },
    },
    images: [{ type: String }],
    amenities: [{ type: String }],
    contact: {
      phone: { type: String, required: true },
      email: { type: String, required: true },
      website: { type: String, default: '' },
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Hotel must belong to a manager'],
    },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending_approval'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Text Index for Search
hotelSchema.index({ name: 'text', 'location.city': 'text', 'location.address': 'text' });

const Hotel = mongoose.model('Hotel', hotelSchema);
export default Hotel;
