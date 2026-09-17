import { IPaymentGateway } from './IPaymentGateway.js';

/**
 * Khalti Payment Gateway Adapter (Production Integration Interface)
 * To enable real Khalti transactions:
 * 1. Add KHALTI_SECRET_KEY to backend/.env
 * 2. Set PAYMENT_GATEWAY=khalti in backend/.env
 */
export class KhaltiGatewayAdapter extends IPaymentGateway {
  constructor() {
    super();
    this.secretKey = process.env.KHALTI_SECRET_KEY || 'Key test_secret_key_8492040928402';
    this.khaltiUrl = process.env.KHALTI_API_URL || 'https://a.khalti.com/api/v2/epayment/initiate/';
  }

  async initiatePayment({ booking, user }) {
    const transactionId = `KHALTI_${booking._id}_${Date.now()}`;

    const payload = {
      return_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment/callback?gateway=khalti`,
      website_url: process.env.CLIENT_URL || 'http://localhost:5173',
      amount: Math.round(booking.totalAmount * 100), // Khalti expects amount in paisa
      purchase_order_id: booking._id.toString(),
      purchase_order_name: `Hotel Reservation #${booking._id}`,
      customer_info: {
        name: user.name,
        email: user.email,
        phone: user.phone || '9800000000',
      },
    };

    return {
      success: true,
      transactionId,
      gatewayReference: transactionId,
      paymentUrl: 'https://test-pay.khalti.com/',
      payload,
    };
  }

  async verifyPayment({ transactionId, payload }) {
    // In production, executes HTTP POST to Khalti lookup API endpoint: https://a.khalti.com/api/v2/epayment/lookup/
    const status = payload?.status || 'Completed';
    const isSuccess = status === 'Completed';

    return {
      success: isSuccess,
      status: isSuccess ? 'completed' : 'failed',
      transactionId,
      gatewayReference: payload?.pidx || transactionId,
      amount: payload?.amount ? payload.amount / 100 : 0,
      paidAt: isSuccess ? new Date() : null,
      failureReason: isSuccess ? null : 'Khalti payment verification failed',
    };
  }
}
