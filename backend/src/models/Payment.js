import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Payment must link to a booking'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Payment must link to a user'],
    },
    amount: {
      type: Number,
      required: [true, 'Please state payment amount'],
      min: [0, 'Amount cannot be negative'],
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'khalti', 'esewa', 'bank_transfer', 'cash_at_hotel'],
      required: [true, 'Please specify payment method'],
    },
    gateway: {
      type: String,
      default: 'mock',
    },
    currency: {
      type: String,
      default: 'USD',
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    gatewayReference: {
      type: String,
      default: '',
    },
    paymentStatus: {
      type: String,
      enum: ['initiated', 'pending', 'completed', 'failed', 'refunded', 'cancelled'],
      default: 'initiated',
    },
    failureReason: {
      type: String,
      default: '',
    },
    paidAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
