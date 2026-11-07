import mongoose from 'mongoose';

let connectionPromise;

/**
 * Connect to MongoDB, sharing an in-flight connection attempt between callers.
 */
export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return true;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const mongoUri = process.env.MONGO_URI || (
    isProduction ? '' : 'mongodb://127.0.0.1:27017/hotel_booking_db'
  );

  if (!mongoUri) {
    throw new Error('MONGO_URI must be configured in production');
  }

  const options = {
    serverSelectionTimeoutMS: 10000,
    maxPoolSize: 10,
    minPoolSize: 1,
    socketTimeoutMS: 45000,
  };

  connectionPromise = mongoose.connect(mongoUri, options)
    .then((conn) => {
      console.log(`[MongoDB] Database connected successfully: ${conn.connection.host}`);
      return true;
    })
    .catch((error) => {
      console.error(`[MongoDB Error] Connection failed (${error.name}). Check MONGO_URI, network access, and TLS configuration.`);
      return false;
    })
    .finally(() => {
      connectionPromise = null;
    });

  return connectionPromise;
};
