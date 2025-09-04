// ... importaciones existentes ...
import express from 'express';
import { register, login, verifyAccount } from '../controllers/authController.js'; // Agregué verifyAccount
import { body } from 'express-validator';
import { findUserByEmail } from '../models/userModel.js';
import passport from '../config/passport.js';
import { authenticateJWT, isAdmin } from '../middlewares/authMiddleware.js';
import { getProfile, updatePassword } from '../controllers/profileController.js';
 import { upload } from '../utils/cloudinary.js'; // Para upload de imagen

 //import movies
import {
  createMovieController,
  getMoviesController,
  getMovieByIdController,
  updateMovieController,
  deleteMovieController,
  addReviewController,
  getPendingMoviesController,
  approveMovieController,
  getMoviesByCategoryController,
  getMoviesByTitleController
} from '../controllers/movieController.js';

//import category
import { 
  createCategoryController, 
  getCategoriesController, 
  getCategoryByIdController, 
  updateCategoryController, 
  deleteCategoryController 
} from '../controllers/categoryController.js';

//import reviews
import { 
  createReviewController, 
  getReviewsByMovieController, 
  likeReviewController, 
  addCommentController, 
  updateReviewController, 
  deleteReviewController,
  createCSVController
} from '../controllers/reviewController.js';
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
    body('role').optional().isIn(['admin', 'usuario']).withMessage('El rol debe ser "admin" o "usuario"'),
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



// Rutas públicas
router.get('/movies', getMoviesController); // Listado para usuarios, solo muestra movies aceptadas
 router.get('/movies/get/:id', getMovieByIdController); // Ir directamente a una pelicula (no se si deba ser pubico o protegido :()
  
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

//ruta para listar movies por categoria:
router.get('/movies/category', authenticateJWT, getMoviesByCategoryController);
//ruta para listar por titulo
router.get('/movies/title', authenticateJWT, getMoviesByTitleController);

// Reseñas (protegidas)
/* router.post('/movies/:id/reviews', authenticateJWT, [body('title').notEmpty(), body('comment').notEmpty(), body('rating').isInt({ min: 1, max: 10 })], addReviewController);
 */

//CATEGORIAS
// ver todas las categorias
router.get('/categories', getCategoriesController); // Listado para todos (opciones disponibles)

// Rutas admin
//crear categorias
router.post('/categories', authenticateJWT, isAdmin, [body('name').notEmpty().withMessage('Nombre requerido')], createCategoryController);

//obtener categorias por id
router.get('/categories/:id', authenticateJWT, isAdmin, getCategoryByIdController);

//actualizar categorias por id
router.put('/categories/:id', authenticateJWT, isAdmin, [body('name').notEmpty().withMessage('Nombre requerido')], updateCategoryController);

//eliminar categorias por id 
router.delete('/categories/:id', authenticateJWT, isAdmin, deleteCategoryController);

//REVIEWS

//crear una review
router.post('/movies/create/:movieId/reviews', authenticateJWT, [body('title').notEmpty(), body('comment').notEmpty(), body('rating').isInt({ min: 1, max: 10 })], createReviewController);

//listar reviews de una pelicula
router.get('/movies/:movieId/reviews', getReviewsByMovieController); // Pública o protegida? Haz pública para detalle

//poner like/dislike
router.post('/reviews/:reviewId/like', authenticateJWT, likeReviewController); // Body { isLike: true/false }

//comentarios de cada reviews
router.post('/reviews/:reviewId/comments', authenticateJWT, [body('text').notEmpty()], addCommentController);

// Admin: Update/Delete
//actualizar review
router.put('/reviews/:reviewId', authenticateJWT, isAdmin, [body('title').notEmpty()], updateReviewController);

//eliminar review
router.delete('/reviews/:reviewId', authenticateJWT, isAdmin, deleteReviewController);

router.get('/reviews/CSV/:reviewId', authenticateJWT, isAdmin, createCSVController)
export default router;
// createCSVController

