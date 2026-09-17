import { PaymentService } from '../services/payment/PaymentService.js';
import { MockGatewayAdapter } from '../services/payment/adapters/MockGatewayAdapter.js';

/**
 * Automated Test Suite for Payment Engine & Booking Synchronization
 */
async function runPaymentTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING AUTOMATED PAYMENT SUBSYSTEM TEST SUITE');
  console.log('====================================================\n');

  let passedCount = 0;
  let failedCount = 0;

  function assertTest(description, condition) {
    if (condition) {
      console.log(`  ✓ PASSED: ${description}`);
      passedCount++;
    } else {
      console.error(`  ❌ FAILED: ${description}`);
      failedCount++;
    }
  }

  // TEST 1: Mock Adapter Instantiation
  const adapter = PaymentService.getGatewayAdapter('mock');
  assertTest('PaymentService should return MockGatewayAdapter instance', adapter instanceof MockGatewayAdapter);

  // TEST 2: Mock Gateway Initiation
  const mockBooking = {
    _id: '65d10f823a23456789abcdef',
    totalAmount: 250,
  };
  const mockUser = {
    name: 'Test Customer',
    email: 'test@example.com',
  };

  const initiationResult = await adapter.initiatePayment({
    booking: mockBooking,
    user: mockUser,
    paymentMethod: 'card',
  });

  assertTest('Initiation result should return success=true', initiationResult.success === true);
  assertTest('Transaction ID should be generated with TXN_MOCK prefix', initiationResult.transactionId.startsWith('TXN_MOCK_'));
  assertTest('Payload amount should equal booking total amount ($250)', initiationResult.payload.amount === 250);

  // TEST 3: Mock Verification - Success Path
  const verificationSuccess = await adapter.verifyPayment({
    transactionId: initiationResult.transactionId,
    gatewayReference: initiationResult.gatewayReference,
    payload: { simulatedStatus: 'completed', amount: 250 },
  });

  assertTest('Successful verification must return status: completed', verificationSuccess.status === 'completed');
  assertTest('Successful verification must record paidAt timestamp', verificationSuccess.paidAt !== null);

  // TEST 4: Mock Verification - Failure Path
  const verificationFailure = await adapter.verifyPayment({
    transactionId: initiationResult.transactionId,
    gatewayReference: initiationResult.gatewayReference,
    payload: { simulatedStatus: 'failed', amount: 250, failureReason: 'Card Declined' },
  });

  assertTest('Failed verification must return status: failed', verificationFailure.status === 'failed');
  assertTest('Failed verification must record failureReason', verificationFailure.failureReason.includes('Declined'));

  // TEST 5: Mock Verification - Cancelled Path
  const verificationCancelled = await adapter.verifyPayment({
    transactionId: initiationResult.transactionId,
    gatewayReference: initiationResult.gatewayReference,
    payload: { simulatedStatus: 'cancelled', amount: 250 },
  });

  assertTest('Cancelled verification must return status: cancelled', verificationCancelled.status === 'cancelled');

  console.log('\n====================================================');
  console.log(`📊 TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('====================================================');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runPaymentTests();
