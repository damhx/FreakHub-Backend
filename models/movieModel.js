import { connectDB, getDB } from '../config/db.js';
import { ObjectId } from 'mongodb';

// Función para crear una nueva película
export const createMovie = async (movieData) => {
  const db = await connectDB();
  const session = db.client.startSession();
  try {
    session.startTransaction();
    const result = await db.collection('peliculas').insertOne({
      title: movieData.title,
      description: movieData.description,
      category: movieData.category,
      year: movieData.year,
      image: movieData.image || '', // URL de imagen (opcional por ahora)
      status: 'pendiente', // Por defecto, requiere aprobación de admin
      rating: 0, // Inicialmente 0, se actualiza con reseñas
      reviews: [], // Array embebido para reseñas
      createdAt: new Date(),
      updatedAt: new Date()
    }, { session });
    await session.commitTransaction();
    return { ...movieData, _id: result.insertedId, status: 'pendiente', rating: 0, reviews: [] };
  } catch (error) {
    await session.abortTransaction();
    throw new Error('Error creando película: ' + error.message);
  } finally {
    session.endSession();
  }
};

// Función para obtener todas las películas (con filtro opcional)
export const getMovies = async (/* filter = { status: 'aceptada' } */) => {
  const db = await connectDB();
  return await db.collection('peliculas').find({status: 'aceptada'}).toArray(); //solo peliculas aceptadas
};

// Función para obtener una película por ID
export const getMovieById = async (id) => {
  const db = await connectDB();
  return await db.collection('peliculas').findOne({ _id: new ObjectId(id) });
};

// Función para actualizar una película
export const updateMovie = async (id, movieData) => {
  const db = await connectDB();
  const session = db.client.startSession();
  try {
    session.startTransaction();
    const updateData = {
      title: movieData.title,
      description: movieData.description,
      category: movieData.category,
      status: movieData.status,
      year: movieData.year,
      image: movieData.image,
      updatedAt: new Date()
    };
    const result = await db.collection('peliculas').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { session }
    );
    await session.commitTransaction();
    if (result.matchedCount === 0) throw new Error('Película no encontrada');
    return { ...updateData, _id: new ObjectId(id) };
  } catch (error) {
    await session.abortTransaction();
    throw new Error('Error actualizando película: ' + error.message);
  } finally {
    session.endSession();
  }
};

// Función para eliminar una película
export const deleteMovie = async (id) => {
  const db = await connectDB();
  const session = db.client.startSession();
  try {
    session.startTransaction();
    const result = await db.collection('peliculas').deleteOne({ _id: new ObjectId(id) }, { session });
    await session.commitTransaction();
    if (result.deletedCount === 0) throw new Error('Película no encontrada');
    return true;
  } catch (error) {
    await session.abortTransaction();
    throw new Error('Error eliminando película: ' + error.message);
  } finally {
    session.endSession();
  }
};

// Función para añadir una reseña a una película (con transacción)
export const addReview = async (movieId, reviewData, userId) => {
  const db = await connectDB();
  const session = db.client.startSession();
  try {
    session.startTransaction();
    const review = {
      userId: new ObjectId(userId),
      title: reviewData.title,
      comment: reviewData.comment,
      rating: reviewData.rating,
      likes: [],
      dislikes: [],
      createdAt: new Date()
    };
    const result = await db.collection('peliculas').updateOne(
      { _id: new ObjectId(movieId) },
      { $push: { reviews: review }, $set: { updatedAt: new Date() } },
      { session }
    );
    if (result.matchedCount === 0) throw new Error('Película no encontrada');

    // Calcular nuevo rating promedio
    const movie = await db.collection('peliculas').findOne({ _id: new ObjectId(movieId) }, { session });
    const ratings = movie.reviews.map(r => r.rating);
    const newRating = ratings.reduce((a, b) => a + b, 0) / ratings.length || 0;
    await db.collection('peliculas').updateOne(
      { _id: new ObjectId(movieId) },
      { $set: { rating: newRating } },
      { session }
    );
    await session.commitTransaction();
    return { ...review, movieId };
  } catch (error) {
    await session.abortTransaction();
    throw new Error('Error añadiendo reseña: ' + error.message);
  } finally {
    session.endSession();
  }
};



// Función para aprobar una película (cambiar status a 'aceptada')
export const approveMovie = async (id) => {
  const db = await connectDB();
  const session = db.client.startSession();
  try {
    session.startTransaction();
    const result = await db.collection('peliculas').updateOne(
      { _id: new ObjectId(id), status: 'pendiente' },
      { $set: { status: 'aceptada', updatedAt: new Date() } },
      { session }
    );
    await session.commitTransaction();
    if (result.matchedCount === 0) throw new Error('Película no encontrada o ya aprobada');
    return true;
  } catch (error) {
    await session.abortTransaction();
    throw new Error('Error aprobando película: ' + error.message);
  } finally {
    session.endSession();
  }
};