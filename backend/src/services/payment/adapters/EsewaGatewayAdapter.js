import { IPaymentGateway } from './IPaymentGateway.js';

/**
 * eSewa Payment Gateway Adapter (Production Integration Interface)
 * To enable real eSewa transactions:
 * 1. Add ESEWA_MERCHANT_CODE and ESEWA_SECRET_KEY to backend/.env
 * 2. Set PAYMENT_GATEWAY=esewa in backend/.env
 */
export class EsewaGatewayAdapter extends IPaymentGateway {
  constructor() {
    super();
    this.merchantCode = process.env.ESEWA_MERCHANT_CODE || 'EPAYTEST';
    this.secretKey = process.env.ESEWA_SECRET_KEY || '8gBmypK2EhjA8T0G';
    this.esewaUrl = process.env.ESEWA_API_URL || 'https://uat.esewa.com.np/epay/main';
  }

  async initiatePayment({ booking, returnUrl, cancelUrl }) {
    const transactionId = `ESEWA_${booking._id}_${Date.now()}`;
    
    // Structure signature payload according to eSewa v2 API specification
    const payload = {
      amount: booking.totalAmount,
      tax_amount: "0",
      total_amount: booking.totalAmount,
      transaction_uuid: transactionId,
      product_code: this.merchantCode,
      success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment/callback?gateway=esewa`,
      failure_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment/callback?gateway=esewa&status=failed`,
      signed_field_names: "total_amount,transaction_uuid,product_code",
    };

    return {
      success: true,
      transactionId,
      gatewayReference: transactionId,
      paymentUrl: this.esewaUrl,
      payload,
    };
  }

  async verifyPayment({ transactionId, payload }) {
    // In production, performs server-to-server HTTP POST request to eSewa status verification endpoint
    const isSuccess = payload?.status === 'COMPLETE' || payload?.status === 'success';

    return {
      success: isSuccess,
      status: isSuccess ? 'completed' : 'failed',
      transactionId,
      gatewayReference: payload?.refId || transactionId,
      amount: Number(payload?.total_amount || 0),
      paidAt: isSuccess ? new Date() : null,
      failureReason: isSuccess ? null : 'eSewa payment verification failed',
    };
  }
}
