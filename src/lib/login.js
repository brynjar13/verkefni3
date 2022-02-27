import { Strategy, ExtractJwt } from 'passport-jwt';
import passport from 'passport';
import { findById } from './users.js';

const { JWT_SECRET: jwtSecret } = process.env;

export const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret,
};

async function strat(data, next) {
  const user = await findById(data.id);
  if (user) {
    next(null, user);
  } else {
    next(null, false);
  }
}

export function requireAuthentication(req, res, next) {
  return passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      const error =
        info.name === 'TokenExpiredError' ? 'expired token' : 'invalid token';

      return res.status(401).json({ error });
    }

    req.user = user;
    return next();
  })(req, res, next);
}

passport.use(new Strategy(jwtOptions, strat));

export default passport;
