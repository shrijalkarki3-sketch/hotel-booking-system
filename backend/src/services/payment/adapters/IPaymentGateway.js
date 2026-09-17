/**
 * Payment Gateway Adapter Interface Standard
 * Defines the contract that all specific gateway adapters (Mock, eSewa, Khalti, Stripe) must implement.
 */
export class IPaymentGateway {
  /**
   * Initiate a payment transaction with the provider
   * @param {Object} params - { booking, user, paymentMethod, returnUrl, cancelUrl }
   * @returns {Promise<{ success: boolean, transactionId: string, gatewayReference: string, paymentUrl: string, payload: Object }>}
   */
  async initiatePayment(params) {
    throw new Error('initiatePayment() must be implemented by gateway adapter');
  }

  /**
   * Verify transaction status with provider API or callback payload
   * @param {Object} params - { transactionId, gatewayReference, payload }
   * @returns {Promise<{ success: boolean, status: 'completed'|'failed'|'cancelled', transactionId: string, amount: number, paidAt: Date, failureReason?: string }>}
   */
  async verifyPayment(params) {
    throw new Error('verifyPayment() must be implemented by gateway adapter');
  }
}
