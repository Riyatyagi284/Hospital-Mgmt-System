import { MongoClient, Db } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectMongoDB(uri: string, databaseName: string): Promise<void> {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db(databaseName);
    // eslint-disable-next-line no-console
    console.log('Connected to MongoDB');
  }
}

export async function getMongoDB(): Promise<Db> {
  if (!db) {
    throw new Error('MongoDB not connected. Call connectMongoDB first.');
  }
  return db;
}

export async function disconnectMongoDB(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}
