import express from 'express';
import { register } from '../controllers/authController.js';
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

export default router;