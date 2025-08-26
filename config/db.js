import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI;
export const client = new MongoClient(uri);

export const connectDB = async () => {
  try {
    await client.connect();
    console.log('Conectado a MongoDB');
    return client.db('FreakHub');
  } catch (error) {
    console.error('Error conectando a MongoDB:', error);
    process.exit(1);
  }
};