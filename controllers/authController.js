import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import { createUser, findUserByEmail } from '../models/userModel.js';

export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    return res.status(400).json({ message: 'El email ya está registrado' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = {
    email,
    password: hashedPassword,
    role: 'usuario',
    createdAt: new Date(),
  };

  await createUser(user);

  const { password: _, ...userWithoutPassword } = user;
  res.status(201).json({ message: 'Usuario creado exitosamente', user: userWithoutPassword });
};