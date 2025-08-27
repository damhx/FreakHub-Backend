import { client } from '../config/db.js';

export const createUser = async (userData) => {
  const db = client.db('FreakHub');
  const usersCollection = db.collection('users');
  return await usersCollection.insertOne(userData);
};

export const findUserByEmail = async (email) => {
  const db = client.db('FreakHub');
  const usersCollection = db.collection('users');
  return await usersCollection.findOne({ email });
};