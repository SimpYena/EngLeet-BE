import { config } from 'dotenv';

config({ path: '.env' });

export const AccessTokenConfig = {
  secret: process.env.AT_SECRET,
  expiresIn: process.env.AT_EXPIRATION_TIME,
};

export const RefreshTokenConfig = {
  secret: process.env.RT_SECRET,
  expiresIn: process.env.RT_EXPIRATION_TIME,
};


