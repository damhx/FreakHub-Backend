// ... importaciones existentes ...
import express from 'express';
import { register, login } from '../controllers/authController.js';
import { getProfile, updatePassword, addUserReview, addUserRating } from '../controllers/profileController.js';
import { findUserByEmail } from '../models/userModel.js';
import passport from '../config/passport.js';
import { body } from 'express-validator';
 import { authenticateJWT, isAdmin } from '../middlewares/authMiddleware.js';
 import { upload } from '../utils/cloudinary.js'; // Para upload de imagen
import {
  createMovieController,
  getMoviesController,
  getMovieByIdController,
  updateMovieController,
  deleteMovieController,
  addReviewController,
  getPendingMoviesController,
  approveMovieController
} from '../controllers/movieController.js';

const router = express.Router();
// rutas de login register y demas:

//para registrarse
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Debe ser un email válido'),
    body('email').custom(async (value) => {
      const user = await findUserByEmail(value);
      if (user) {
        throw new Error('El email ya está registrado');
      }
    }),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('username').notEmpty().withMessage('El nombre de usuario es requerido').isLength({ min: 3 }).withMessage('El nombre de usuario debe tener al menos 3 caracteres'),
  ],
  register
);

//para generar un login con su token
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Debe ser un email válido'),
    body('password').notEmpty().withMessage('La contraseña es requerida'),
  ],
  login
);

//para obtener la informacion del usuario
router.get('/profile', passport.authenticate('jwt', { session: false }), getProfile);

//para actualizar la password si el usuario lo desea
router.put(
  '/profile/password',
  [
    body('currentPassword').notEmpty().withMessage('La contraseña actual es requerida'),
    body('newPassword').isLength({ min: 6 }).withMessage('La nueva contraseña debe tener al menos 6 caracteres'),
  ],
  passport.authenticate('jwt', { session: false }),
  updatePassword
);

//accede a las reviews del usuario
router.post('/profile/review', passport.authenticate('jwt', { session: false }), addUserReview);

//accede a las calificaciones del usuario
router.post('/profile/rating', passport.authenticate('jwt', { session: false }), addUserRating);



// Rutas públicas
router.get('/movies', getMoviesController); // Listado para usuarios, solo muestra movies aceptadas
router.get('/movies/:id', getMovieByIdController); // Ir directamente a una pelicula (no se si deba ser pubico o protegido :()

// Rutas protegidas


//Crear movies y como estado por defecto lo deja en estado pendiente, lo pueden usar usuarios registrados pero el admin es quien luego aprueba o 
// desaprueba el POST 
router.post('/movies', authenticateJWT, upload.single('image'), [
  body('title').notEmpty().withMessage('Título requerido'),
  body('description').notEmpty().withMessage('Descripción requerida'),
  body('category').notEmpty().withMessage('Categoría requerida'),
  body('year').isInt({ min: 1900 }).withMessage('Año inválido')
], createMovieController);

// ruta para actualizar los datos de una pelicula
router.put('/movies/:id', authenticateJWT, isAdmin, upload.single('image'), [body('title').notEmpty()], updateMovieController);

//para eliminar pelicula
router.delete('/movies/:id', authenticateJWT, isAdmin, deleteMovieController);

//ruta para mirar que peliculas estan en estado pendientes 
router.get('/movies/pending', authenticateJWT, isAdmin, getPendingMoviesController);

//ruta para aprobar una pelicula(la idea es que en el frontEND solo se consuman las peliculas ocn el estado en aceptadas)
router.put('/movies/:id/approve', authenticateJWT, isAdmin, approveMovieController);


// Reseñas (protegidas)
router.post('/movies/:id/reviews', authenticateJWT, [body('title').notEmpty(), body('comment').notEmpty(), body('rating').isInt({ min: 1, max: 10 })], addReviewController);

export default router;