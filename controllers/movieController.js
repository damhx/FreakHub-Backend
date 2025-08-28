import { validationResult } from 'express-validator';
import { proposeMovie, approveMovie, rejectMovie } from '../models/movieModel.js';

export const propose = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const movieData = {
    title: req.body.title,
    desc: req.body.desc,
    categoryId: req.body.categoryId,
    year: req.body.year,
    image: req.body.image,
  };

  try {
    const result = await proposeMovie(movieData);
    res.status(201).json({ message: 'Película propuesta exitosamente', result });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const approve = async (req, res) => {
  const { movieId } = req.params;
  try {
    await approveMovie(movieId);
    res.json({ message: 'Película aprobada' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const reject = async (req, res) => {
  const { movieId } = req.params;
  try {
    await rejectMovie(movieId);
    res.json({ message: 'Película rechazada' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};