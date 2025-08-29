import express from 'express';
import { register, login, verifyAccount } from '../controllers/authController.js'; // Agregué verifyAccount
import { getProfile, updatePassword, addUserReview, addUserRating } from '../controllers/profileController.js';
import { propose, approve, reject } from '../controllers/movieController.js';
import { body } from 'express-validator';
import { findUserByEmail } from '../models/userModel.js';
import passport from '../config/passport.js';
import { authenticateJWT, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

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

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Debe ser un email válido'),
    body('password').notEmpty().withMessage('La contraseña es requerida'),
  ],
  login
);

router.get('/profile', passport.authenticate('jwt', { session: false }), getProfile);

router.put(
  '/profile/password',
  [
    body('currentPassword').notEmpty().withMessage('La contraseña actual es requerida'),
    body('newPassword').isLength({ min: 6 }).withMessage('La nueva contraseña debe tener al menos 6 caracteres'),
  ],
  passport.authenticate('jwt', { session: false }),
  updatePassword
);

router.post('/profile/review', passport.authenticate('jwt', { session: false }), addUserReview);

router.post('/profile/rating', passport.authenticate('jwt', { session: false }), addUserRating);

router.post(
  '/movies',
  authenticateJWT,
  [
    body('title').notEmpty().withMessage('El título es requerido'),
    body('categoryId').notEmpty().withMessage('La categoría es requerida'),
  ],
  propose
);

router.post(
  '/movies/:movieId/approve',
  authenticateJWT,
  isAdmin,
  approve
);

router.post(
  '/movies/:movieId/reject',
  authenticateJWT,
  isAdmin,
  reject
);

// Nueva ruta para verificación de cuenta
router.get('/verify', verifyAccount);

export default router;