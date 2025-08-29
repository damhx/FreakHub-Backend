import { validationResult } from 'express-validator';
import { 
  createCategory, 
  getCategories, 
  getCategoryById, 
  updateCategory, 
  deleteCategory 
} from '../models/categoryModel.js';

export const createCategoryController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const categoryData = { name: req.body.name };
    const category = await createCategory(categoryData);
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error creando categoría', error: error.message });
  }
};

export const getCategoriesController = async (req, res) => {
  try {
    const categories = await getCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo categorías', error: error.message });
  }
};

export const getCategoryByIdController = async (req, res) => {
  try {
    const category = await getCategoryById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Categoría no encontrada' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo categoría', error: error.message });
  }
};

export const updateCategoryController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const categoryData = { name: req.body.name };
    const updatedCategory = await updateCategory(req.params.id, categoryData);
    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: 'Error actualizando categoría', error: error.message });
  }
};

export const deleteCategoryController = async (req, res) => {
  try {
    await deleteCategory(req.params.id);
    res.json({ message: 'Categoría eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error eliminando categoría', error: error.message });
  }
};