import NativeError from 'mongoose';
import { PassportStatic } from 'passport';
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';
import User, { IUser } from '../models/User';

export default (passport: PassportStatic) => {
  passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.SECRET_KEY || 'jvns',
  },
  (payload, done) => {
    User.findById(payload.id, (err: NativeError, user: IUser) => {
      if (err) {
        return done({ error: err }, false);
      }

      if (user) {
        return done(null, user);
      }

      return done(null, false);
    });
  }));
};