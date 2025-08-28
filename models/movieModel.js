import { client } from '../config/db.js';
import { ObjectId } from 'mongodb';

export const proposeMovie = async (movieData) => {
  const db = client.db('FreakHub');
  const moviesCollection = db.collection('movies');
  const { title, desc, categoryId, year, image } = movieData;

  const existingMovie = await moviesCollection.findOne({ title });
  if (existingMovie) {
    throw new Error('El título ya está registrado');
  }

  const movie = {
    title,
    desc,
    categoryId,
    year,
    image,
    status: 'pendiente',
    createdAt: new Date(),
  };

  return await moviesCollection.insertOne(movie);
};

export const approveMovie = async (movieId) => {
  const db = client.db('FreakHub');
  const moviesCollection = db.collection('movies');
  return await moviesCollection.updateOne(
    { _id: new ObjectId(movieId) },
    { $set: { status: 'aprobado' } }
  );
};

export const rejectMovie = async (movieId) => {
  const db = client.db('FreakHub');
  const moviesCollection = db.collection('movies');
  return await moviesCollection.updateOne(
    { _id: new ObjectId(movieId) },
    { $set: { status: 'rechazado' } }
  );
};

export const findMovieById = async (movieId) => {
  const db = client.db('FreakHub');
  const moviesCollection = db.collection('movies');
  return await moviesCollection.findOne({ _id: new ObjectId(movieId) });
};