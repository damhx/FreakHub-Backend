import { selectFields } from 'express-validator/lib/field-selection.js';
import { connectDB } from '../config/db.js';
import { ObjectId } from 'mongodb';
import fs from 'fs/promises'

// Función para crear una nueva review
export const createReview = async (reviewData) => {
  const db = await connectDB();
  const movieExists = await db.collection('peliculas').findOne({ _id: new ObjectId(reviewData.movieId) });
  const userExists = await db.collection('users').findOne({ _id: new ObjectId(reviewData.userId) });
  if (!movieExists) throw new Error('Película no encontrada');
  if (!userExists) throw new Error('Usuario no encontrado');
  const session = db.client.startSession();
  try {
    console.log('Iniciando transacción para review:', reviewData);
    session.startTransaction();

    // Construir el objeto review sin _id (se genera al insertar)
    const review = {
      movieId: new ObjectId(reviewData.movieId),
      userId: new ObjectId(reviewData.userId),
      title: reviewData.title,
      comment: reviewData.comment,
      rating: parseInt(reviewData.rating), // Asegurar que sea número
      likes: 0,
      dislikes: 0,
      likeUsers: [],
      dislikeUsers: [],
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    console.log('Review a insertar:', review);

    // Insertar la review y obtener el _id generado (dentro de la transacción)
    const result = await db.collection('reviews').insertOne(review, { session });
    console.log('Review insertada con ID:', result.insertedId);

    // Integración: Añadir referencia a usuario (historial)
    await db.collection('users').updateOne(
      { _id: new ObjectId(reviewData.userId) },
      { $push: { reviews: result.insertedId } },
      { session }
    );
    console.log('Referencia añadida a usuario con ID:', reviewData.userId);

    // Integración: Añadir referencia a película y actualizar rating
    await db.collection('peliculas').updateOne(
      { _id: new ObjectId(reviewData.movieId) },
      {
        $push: { reviews: result.insertedId },
        $set: { updatedAt: new Date() } // Opcional, para registrar última actualización
      },
      { session }
    );
    console.log('Referencia añadida a película con ID:', reviewData.movieId);

    // Calcular y actualizar el rating global de la película
    const reviews = await db.collection('reviews').find({ movieId: new ObjectId(reviewData.movieId) }).toArray();
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0;
    await db.collection('peliculas').updateOne(
      { _id: new ObjectId(reviewData.movieId) },
      { $set: { rating: avgRating } },
      { session }
    );
    console.log('Rating actualizado a:', avgRating);

    await session.commitTransaction();
    console.log('Transacción commit exitosa');
    return { ...review, _id: result.insertedId };
  } catch (error) {
    console.error('Error en transacción:', error);
    await session.abortTransaction();
    throw new Error('Error creando review: ' + error.message);
  } finally {
    session.endSession();
  }
};
// Función para obtener reviews por movieId
export const getReviewsByMovie = async (movieId) => {
  const db = await connectDB();
  return await db.collection('reviews').find({ movieId: new ObjectId(movieId) }).toArray();
};

// Función para like/dislike una review
export const likeReview = async (reviewId, userId, isLike = true) => {
  const db = await connectDB();
  const session = db.client.startSession();
  try {
    session.startTransaction();
    const review = await db.collection('reviews').findOne({ _id: new ObjectId(reviewId) });
    if (!review) throw new Error('Review no encontrada');

    // Chequear si usuario ya votó
    if (isLike) {
      if (review.likeUsers.includes(userId)) throw new Error('Ya diste like');
      await db.collection('reviews').updateOne(
        { _id: new ObjectId(reviewId) },
        { $inc: { likes: 1 }, $push: { likeUsers: userId } },
        { session }
      );
    } else {
      if (review.dislikeUsers.includes(userId)) throw new Error('Ya diste dislike');
      await db.collection('reviews').updateOne(
        { _id: new ObjectId(reviewId) },
        { $inc: { dislikes: 1 }, $push: { dislikeUsers: userId } },
        { session }
      );
    }
    await session.commitTransaction();
    return true;
  } catch (error) {
    await session.abortTransaction();
    throw new Error('Error en like/dislike: ' + error.message);
  } finally {
    session.endSession();
  }
};

// Función para añadir un comentario a una review
export const addComment = async (reviewId, commentData, userId) => {
  const db = await connectDB();
  const session = db.client.startSession();
  try {
    session.startTransaction();
    const comment = {
      userId: new ObjectId(userId),
      text: commentData.text,
      createdAt: new Date()
    };
    const result = await db.collection('reviews').updateOne(
      { _id: new ObjectId(reviewId) },
      { $push: { comments: comment }, $set: { updatedAt: new Date() } },
      { session }
    );
    await session.commitTransaction();
    if (result.matchedCount === 0) throw new Error('Review no encontrada');
    return comment;
  } catch (error) {
    await session.abortTransaction();
    throw new Error('Error añadiendo comentario: ' + error.message);
  } finally {
    session.endSession();
  }
};

// Función para actualizar una review (admin only)
export const updateReview = async (id, reviewData) => {
  const db = await connectDB();
  const session = db.client.startSession();
  try {
    session.startTransaction();
    const result = await db.collection('reviews').updateOne(
      { _id: new ObjectId(id) },
      { $set: { title: reviewData.title, comment: reviewData.comment, rating: reviewData.rating, updatedAt: new Date() } },
      { session }
    );
    await session.commitTransaction();
    if (result.matchedCount === 0) throw new Error('Review no encontrada');
    return true;
  } catch (error) {
    await session.abortTransaction();
    throw new Error('Error actualizando review: ' + error.message);
  } finally {
    session.endSession();
  }
};

// Función para eliminar una review (admin only)
export const deleteReview = async (id) => {
  const db = await connectDB();
  const session = db.client.startSession();
  try {
    session.startTransaction();
    const review = await db.collection('reviews').findOne({ _id: new ObjectId(id) });
    if (!review) throw new Error('Review no encontrada');

    // Eliminar referencia de usuario
    await db.collection('users').updateOne(
      { _id: review.userId },
      { $pull: { reviews: new ObjectId(id) } },
      { session }
    );

    // Eliminar referencia de película
    await db.collection('peliculas').updateOne(
      { _id: review.movieId },
      { $pull: { reviews: new ObjectId(id) } },
      { session }
    );

    await db.collection('reviews').deleteOne({ _id: new ObjectId(id) }, { session });
    await session.commitTransaction();
    return true;
  } catch (error) {
    await session.abortTransaction();
    throw new Error('Error eliminando review: ' + error.message);
  } finally {
    session.endSession();
  }
};

export const createCSV = async (id) => {
  const db = await connectDB();
  const session = db.client.startSession();
  try{
    session.startTransaction();
    // const movie = await db.collection('peliculas').findOne({_id: new ObjectId(id)})
    // if(!movie) throw new Error('pelicula no encontrada cabeza verga')
    const review = await db.collection('reviews').findOne({movieId: new ObjectId(id)})
    if(!review) throw new Error('review no encontrada cabeza verga')


    async function crearCSV(ruta, contenido) {
        try{
          await fs.writeFile(ruta, contenido)
        }catch(error){
          console.log("error");
          
        }
        crearCSV("/exports/file.csv", `${review._id} \nTitulo:${review.title} \nDescripcion:${review.comment} \nRAting: ${review.rating}`)
    }
    crearCSV()
    console.log(`Review encontada: ${review._id} \nTitulo:${review.title} \nDescripcion:${review.comment} \nRAting: ${review.rating}`);
    await session.commitTransaction();
    return true

  }catch(error){
    console.error('error creando CSV: '+ error.message);

  }finally{
    session.endSession()
  }
}

export const createNotification = async (id) => {
  const db = await connectDB();
  const session = db.client.startSession();
  try {
    session.startTransaction();
    const review = {
      userId: new ObjectId(userId),
      text: commentData.text,
      createdAt: new Date()
    };
    const result = await db.collection('reviews').updateOne(
      { _id: new ObjectId(reviewId) },
      { $set: { updatedAt: new Date() } },
      { session }
    );
    await session.commitTransaction();
    if (result.matchedCount === 0) throw new Error('Review no encontrada');
    return comment;
  } catch (error) {
    await session.abortTransaction();
    throw new Error('Error añadiendo notificacion: ' + error.message);
  } finally {
    session.endSession();
  }
};