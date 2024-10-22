import { config } from 'dotenv';
import { ExtractJwt } from 'passport-jwt';

config({ path: '.env' });

export const AccessTokenConfig = {
  secret: process.env.AT_SECRET,
  expiresIn: process.env.AT_EXPIRATION_TIME,
};

export const RefreshTokenConfig = {
  secret: process.env.RT_SECRET,
  expiresIn: process.env.RT_EXPIRATION_TIME,
};
export const JwtStrategyConfig = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  ignoreExpiration: true,
  secretOrKey: process.env.AT_SECRET,
};

export const RefreshJwtStrategyConfig = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  ignoreExpiration: true,
  secretOrKey: process.env.RT_SECRET,
};

export const VerifyTokenConfig = {
  secret: process.env.VERIFY_SECRET,
  expiresIn: process.env.VERIFY_EXPIRATION_TIME,
};

