import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import multer from 'multer';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.memoryStorage();
export const upload = multer({ storage });

export const uploadImage = async (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream({ folder: 'peliculas' }, (error, result) => {
      if (error) reject(new Error('Error subiendo imagen: ' + error.message));
      else resolve(result.secure_url); // Retorna el URL seguro
    });
    uploadStream.end(fileBuffer);
  });
};