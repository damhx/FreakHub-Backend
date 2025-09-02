import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import dotenv from 'dotenv';
import { connectDB } from './db.js';
import { ObjectId } from 'mongodb';

dotenv.config();

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET // Sin fallback
};

passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
  try {
    const db = await connectDB();
    // Convertir id a ObjectId si es string
    const userId = typeof jwt_payload.id === 'string' ? new ObjectId(jwt_payload.id) : jwt_payload.id;
    const user = await db.collection('users').findOne({ _id: userId });
    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  } catch (error) {
    return done(error, false);
  }
}));

export default passport;