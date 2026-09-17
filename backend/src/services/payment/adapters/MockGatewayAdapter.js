import { IPaymentGateway } from './IPaymentGateway.js';

/**
 * Development & Testing Mock Payment Gateway Adapter
 * Simulates gateway initiation and status verification without requiring external API credentials.
 */
export class MockGatewayAdapter extends IPaymentGateway {
  async initiatePayment({ booking, user, paymentMethod }) {
    const timestamp = Date.now();
    const transactionId = `TXN_MOCK_${timestamp}_${Math.floor(Math.random() * 1000)}`;
    const gatewayReference = `REF_MOCK_${booking._id.toString().substring(18)}`;

    return {
      success: true,
      transactionId,
      gatewayReference,
      paymentUrl: `/payment/checkout/${booking._id}?txn=${transactionId}`,
      payload: {
        amount: booking.totalAmount,
        currency: 'USD',
        customerName: user.name,
        customerEmail: user.email,
        paymentMethod: paymentMethod || 'card',
        gateway: 'mock',
      },
    };
  }

  async verifyPayment({ transactionId, gatewayReference, payload }) {
    // Allows status simulation from test parameters or default to completed
    const simulatedStatus = payload?.simulatedStatus || 'completed';

    if (simulatedStatus === 'failed') {
      return {
        success: false,
        status: 'failed',
        transactionId,
        gatewayReference,
        amount: payload?.amount || 0,
        paidAt: null,
        failureReason: payload?.failureReason || 'Simulated card decline or insufficient funds',
      };
    }

    if (simulatedStatus === 'cancelled') {
      return {
        success: false,
        status: 'cancelled',
        transactionId,
        gatewayReference,
        amount: payload?.amount || 0,
        paidAt: null,
        failureReason: 'Payment cancelled by user',
      };
    }

    return {
      success: true,
      status: 'completed',
      transactionId,
      gatewayReference,
      amount: payload?.amount || 0,
      paidAt: new Date(),
    };
  }
}
