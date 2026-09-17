import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { connectDB } from '../config/db.js';

dotenv.config();

async function testAuthLogin() {
  console.log('--- TESTING DATABASE CONNECTIVITY & AUTHENTICATION ---');

  const connected = await connectDB();
  if (!connected || mongoose.connection.readyState !== 1) {
    console.error('❌ Connection Failed! readyState:', mongoose.connection.readyState);
    process.exit(1);
  }

  console.log('✓ Database Connection State:', mongoose.connection.readyState, '(Connected)');

  const testAccounts = ['customer@example.com', 'manager@example.com', 'admin@example.com'];

  for (const email of testAccounts) {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log(`⚠️ Account ${email} not found in DB.`);
      continue;
    }

    const isMatch = await user.matchPassword('password123');
    console.log(`✓ Account ${user.email} (${user.role}): Password Check -> ${isMatch ? 'PASSED' : 'FAILED'}`);
  }

  process.exit(0);
}

testAuthLogin().catch(err => {
  console.error('❌ Error during auth test:', err);
  process.exit(1);
});
