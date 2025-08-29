import { connectDB } from './config/db.js';

(async () => {
  const db = await connectDB();
  await db.collection('users').updateMany({}, { $set: { reviews: [] } }, { upsert: false });
  await db.collection('peliculas').updateMany({}, { $set: { reviews: [] } }, { upsert: false });
  console.log('Migración completada');
  process.exit(0);
})();