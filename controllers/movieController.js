import { validationResult } from 'express-validator';
import { getMoviesByTitle, getMoviesByCategory,createMovie, getMovies,getMoviesPending, getMovieById, updateMovie, deleteMovie, addReview, approveMovie } from '../models/movieModel.js';
import { uploadImage } from '../utils/cloudinary.js'; // Asumiendo que lo creaste
import {categoryExists} from '../models/categoryModel.js'

export const getMoviesController = async (req, res) => {
  try {
    const filter = req.query.category ? { category: req.query.category } : {};
    const movies = await getMovies(filter);
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: 'Error obteasdasdsadniendo películas', error: error.message });
  }
};

export const getMovieByIdController = async (req, res) => {
  try {
    const movie = await getMovieById(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Película no encontrada' });
    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: ' película', error: error.message });
  }
};
export const getPendingMoviesController = async (req, res) => {
  try {
    const movies = await getMoviesPending({ status: 'pendiente' });
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: 'asdasd', error: error.message });
  }
};
export const updateMovieController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let imageUrl = req.body.image; // Mantener existente si no se sube nueva
    let status = req.body.status
    let description = req.body.description
    let category = req.body.category
    let year = parseInt(req.body.year)
    if (req.file) {
      imageUrl = await uploadImage(req.file.buffer);
    }

    const movieData = {
      title: req.body.title,
      description: description,
      category: category,
      status: status,
      year: year,
      image: imageUrl
    };

    const updatedMovie = await updateMovie(req.params.id, movieData);
    res.json(updatedMovie);
  } catch (error) {
    res.status(500).json({ message: 'Error actualizando película', error: error.message });
  }
};

export const deleteMovieController = async (req, res) => {
  try {
    await deleteMovie(req.params.id);
    res.json({ message: 'Película eliminada' });
  } catch (error) {
    res.status(500).json({ message: 'Error eliminando película', error: error.message });
  }
};

export const addReviewController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const reviewData = {
      title: req.body.title,
      comment: req.body.comment,
      rating: parseInt(req.body.rating)
    };
    const review = await addReview(req.params.id, reviewData, req.user._id); // req.user de JWT
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error añadiendo reseña', error: error.message });
  }
};

export const createMovieController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const exists = await categoryExists(req.body.category);
    if (!exists) return res.status(400).json({ message: 'Categoría no existe' });

    let imageUrl = '';
    if (req.file) {
      imageUrl = await uploadImage(req.file.buffer);
    }

    const movieData = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category.toLowerCase(),
      year: parseInt(req.body.year),
      image: imageUrl,
      creatorId: req.user._id
    };

    const movie = await createMovie(movieData);
    res.status(201).json(movie);
  } catch (error) {
    res.status(500).json({ message: 'Error creando película', error: error.message });
  }
};



export const approveMovieController = async (req, res) => {
  try {
    await approveMovie(req.params.id);
    res.json({ message: 'Película aprobada exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error aprobando película', error: error.message });
  }
};
export const getMoviesByCategoryController = async (req, res) => {
  try {
    const { category } = req.query; // Obtener categoría desde la query string
    console.log(`Solicitud recibida para categoría: ${category}`); // Depuración
    if (!category) {
      return res.status(400).json({ message: 'Categoría es requerida' });
    }
    const movies = await getMoviesByCategory(category);
    console.log(`Películas devueltas: ${movies.length}`); // Depuración
    res.json(movies);
  } catch (error) {
    console.error('Error en getMoviesByCategoryController:', error.message);
    res.status(500).json({ message: 'Error obteniendo películas', error: error.message });
  }
};

export const getMoviesByTitleController = async (req, res) =>{
  try{
    const {title} =req.query
    console.log(`se busca titulo: ${title}`);
    if(!title){
      return res.status(400).json({message: 'Error obteniendo peliculas',error: error.message})
      }
      const movies = await getMoviesByTitle(title);
      console.log(`Peliculas devueltas: ${movies.length}`);
      res.json(movies)
    
  }catch(error){
    console.error("error en getMoviesByTitleController: ",  error.message);
    res.status(500).json({ message: 'Error obteniendo películas', error: error.message });

    
  }
}