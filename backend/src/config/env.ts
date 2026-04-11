import dotenv from 'dotenv';

dotenv.config();

const port = Number(process.env.PORT ?? 5000);

if (Number.isNaN(port)) {
  throw new Error('PORT deve ser um numero valido');
}

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error('JWT_SECRET n�o foi configurado');
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL n�o foi configurado');
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

const smtpPortRaw = process.env.SMTP_PORT;
const smtpPort = smtpPortRaw ? Number(smtpPortRaw) : null;

if (smtpPortRaw && Number.isNaN(smtpPort)) {
  throw new Error('SMTP_PORT deve ser um numero valido');
}

const resetPasswordTokenTtlMinutes = Number(process.env.RESET_PASSWORD_TOKEN_TTL_MINUTES ?? 20);

if (Number.isNaN(resetPasswordTokenTtlMinutes) || resetPasswordTokenTtlMinutes < 5) {
  throw new Error('RESET_PASSWORD_TOKEN_TTL_MINUTES deve ser um numero maior ou igual a 5');
}

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
  smtpHost: process.env.SMTP_HOST ?? null,
  smtpPort,
  smtpUser: process.env.SMTP_USER ?? null,
  smtpPassword: process.env.SMTP_PASSWORD ?? null,
  smtpFrom: process.env.SMTP_FROM ?? null,
  smtpSecure: process.env.SMTP_SECURE === 'true',
  resetPasswordTokenTtlMinutes,
};
