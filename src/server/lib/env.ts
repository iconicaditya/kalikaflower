function optional(name: string): string | null {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

export const env = {
  DATABASE_URL: optional('DATABASE_URL'),
  SESSION_SECRET: optional('SESSION_SECRET'),
  CLOUDINARY_CLOUD_NAME: optional('CLOUDINARY_CLOUD_NAME'),
  CLOUDINARY_API_KEY: optional('CLOUDINARY_API_KEY'),
  CLOUDINARY_API_SECRET: optional('CLOUDINARY_API_SECRET'),
  NODE_ENV: process.env.NODE_ENV ?? 'development',
};

export const isProd = env.NODE_ENV === 'production';

export function requireDatabaseUrl() {
  if (!env.DATABASE_URL) {
    throw new Error('Missing required env var: DATABASE_URL');
  }

  return env.DATABASE_URL;
}

export function requireSessionSecret() {
  if (!env.SESSION_SECRET) {
    throw new Error('Missing required env var: SESSION_SECRET');
  }

  return env.SESSION_SECRET;
}

export function requireCloudinaryEnv() {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    throw new Error('Missing required Cloudinary environment variables');
  }

  return {
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    apiSecret: env.CLOUDINARY_API_SECRET,
  };
}

