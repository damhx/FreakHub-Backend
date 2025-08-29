import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import { findUserById, updateUserPassword, addReview, addRating } from '../models/userModel.js';

export const getProfile = async (req, res) => {
  const userId = req.user._id;
  const user = await findUserById(userId);
  if (!user) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }

  const { password, ...profile } = user;
  res.json({ profile });
};

export const updatePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const userId = req.user._id;
  const { currentPassword, newPassword } = req.body;

  const user = await findUserById(userId);
  if (!user) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Contraseña actual incorrecta' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres' });
  }

  await updateUserPassword(userId, newPassword);
  res.json({ message: 'Contraseña actualizada exitosamente' });
};