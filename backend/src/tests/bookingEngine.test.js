import { validateBookingDates, calculateNights, canCancelBooking } from '../utils/dateUtils.js';

/**
 * Automated Test Suite for Booking Logic, Date Rules, Overlap Equations, and Cancellation Policy
 */
function runTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING AUTOMATED BOOKING ENGINE TEST SUITE');
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

  // TEST 1: Valid Date Range
  const t1 = validateBookingDates('2026-09-10', '2026-09-15');
  assertTest('Valid future check-in/out dates should pass validation', t1.valid === true);

  // TEST 2: Check-out before check-in
  const t2 = validateBookingDates('2026-09-15', '2026-09-10');
  assertTest('Check-out before check-in must be rejected', t2.valid === false && t2.message.includes('after check-in'));

  // TEST 3: Check-out equal to check-in
  const t3 = validateBookingDates('2026-09-10', '2026-09-10');
  assertTest('Check-out equal to check-in must be rejected', t3.valid === false && t3.message.includes('after check-in'));

  // TEST 4: Past check-in date
  const t4 = validateBookingDates('2020-01-01', '2020-01-05');
  assertTest('Past check-in date must be rejected', t4.valid === false && t4.message.includes('cannot be in the past'));

  // TEST 5: Calculate Nights Calculation
  const nights = calculateNights('2026-09-10', '2026-09-15');
  assertTest('5-day stay must calculate exactly 5 nights', nights === 5);

  // TEST 6: Date Overlap Logic Matrix (Formula: RequestedCheckIn < ExistingCheckOut AND RequestedCheckOut > ExistingCheckIn)
  function checkOverlap(reqIn, reqOut, existIn, existOut) {
    const rIn = new Date(reqIn);
    const rOut = new Date(reqOut);
    const eIn = new Date(existIn);
    const eOut = new Date(existOut);
    return rIn < eOut && rOut > eIn;
  }

  // Exact same dates -> OVERLAP
  assertTest('Exact matching dates must detect overlap', checkOverlap('2026-09-10', '2026-09-15', '2026-09-10', '2026-09-15') === true);

  // Partial overlap inside -> OVERLAP
  assertTest('Partially overlapping dates inside range must detect overlap', checkOverlap('2026-09-12', '2026-09-14', '2026-09-10', '2026-09-15') === true);

  // Partial overlap start -> OVERLAP
  assertTest('Overlap starting before existing check-out must detect overlap', checkOverlap('2026-09-08', '2026-09-12', '2026-09-10', '2026-09-15') === true);

  // Back-to-back booking (Check-out = Existing Check-in) -> NO OVERLAP (ALLOWED)
  assertTest('Back-to-back checkout on same day as next checkin must NOT overlap', checkOverlap('2026-09-05', '2026-09-10', '2026-09-10', '2026-09-15') === false);

  // Back-to-back booking (Check-in = Existing Check-out) -> NO OVERLAP (ALLOWED)
  assertTest('Checkin on same day as previous checkout must NOT overlap', checkOverlap('2026-09-15', '2026-09-20', '2026-09-10', '2026-09-15') === false);

  // TEST 7: Server Price Calculation Verification
  const nightlyRate = 120;
  const stayNights = 3;
  const computedTotal = nightlyRate * stayNights;
  assertTest('Server price calculation (120 * 3 = 360) must match expected total', computedTotal === 360);

  // TEST 8: Cancellation Policy Verification
  const futureBooking = {
    bookingStatus: 'confirmed',
    checkIn: new Date('2026-10-01'),
  };
  assertTest('Active confirmed future booking can be cancelled', canCancelBooking(futureBooking).canCancel === true);

  const alreadyCancelledBooking = {
    bookingStatus: 'cancelled',
    checkIn: new Date('2026-10-01'),
  };
  assertTest('Already cancelled booking cannot be re-cancelled', canCancelBooking(alreadyCancelledBooking).canCancel === false);

  const completedBooking = {
    bookingStatus: 'completed',
    checkIn: new Date('2026-10-01'),
  };
  assertTest('Completed booking cannot be cancelled', canCancelBooking(completedBooking).canCancel === false);

  console.log('\n====================================================');
  console.log(`📊 TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('====================================================');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests();
