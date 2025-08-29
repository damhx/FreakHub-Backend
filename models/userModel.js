import { client } from '../config/db.js';
import { ObjectId } from 'mongodb';
import { connectDB } from '../config/db.js';

// agregue reviews en user para guardar el historial de las reviews
export const createUser = async (userData) => {
  const db = await connectDB();
  const usersCollection = db.collection('users');
  return await usersCollection.insertOne({
    ...userData,
    role: userData.role || 'usuario',
    reviews: [], 
    createdAt: new Date()
  });
};


export const findUserByEmail = async (email) => {
  const db = client.db('FreakHub');
  const usersCollection = db.collection('users');
  return await usersCollection.findOne({ email });
};

export const findUserById = async (userId) => {
  const db = client.db('FreakHub');
  const usersCollection = db.collection('users');
  return await usersCollection.findOne({ _id: new ObjectId(userId) });
};

export const updateUserPassword = async (userId, newPassword) => {
  const db = client.db('FreakHub');
  const usersCollection = db.collection('users');
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  return await usersCollection.updateOne(
    { _id: new ObjectId(userId) },
    { $set: { password: hashedPassword } }
  );
};

export const addReview = async (userId, review) => {
  const db = client.db('FreakHub');
  const usersCollection = db.collection('users');
  return await usersCollection.updateOne(
    { _id: new ObjectId(userId) },
    { $push: { reviews: review } }
  );
};

export const addRating = async (userId, rating) => {
  const db = client.db('FreakHub');
  const usersCollection = db.collection('users');
  return await usersCollection.updateOne(
    { _id: new ObjectId(userId) },
    { $push: { ratings: rating } }
  );
};