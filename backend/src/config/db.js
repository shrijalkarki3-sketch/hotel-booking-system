import mongoose from 'mongoose';

// Prevent OpenSSL 3.x TLS SSL Alert 80 drops on Windows Node.js for MongoDB Atlas shard hosts
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * Connect to MongoDB database using Mongoose with State Waiting & Connection Resilience
 */
export const connectDB = async () => {
  // 1. If already connected, return immediately
  if (mongoose.connection.readyState === 1) {
    return true;
  }

  // 2. If currently connecting, wait for state to transition to connected (1)
  if (mongoose.connection.readyState === 2) {
    let attempts = 0;
    while (mongoose.connection.readyState === 2 && attempts < 20) {
      await new Promise((resolve) => setTimeout(resolve, 250));
      attempts++;
    }
    if (mongoose.connection.readyState === 1) {
      return true;
    }
  }

  const primaryUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hotel_booking_db';
  const fallbackUri = 'mongodb://127.0.0.1:27017/hotel_booking_db';
  
  const primaryOptions = {
    serverSelectionTimeoutMS: 10000,
    maxPoolSize: 10,
    minPoolSize: 1,
    socketTimeoutMS: 45000,
  };

  try {
    const conn = await mongoose.connect(primaryUri, primaryOptions);
    console.log(`[MongoDB] Database connected successfully: ${conn.connection.host}`);
    return true;
  } catch (primaryError) {
    console.warn(`[MongoDB Warning] Primary connection failed (${primaryError.message}). Attempting local fallback...`);
    try {
      const conn = await mongoose.connect(fallbackUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`[MongoDB] Local fallback database connected successfully: ${conn.connection.host}`);
      return true;
    } catch (fallbackError) {
      console.error(`[MongoDB Error] Both primary and fallback DB connections failed: ${fallbackError.message}`);
      return false;
    }
  }
};
