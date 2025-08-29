import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export const connectDB = async () => {
  try {
    await client.connect();
    return client.db('FreakHub'); // Usamos 'FreakHub' como base, como tu compañero
  } catch (error) {
    console.error('Error conectando a MongoDB:', error);
    throw error;
  }
};

export const getDB = () => client.db('FreakHub'); // Para acceder a la DB directamente
export { client }; // Exportamos client para compatibilidad con userModel.js