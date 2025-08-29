import { connectDB } from '../config/db.js';
import { ObjectId } from 'mongodb';

// Función para crear una nueva categoría (admin only)
export const createCategory = async (categoryData) => {
  const db = await connectDB();
  const session = db.client.startSession();
  try {
    session.startTransaction();
    // Verificar si ya existe
    const existing = await db.collection('categorias').findOne({ name: categoryData.name.toLowerCase() });
    if (existing) throw new Error('Categoría ya existe');
    
    const result = await db.collection('categorias').insertOne({
      name: categoryData.name.toLowerCase(), // Normalizar a minúsculas para consistencia
      createdAt: new Date(),
      updatedAt: new Date()
    }, { session });
    await session.commitTransaction();
    return { ...categoryData, _id: result.insertedId };
  } catch (error) {
    await session.abortTransaction();
    throw new Error('Error creando categoría: ' + error.message);
  } finally {
    session.endSession();
  }
};

// Función para obtener todas las categorías
export const getCategories = async () => {
  const db = await connectDB();
  return await db.collection('categorias').find().toArray();
};

// Función para obtener una categoría por ID
export const getCategoryById = async (id) => {
  const db = await connectDB();
  return await db.collection('categorias').findOne({ _id: new ObjectId(id) });
};

// Función para actualizar una categoría
export const updateCategory = async (id, categoryData) => {
  const db = await connectDB();
  const session = db.client.startSession();
  try {
    session.startTransaction();
    const result = await db.collection('categorias').updateOne(
      { _id: new ObjectId(id) },
      { $set: { name: categoryData.name.toLowerCase(), updatedAt: new Date() } },
      { session }
    );
    await session.commitTransaction();
    if (result.matchedCount === 0) throw new Error('Categoría no encontrada');
    return { ...categoryData, _id: new ObjectId(id) };
  } catch (error) {
    await session.abortTransaction();
    throw new Error('Error actualizando categoría: ' + error.message);
  } finally {
    session.endSession();
  }
};

// Función para eliminar una categoría
export const deleteCategory = async (id) => {
  const db = await connectDB();
  const session = db.client.startSession();
  try {
    session.startTransaction();
    const result = await db.collection('categorias').deleteOne({ _id: new ObjectId(id) }, { session });
    await session.commitTransaction();
    if (result.deletedCount === 0) throw new Error('Categoría no encontrada');
    return true;
  } catch (error) {
    await session.abortTransaction();
    throw new Error('Error eliminando categoría: ' + error.message);
  } finally {
    session.endSession();
  }
};

// Función para verificar si una categoría existe (para validar en películas)
export const categoryExists = async (name) => {
  const db = await connectDB();
  const category = await db.collection('categorias').findOne({ name: name.toLowerCase() });
  return !!category;
};

// Inicialización de categorías (ejecutar una vez)
export const initializeCategories = async () => {
  const db = await connectDB();
  const categories = ['pelicula', 'anime', 'serie', 'show', 'telenovela'];
  for (const name of categories) {
    const existing = await db.collection('categorias').findOne({ name: name.toLowerCase() });
    if (!existing) {
      await db.collection('categorias').insertOne({ name: name.toLowerCase(), createdAt: new Date() });
    }
  }
  console.log('Categorías inicializadas');
};