import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export const connectDB = async () => {
  try {
    await client.connect();
    return client.db(); // Devuelve la base de datos (usa 'geek_rating' como nombre por defecto)
  } catch (error) {
    console.error('Error conectando a MongoDB:', error);
    throw error; // Propaga el error para manejarlo en index.js
  }
};

export const getDB = () => client.db(); // Para usar en otros archivos si necesario