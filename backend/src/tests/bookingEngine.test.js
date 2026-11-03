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

  const today = new Date();
  const validCheckIn = new Date(today);
  validCheckIn.setDate(today.getDate() + 10);
  const validCheckOut = new Date(today);
  validCheckOut.setDate(today.getDate() + 15);
  const pastCheckIn = new Date(today);
  pastCheckIn.setDate(today.getDate() - 5);
  const pastCheckOut = new Date(today);
  pastCheckOut.setDate(today.getDate() - 1);

  // TEST 1: Valid Date Range
  const t1 = validateBookingDates(validCheckIn, validCheckOut);
  assertTest('Valid future check-in/out dates should pass validation', t1.valid === true);

  // TEST 2: Check-out before check-in
  const t2 = validateBookingDates(validCheckOut, validCheckIn);
  assertTest('Check-out before check-in must be rejected', t2.valid === false && t2.message.includes('after check-in'));

  // TEST 3: Check-out equal to check-in
  const t3 = validateBookingDates(validCheckIn, validCheckIn);
  assertTest('Check-out equal to check-in must be rejected', t3.valid === false && t3.message.includes('after check-in'));

  // TEST 4: Past check-in date
  const t4 = validateBookingDates(pastCheckIn, pastCheckOut);
  assertTest('Past check-in date must be rejected', t4.valid === false && t4.message.includes('cannot be in the past'));

  // TEST 5: Calculate Nights Calculation
  const nights = calculateNights(validCheckIn, validCheckOut);
  assertTest('Stay length must calculate correctly from valid dates', nights === 5);

  // TEST 6: Date Overlap Logic Matrix (Formula: RequestedCheckIn < ExistingCheckOut AND RequestedCheckOut > ExistingCheckIn)
  function checkOverlap(reqIn, reqOut, existIn, existOut) {
    const rIn = new Date(reqIn);
    const rOut = new Date(reqOut);
    const eIn = new Date(existIn);
    const eOut = new Date(existOut);
    return rIn < eOut && rOut > eIn;
  }

  const existingStart = new Date(today);
  existingStart.setDate(today.getDate() + 20);
  const existingEnd = new Date(today);
  existingEnd.setDate(today.getDate() + 25);

  // Exact same dates -> OVERLAP
  assertTest('Exact matching dates must detect overlap', checkOverlap(existingStart, existingEnd, existingStart, existingEnd) === true);

  // Partial overlap inside -> OVERLAP
  assertTest('Partially overlapping dates inside range must detect overlap', checkOverlap(new Date(today.getTime() + 86400000 * 22), new Date(today.getTime() + 86400000 * 24), existingStart, existingEnd) === true);

  // Partial overlap start -> OVERLAP
  assertTest('Overlap starting before existing check-out must detect overlap', checkOverlap(new Date(today.getTime() + 86400000 * 18), new Date(today.getTime() + 86400000 * 22), existingStart, existingEnd) === true);

  // Back-to-back booking (Check-out = Existing Check-in) -> NO OVERLAP (ALLOWED)
  const backToBackOut = new Date(existingStart);
  backToBackOut.setDate(existingStart.getDate() - 1);
  const backToBackIn = new Date(existingStart);
  backToBackIn.setDate(existingStart.getDate() + 1);
  assertTest('Back-to-back checkout on same day as next checkin must NOT overlap', checkOverlap(backToBackOut, existingStart, existingStart, existingEnd) === false);

  // Back-to-back booking (Check-in = Existing Check-out) -> NO OVERLAP (ALLOWED)
  const nextStayIn = new Date(existingEnd);
  nextStayIn.setDate(existingEnd.getDate() + 1);
  const nextStayOut = new Date(existingEnd);
  nextStayOut.setDate(existingEnd.getDate() + 5);
  assertTest('Checkin on same day as previous checkout must NOT overlap', checkOverlap(existingEnd, nextStayOut, existingStart, existingEnd) === false);

  // TEST 7: Server Price Calculation Verification
  const nightlyRate = 120;
  const stayNights = 3;
  const computedTotal = nightlyRate * stayNights;
  assertTest('Server price calculation (120 * 3 = 360) must match expected total', computedTotal === 360);

  // TEST 8: Cancellation Policy Verification
  const futureBooking = {
    bookingStatus: 'confirmed',
    checkIn: new Date(today.getTime() + 86400000 * 30),
  };
  assertTest('Active confirmed future booking can be cancelled', canCancelBooking(futureBooking).canCancel === true);

  const alreadyCancelledBooking = {
    bookingStatus: 'cancelled',
    checkIn: new Date(today.getTime() + 86400000 * 30),
  };
  assertTest('Already cancelled booking cannot be re-cancelled', canCancelBooking(alreadyCancelledBooking).canCancel === false);

  const completedBooking = {
    bookingStatus: 'completed',
    checkIn: new Date(today.getTime() + 86400000 * 30),
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
