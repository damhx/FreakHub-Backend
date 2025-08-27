import express from 'express';
import { register, login } from '../controllers/authController.js';
import { body } from 'express-validator';
import { findUserByEmail } from '../models/userModel.js';

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

export default router;