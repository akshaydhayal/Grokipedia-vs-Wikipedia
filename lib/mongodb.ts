// MongoDB connection utility

import mongoose from 'mongoose';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  // Get MongoDB URI at runtime (not at module load time)
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }

  // Validate that it starts with mongodb:// or mongodb+srv://
  if (!MONGODB_URI.startsWith('mongodb://') && !MONGODB_URI.startsWith('mongodb+srv://')) {
    throw new Error(`Invalid MongoDB URI. Expected to start with "mongodb://" or "mongodb+srv://". Got: "${MONGODB_URI.substring(0, 20)}..."`);
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    // Construct proper connection string with database name
    let connectionString = MONGODB_URI.trim();
    
    // Remove trailing slash if present
    if (connectionString.endsWith('/')) {
      connectionString = connectionString.slice(0, -1);
    }
    
    // Check if database name is already in the connection string
    const urlParts = connectionString.split('/');
    const hasDatabase = urlParts.length > 3 && urlParts[urlParts.length - 1] && !urlParts[urlParts.length - 1].includes('?');
    
    // Append database name if not present
    if (!hasDatabase) {
      connectionString = connectionString + '/WikiVsGrokipediaKA';
    }

    console.log('Connecting to MongoDB:', connectionString.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Log with masked credentials

    cached.promise = mongoose.connect(connectionString, opts).then((mongoose) => {
      console.log('MongoDB connected successfully');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;

