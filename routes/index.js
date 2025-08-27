import express from 'express';
import { register, login } from '../controllers/authController.js';
import { getProfile, updatePassword, addUserReview, addUserRating } from '../controllers/profileController.js';
import { body } from 'express-validator';
import { findUserByEmail } from '../models/userModel.js';
import passport from '../config/passport.js';

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

export default router;