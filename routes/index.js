// ... importaciones existentes ...
import { body } from 'express-validator';
import { authenticateJWT, isAdmin } from '../middlewares/authMiddleware.js';
import { upload } from '../utils/cloudinary.js'; // Para upload de imagen
import {
  createMovieController,
  getMoviesController,
  getMovieByIdController,
  updateMovieController,
  deleteMovieController,
  addReviewController
} from '../controllers/movieController.js';

// Rutas públicas
router.get('/movies', getMoviesController); // Listado básico
router.get('/movies/:id', getMovieByIdController); // Detalle (público o protegido? Haz protegido para reseñas completas)

// Rutas protegidas
router.post('/movies', authenticateJWT, isAdmin, upload.single('image'), [body('title').notEmpty(), body('description').notEmpty(), body('category').notEmpty(), body('year').isInt()], createMovieController);
router.put('/movies/:id', authenticateJWT, isAdmin, upload.single('image'), [body('title').notEmpty()], updateMovieController);
router.delete('/movies/:id', authenticateJWT, isAdmin, deleteMovieController);

// Reseñas (protegidas)
router.post('/movies/:id/reviews', authenticateJWT, [body('title').notEmpty(), body('comment').notEmpty(), body('rating').isInt({ min: 1, max: 10 })], addReviewController);