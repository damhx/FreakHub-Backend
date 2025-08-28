import { validationResult } from 'express-validator';
import { createMovie, getMovies, getMovieById, updateMovie, deleteMovie, addReview, approveMovie } from '../models/movieModel.js';
import { uploadImage } from '../utils/cloudinary.js'; // Asumiendo que lo creaste


export const getMoviesController = async (req, res) => {
  try {
    const filter = req.query.category ? { category: req.query.category } : {};
    const movies = await getMovies(filter);
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo películas', error: error.message });
  }
};

export const getMovieByIdController = async (req, res) => {
  try {
    const movie = await getMovieById(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Película no encontrada' });
    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo película', error: error.message });
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
    let imageUrl = '';
    if (req.file) {
      imageUrl = await uploadImage(req.file.buffer);
    }

    const movieData = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      year: parseInt(req.body.year),
      image: imageUrl,
      creatorId: req.user._id // Para saber quién propuso
    };

    const movie = await createMovie(movieData);
    res.status(201).json(movie);
  } catch (error) {
    res.status(500).json({ message: 'Error creando película', error: error.message });
  }
};

export const getPendingMoviesController = async (req, res) => {
  try {
    const movies = await getMovies({ status: 'pendiente' });
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo películas pendientes', error: error.message });
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