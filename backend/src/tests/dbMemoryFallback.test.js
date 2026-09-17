import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';

(async () => {
  process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/hotel_booking_db';
  const connected = await connectDB();

  assert.equal(connected, true);
  assert.equal(mongoose.connection.readyState, 1);

  await mongoose.disconnect();
  console.log('[dbFallbackTest] PASS');
})().catch((error) => {
  console.error('[dbFallbackTest] FAIL', error);
  process.exit(1);
});
