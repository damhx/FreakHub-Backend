
# FreakHub Backend

FreakHub es una aplicación backend desarrollada con Node.js y Express que gestiona una plataforma para publicaciones relacionadas con películas, series, telenovelas y animes. Este proyecto incluye autenticación de usuarios, gestión de contenido (películas, categorías y reseñas), y funcionalidades administrativas, utilizando MongoDB como base de datos y Cloudinary para el manejo de imágenes.

## Descripción General

- **Tecnologías**: Node.js, Express, MongoDB, Passport.js, Cloudinary.
- **Propósito**: Proporcionar una API RESTful para una aplicación frontend que permite a los usuarios registrar publicaciones, reseñas y comentarios, mientras los administradores aprueban contenido y gestionan categorías.
- **Estado**: En desarrollo activo (última actualización: 01 de septiembre de 2025).

## Requisitos

- Node.js (versión 14.x o superior).
- MongoDB (local o remoto, con conexión configurada).
- Una cuenta de Cloudinary para subir imágenes (credenciales en `.env`).

## Instalación

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/tu-usuario/freakhub-backend.git
   cd freakhub-backend
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**:
   Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:
   ```
   MONGODB_URI=mongodb://localhost:27017/freakhub
   JWT_SECRET=tu_secreto_jwt
   CLOUDINARY_CLOUD_NAME=tu_cloud_name
   CLOUDINARY_API_KEY=tu_api_key
   CLOUDINARY_API_SECRET=tu_api_secret
   PORT=3000
   ```

4. **Iniciar el servidor**:
   ```bash
   npm start
   ```
   El servidor estará disponible en `http://localhost:3000`.

## Estructura del Proyecto

```
freakhub-backend/
├── config/              # Configuraciones (db.js, passport.js)
├── controllers/         # Lógica de negocio (authController.js, movieController.js, etc.)
├── middlewares/         # Middleware (authMiddleware.js)
├── models/              # Modelos de datos (userModel.js, movieModel.js)
├── routes/              # Rutas de la API (index.js)
├── utils/               # Utilidades (cloudinary.js)
├── .env                 # Variables de entorno
├── package.json         # Dependencias y scripts
└── README.md            # Este archivo
```

## Rutas de la API

A continuación, se detalla cada ruta disponible en la API, incluyendo métodos HTTP, endpoints, parámetros, autenticación requerida, y una breve descripción de su propósito.

### Autenticación y Perfil

- **POST `/register`**
  - **Descripción**: Registra un nuevo usuario.
  - **Autenticación**: No requerida.
  - **Parámetros en el body**:
    - `email` (string, requerido, email válido).
    - `password` (string, requerido, mínimo 6 caracteres).
    - `username` (string, requerido, mínimo 3 caracteres).
    - `role` (string, opcional, "admin" o "usuario").
  - **Respuesta exitosa**: `{ token, user }`.
  - **Errores**: 400 (validación fallida), 409 (email ya registrado).

- **POST `/login`**
  - **Descripción**: Inicia sesión y devuelve un token JWT.
  - **Autenticación**: No requerida.
  - **Parámetros en el body**:
    - `email` (string, requerido, email válido).
    - `password` (string, requerido).
  - **Respuesta exitosa**: `{ token }`.
  - **Errores**: 400 (validación fallida), 401 (credenciales inválidas).

- **GET `/profile`**
  - **Descripción**: Obtiene la información del perfil del usuario autenticado.
  - **Autenticación**: Requerida (JWT).
  - **Parámetros**: Ninguno.
  - **Respuesta exitosa**: `{ username, email, role }`.
  - **Errores**: 401 (no autenticado).

- **PUT `/profile/password`**
  - **Descripción**: Actualiza la contraseña del usuario autenticado.
  - **Autenticación**: Requerida (JWT).
  - **Parámetros en el body**:
    - `currentPassword` (string, requerido).
    - `newPassword` (string, requerido, mínimo 6 caracteres).
  - **Respuesta exitosa**: `{ message: "Contraseña actualizada" }`.
  - **Errores**: 400 (validación fallida), 401 (contraseña actual incorrecta).

### Gestión de Películas

- **GET `/movies`**
  - **Descripción**: Lista todas las películas con estado "aceptada".
  - **Autenticación**: Requerida (JWT).
  - **Parámetros**: Ninguno.
  - **Respuesta exitosa**: `[{ _id, title, description, category, year, image, rating, status, reviews }...]`.
  - **Errores**: 500 (error interno).

- **GET `/movies/get/:id`**
  - **Descripción**: Obtiene los detalles de una película específica por ID.
  - **Autenticación**: Pública (considerar protegerla con JWT si es sensible).
  - **Parámetros**:
    - `:id` (string, ID de MongoDB).
  - **Respuesta exitosa**: `{ _id, title, description, category, year, image, rating, status, reviews }`.
  - **Errores**: 404 (película no encontrada), 500 (error interno).

- **POST `/movies`**
  - **Descripción**: Crea una nueva película (estado "pendiente" por defecto).
  - **Autenticación**: Requerida (JWT).
  - **Parámetros en el body**:
    - `title` (string, requerido).
    - `description` (string, requerido).
    - `category` (string, requerido).
    - `year` (integer, requerido, mínimo 1900).
    - `image` (file, opcional, imagen JPG/PNG).
  - **Respuesta exitosa**: `{ _id, title, description, category, year, status: "pendiente", rating: 0, reviews: [] }`.
  - **Errores**: 400 (validación fallida), 401 (no autenticado).

- **PUT `/movies/:id`**
  - **Descripción**: Actualiza los datos de una película.
  - **Autenticación**: Requerida (JWT) + Rol Admin.
  - **Parámetros**:
    - `:id` (string, ID de MongoDB).
  - **Parámetros en el body**:
    - `title` (string, requerido).
    - `description` (string, opcional).
    - `category` (string, opcional).
    - `year` (integer, opcional).
    - `image` (file, opcional).
    - `status` (string, opcional).
  - **Respuesta exitosa**: `{ _id, title, description, category, year, status, rating, reviews }`.
  - **Errores**: 404 (película no encontrada), 401 (no autorizado).

- **DELETE `/movies/:id`**
  - **Descripción**: Elimina una película.
  - **Autenticación**: Requerida (JWT) + Rol Admin.
  - **Parámetros**:
    - `:id` (string, ID de MongoDB).
  - **Respuesta exitosa**: `true`.
  - **Errores**: 404 (película no encontrada), 401 (no autorizado).

- **GET `/movies/pending`**
  - **Descripción**: Lista todas las películas con estado "pendiente".
  - **Autenticación**: Requerida (JWT) + Rol Admin.
  - **Parámetros**: Ninguno.
  - **Respuesta exitosa**: `[{ _id, title, description, category, year, image, status, rating, reviews }...]`.
  - **Errores**: 401 (no autorizado), 500 (error interno).

- **PUT `/movies/:id/approve`**
  - **Descripción**: Aprueba una película cambiando su estado a "aceptada".
  - **Autenticación**: Requerida (JWT) + Rol Admin.
  - **Parámetros**:
    - `:id` (string, ID de MongoDB).
  - **Respuesta exitosa**: `true`.
  - **Errores**: 404 (película no encontrada o ya aprobada), 401 (no autorizado).

- **GET `/movies/category`**
  - **Descripción**: Lista películas filtradas por categoría.
  - **Autenticación**: Requerida (JWT).
  - **Parámetros en la query**:
    - `category` (string, requerido, ej. "pelicula", "telenovela").
  - **Respuesta exitosa**: `[{ _id, title, description, category, year, image, rating, status, reviews }...]`.
  - **Errores**: 400 (categoría no proporcionada), 500 (error interno).

- **GET `/movies/title`**
  - **Descripción**: Lista películas filtradas por título (búsqueda aproximada).
  - **Autenticación**: Requerida (JWT).
  - **Parámetros en la query**:
    - `title` (string, requerido, parte del título a buscar).
  - **Respuesta exitosa**: `[{ _id, title, description, category, year, image, rating, status, reviews }...]`.
  - **Errores**: 400 (título no proporcionado), 500 (error interno).

### Gestión de Categorías

- **GET `/categories`**
  - **Descripción**: Lista todas las categorías disponibles.
  - **Autenticación**: Pública.
  - **Parámetros**: Ninguno.
  - **Respuesta exitosa**: `[{ _id, name }...]`.
  - **Errores**: 500 (error interno).

- **POST `/categories`**
  - **Descripción**: Crea una nueva categoría.
  - **Autenticación**: Requerida (JWT) + Rol Admin.
  - **Parámetros en el body**:
    - `name` (string, requerido).
  - **Respuesta exitosa**: `{ _id, name }`.
  - **Errores**: 400 (validación fallida), 401 (no autorizado).

- **GET `/categories/:id`**
  - **Descripción**: Obtiene una categoría por ID.
  - **Autenticación**: Requerida (JWT) + Rol Admin.
  - **Parámetros**:
    - `:id` (string, ID de MongoDB).
  - **Respuesta exitosa**: `{ _id, name }`.
  - **Errores**: 404 (categoría no encontrada), 401 (no autorizado).

- **PUT `/categories/:id`**
  - **Descripción**: Actualiza una categoría por ID.
  - **Autenticación**: Requerida (JWT) + Rol Admin.
  - **Parámetros**:
    - `:id` (string, ID de MongoDB).
  - **Parámetros en el body**:
    - `name` (string, requerido).
  - **Respuesta exitosa**: `{ _id, name }`.
  - **Errores**: 404 (categoría no encontrada), 401 (no autorizado).

- **DELETE `/categories/:id`**
  - **Descripción**: Elimina una categoría por ID.
  - **Autenticación**: Requerida (JWT) + Rol Admin.
  - **Parámetros**:
    - `:id` (string, ID de MongoDB).
  - **Respuesta exitosa**: `true`.
  - **Errores**: 404 (categoría no encontrada), 401 (no autorizado).

### Gestión de Reseñas

- **POST `/movies/create/:movieId/reviews`**
  - **Descripción**: Crea una reseña para una película específica.
  - **Autenticación**: Requerida (JWT).
  - **Parámetros**:
    - `:movieId` (string, ID de MongoDB).
  - **Parámetros en el body**:
    - `title` (string, requerido).
    - `comment` (string, requerido).
    - `rating` (integer, requerido, 1-10).
  - **Respuesta exitosa**: `{ _id, title, comment, rating, likes, dislikes, createdAt }`.
  - **Errores**: 400 (validación fallida), 404 (película no encontrada), 401 (no autenticado).

- **GET `/movies/:movieId/reviews`**
  - **Descripción**: Lista todas las reseñas de una película.
  - **Autenticación**: Pública (considerar protegerla si es sensible).
  - **Parámetros**:
    - `:movieId` (string, ID de MongoDB).
  - **Respuesta exitosa**: `[{ _id, title, comment, rating, likes, dislikes, createdAt, comments }...]`.
  - **Errores**: 404 (película no encontrada), 500 (error interno).

- **POST `/reviews/:reviewId/like`**
  - **Descripción**: Añade o quita un like/dislike a una reseña.
  - **Autenticación**: Requerida (JWT).
  - **Parámetros**:
    - `:reviewId` (string, ID de MongoDB).
  - **Parámetros en el body**:
    - `isLike` (boolean, requerido, true para like, false para dislike).
  - **Respuesta exitosa**: `true`.
  - **Errores**: 404 (reseña no encontrada), 401 (no autenticado).

- **POST `/reviews/:reviewId/comments`**
  - **Descripción**: Añade un comentario a una reseña.
  - **Autenticación**: Requerida (JWT).
  - **Parámetros**:
    - `:reviewId` (string, ID de MongoDB).
  - **Parámetros en el body**:
    - `text` (string, requerido).
  - **Respuesta exitosa**: `{ _id, text, userName, createdAt }`.
  - **Errores**: 400 (validación fallida), 404 (reseña no encontrada), 401 (no autenticado).

- **PUT `/reviews/:reviewId`**
  - **Descripción**: Actualiza una reseña (solo admin).
  - **Autenticación**: Requerida (JWT) + Rol Admin.
  - **Parámetros**:
    - `:reviewId` (string, ID de MongoDB).
  - **Parámetros en el body**:
    - `title` (string, requerido).
    - `comment` (string, opcional).
    - `rating` (integer, opcional, 1-10).
  - **Respuesta exitosa**: `{ _id, title, comment, rating, likes, dislikes, createdAt }`.
  - **Errores**: 404 (reseña no encontrada), 401 (no autorizado).

- **DELETE `/reviews/:reviewId`**
  - **Descripción**: Elimina una reseña (solo admin).
  - **Autenticación**: Requerida (JWT) + Rol Admin.
  - **Parámetros**:
    - `:reviewId` (string, ID de MongoDB).
  - **Respuesta exitosa**: `true`.
  - **Errores**: 404 (reseña no encontrada), 401 (no autorizado).

## Contribuciones

1. Haz un fork del repositorio.
2. Crea una rama para tu característica (`git checkout -b feature/nueva-caracteristica`).
3. Realiza tus cambios y haz commit (`git commit -m 'Añadida nueva funcionalidad'`).
4. Envía un pull request.

## Licencia

Este proyecto está bajo la licencia MIT. Consulta el archivo `LICENSE` para más detalles.

## Contacto

Para preguntas o soporte, contacta a [tu-email@ejemplo.com](mailto:tu-email@ejemplo.com).
```

### Instrucciones
- Guarda este contenido en un archivo llamado `README.md` en la raíz de tu proyecto backend.
- Asegúrate de reemplazar los placeholders como `tu-usuario`, `tu_base_de_datos`, `tu_secreto_jwt`, `tu-email@ejemplo.com`, etc., con los valores reales correspondientes a tu configuración.
- Si hay más controladores o rutas que no están listados (ej. `getMoviesByTitleController`), asegúrate de implementarlos en `movieController.js` y `movieModel.js` para que coincidan con la documentación.

Dime si necesitas ajustar algo o añadir más detalles. ¡Listo para el siguiente paso!
