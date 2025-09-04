import { validationResult } from 'express-validator';
import { 
  createReview, 
  getReviewsByMovie, 
  likeReview, 
  addComment, 
  updateReview, 
  deleteReview,
  createCSV,
  createNotification
} from '../models/reviewModel.js';

export const getMovieByIdController = async (req, res) => {
  try {
    const movie = await getMovieById(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Película no encontrada' });

    const reviews = await getReviewsByMovie(req.params.id);

    res.json({ ...movie, reviews });
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo película', error: error.message });
  }
};

export const createReviewController = async (req, res) => {
  const errors = validationResult(req);
  console.log("tumadre");
  
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const reviewData = {
      movieId: req.params.movieId,
      userId: req.user._id,
      title: req.body.title,
      comment: req.body.comment,
      rating: parseInt(req.body.rating)
    };

    
    const review = await createReview(reviewData);
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error creando review', error: error.message });
  }
};

export const getReviewsByMovieController = async (req, res) => {
  try {
    const reviews = await getReviewsByMovie(req.params.movieId);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo reviews', error: error.message });
  }
};

export const likeReviewController = async (req, res) => {
  try {
    const isLike = req.body.isLike !== false; // true para like, false para dislike
    await likeReview(req.params.reviewId, req.user._id, isLike);
    res.json({ message: `Review ${isLike ? 'liked' : 'disliked'} exitosamente` });
  } catch (error) {
    res.status(500).json({ message: 'Error en like/dislike', error: error.message });
  }
};

export const addCommentController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const commentData = { text: req.body.text };
    const comment = await addComment(req.params.reviewId, commentData, req.user._id);
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Error añadiendo comentario', error: error.message });
  }
};

export const updateReviewController = async (req, res) => {
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
    await updateReview(req.params.reviewId, reviewData);
    res.json({ message: 'Review actualizada exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error actualizando review', error: error.message });
  }
};

export const deleteReviewController = async (req, res) => {
  try {
    await deleteReview(req.params.reviewId);
    res.json({ message: 'Review eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error eliminando review', error: error.message });
  }
};


export const createCSVController = async (req, res) => {
  try {
    await createCSV(req.params.reviewId);
    res.json({message: 'Review Obtenida exitosamente'})
  } catch(error){
    res.status(500).json({ message: 'error creando CSV', error: error.message });
    
  }

};

export const createNotification = async (req, res) => {
  try {
    await createNotification(req.params.reviewId);
    res.json({ message: 'Review creada exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error eliminando review', error: error.message });
  }
};
