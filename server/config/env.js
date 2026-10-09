import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-env',
  databaseUrl: process.env.DATABASE_URL,
  nodeEnv: process.env.NODE_ENV || 'development',
};

if (!env.databaseUrl) console.warn('DATABASE_URL is missing. Add it to .env before starting the API.');
