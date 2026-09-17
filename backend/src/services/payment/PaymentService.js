import Payment from '../../models/Payment.js';
import Booking from '../../models/Booking.js';
import { MockGatewayAdapter } from './adapters/MockGatewayAdapter.js';
import { EsewaGatewayAdapter } from './adapters/EsewaGatewayAdapter.js';
import { KhaltiGatewayAdapter } from './adapters/KhaltiGatewayAdapter.js';
import { createNotification } from '../../utils/notificationHelper.js';

export class PaymentService {
  /**
   * Gateway Adapter Factory
   * Instantiates appropriate adapter based on requested gateway name or environment variable
   */
  static getGatewayAdapter(gatewayName) {
    const activeGateway = (gatewayName || process.env.PAYMENT_GATEWAY || 'mock').toLowerCase();

    switch (activeGateway) {
      case 'esewa':
        return new EsewaGatewayAdapter();
      case 'khalti':
        return new KhaltiGatewayAdapter();
      case 'mock':
      default:
        return new MockGatewayAdapter();
    }
  }

  /**
   * Initiate a payment transaction for a booking
   */
  static async initiatePayment({ bookingId, user, paymentMethod, gatewayName }) {
    // 1. Retrieve Booking Record
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new Error('Booking record not found');
    }

    // 2. Duplicate Payment Check #1: Verify Booking is not already paid
    if (booking.paymentStatus === 'paid') {
      throw new Error('Duplicate Payment Warning: This booking has already been paid in full');
    }

    if (booking.bookingStatus === 'cancelled') {
      throw new Error('Cannot process payment for a cancelled booking');
    }

    // 3. Duplicate Payment Check #2: Verify no completed Payment transaction exists
    const existingCompleted = await Payment.findOne({ bookingId, paymentStatus: 'completed' });
    if (existingCompleted) {
      throw new Error('A completed payment record already exists for this booking');
    }

    // 4. Select Gateway Adapter & Execute Initiation
    const adapter = this.getGatewayAdapter(gatewayName);
    const result = await adapter.initiatePayment({ booking, user, paymentMethod });

    // 5. Create or Update Payment Record in DB
    let payment = await Payment.findOne({ bookingId, paymentStatus: { $in: ['pending', 'initiated'] } });
    if (!payment) {
      payment = new Payment({
        bookingId,
        userId: user._id,
        amount: booking.totalAmount,
        currency: 'USD',
        paymentMethod: paymentMethod || 'card',
        gateway: gatewayName || process.env.PAYMENT_GATEWAY || 'mock',
        transactionId: result.transactionId,
        gatewayReference: result.gatewayReference,
        paymentStatus: 'initiated',
      });
    } else {
      payment.transactionId = result.transactionId;
      payment.gatewayReference = result.gatewayReference;
      payment.paymentMethod = paymentMethod || payment.paymentMethod;
      payment.paymentStatus = 'initiated';
    }

    await payment.save();

    return {
      payment,
      checkoutUrl: result.paymentUrl,
      payload: result.payload,
    };
  }

  /**
   * Verify transaction status with provider & Synchronize Booking Payment Status
   */
  static async verifyPayment({ transactionId, gatewayReference, payload, gatewayName }) {
    // 1. Find Payment Record
    const payment = await Payment.findOne({
      $or: [{ transactionId }, { gatewayReference }],
    });

    if (!payment) {
      throw new Error(`Payment record not found for transaction ID: ${transactionId}`);
    }

    // 2. Prevent re-processing already completed transactions (Idempotency)
    if (payment.paymentStatus === 'completed') {
      const booking = await Booking.findById(payment.bookingId);
      return {
        payment,
        booking,
        message: 'Payment was already verified and completed previously.',
      };
    }

    // 3. Select Gateway Adapter & Execute Verification
    const adapter = this.getGatewayAdapter(gatewayName || payment.gateway);
    const verification = await adapter.verifyPayment({ transactionId, gatewayReference, payload });

    // 4. Update Payment Record Status
    payment.paymentStatus = verification.status;
    if (verification.status === 'completed') {
      payment.paidAt = verification.paidAt || new Date();
      payment.failureReason = '';
    } else {
      payment.failureReason = verification.failureReason || 'Payment process uncompleted';
    }

    await payment.save();

    // 5. Booking-Payment Synchronization & Notification Dispatch
    const booking = await Booking.findById(payment.bookingId);
    if (booking) {
      if (verification.status === 'completed') {
        booking.paymentStatus = 'paid';
        if (booking.bookingStatus === 'pending') {
          booking.bookingStatus = 'confirmed';
        }
        await booking.save();

        // Dispatch Payment Completed Notification
        await createNotification({
          userId: payment.userId,
          type: 'payment_completed',
          title: 'Payment Completed',
          message: `Payment of $${payment.amount} for your reservation was successfully verified.`,
          relatedEntityId: payment._id,
          relatedEntityType: 'Payment',
        });
      } else if (verification.status === 'failed' || verification.status === 'cancelled') {
        booking.paymentStatus = 'unpaid';
        await booking.save();

        await createNotification({
          userId: payment.userId,
          type: 'payment_failed',
          title: 'Payment Unsuccessful',
          message: `Payment transaction ${payment.transactionId} failed or was cancelled.`,
          relatedEntityId: payment._id,
          relatedEntityType: 'Payment',
        });
      }
    }

    return {
      payment,
      booking,
      verification,
    };
  }
}
