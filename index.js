import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import router from './routes/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', router);

(async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
})();