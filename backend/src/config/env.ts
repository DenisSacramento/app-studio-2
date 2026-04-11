import dotenv from 'dotenv';

dotenv.config();

const port = Number(process.env.PORT ?? 5000);

if (Number.isNaN(port)) {
  throw new Error('PORT deve ser um numero valido');
}

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error('JWT_SECRET não foi configurado');
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL não foi configurado');
}

const refreshSecret = process.env.JWT_REFRESH_SECRET ?? jwtSecret;
const bcryptRounds = Number(process.env.BCRYPT_ROUNDS ?? 10);

if (Number.isNaN(bcryptRounds) || bcryptRounds < 8) {
  throw new Error('BCRYPT_ROUNDS deve ser um numero maior ou igual a 8');
}

const corsOrigins = (process.env.CORS_ORIGINS ?? '*')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port,
  databaseUrl,
  corsOrigins,
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  jwtRefreshSecret: refreshSecret,
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  bcryptRounds,
};
