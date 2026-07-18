import { MongoClient, Db, Collection, Document } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectDB(): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('WARNING: MONGODB_URI is not set in environment variables. Database operations will fail.');
    throw new Error('Database URI is missing. Please set MONGODB_URI in your .env file.');
  }

  if (db) return db;

  try {
    client = new MongoClient(uri);
    await client.connect();
    console.log('Successfully connected to MongoDB.');

    // Extract the database name from the URI (the path after the host, before the '?')
    // e.g. mongodb+srv://user:pass@host/build-thenics?opt => "build-thenics"
    let dbName: string | undefined;
    try {
      const pathMatch = uri.match(/\.net\/([^?/]+)/);
      if (pathMatch && pathMatch[1]) {
        dbName = decodeURIComponent(pathMatch[1]);
      }
    } catch {
      // Fallback: let the driver pick the default
    }

    db = client.db(dbName);
    console.log(`Using database: "${db.databaseName}"`);
    return db;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

export function getDB(): Db {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB() first or check your MONGODB_URI.');
  }
  return db;
}

export function getCollection<T extends Document>(name: string): Collection<T> {
  return getDB().collection<T>(name);
}

export async function closeDB(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('MongoDB connection closed.');
  }
}
