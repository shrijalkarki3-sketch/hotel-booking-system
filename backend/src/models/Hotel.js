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

// Text index for direct keyword search
hotelSchema.index({ name: 'text', 'location.city': 'text', 'location.address': 'text' });

// Query patterns used by homepage and search results
hotelSchema.index({ status: 1, 'location.city': 1 });
hotelSchema.index({ status: 1, 'rating.average': -1 });
hotelSchema.index({ managerId: 1, status: 1 });

const Hotel = mongoose.model('Hotel', hotelSchema);
export default Hotel;
