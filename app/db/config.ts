// src/db/config.ts
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable in .env.local'
  );
}

let cached: { conn?: typeof mongoose, promise?: Promise<typeof mongoose> } = (global as any).mongooseCache || {};

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).then(mongoose => mongoose);
  }
  cached.conn = await cached.promise;
  (global as any).mongooseCache = cached;
  return cached.conn;
}

export default connectDB;
