import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';

const isProduction = process.env.NODE_ENV === 'production';

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (isProduction) {
    if (!secret || secret.length < 32) {
      throw new Error(
        'FATAL: JWT_SECRET is required in production and must be at least 32 characters long.'
      );
    }
    return secret;
  }
  return secret || 'dev_only_jwt_secret_do_not_use_in_production';
};

const getJwtRefreshSecret = (jwtSecret: string): string => {
  const refreshSecret = process.env.JWT_REFRESH_SECRET;
  if (isProduction) {
    if (!refreshSecret || refreshSecret.length < 32) {
      throw new Error(
        'FATAL: JWT_REFRESH_SECRET is required in production and must be at least 32 characters long.'
      );
    }
    if (refreshSecret === jwtSecret) {
      throw new Error(
        'FATAL: JWT_REFRESH_SECRET must be distinct from JWT_SECRET in production.'
      );
    }
    return refreshSecret;
  }
  return refreshSecret || 'dev_only_refresh_secret_do_not_use_in_production';
};

const JWT_SECRET = getJwtSecret();
const JWT_REFRESH_SECRET = getJwtRefreshSecret(JWT_SECRET);
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export const generateAccessToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
};

export const generateRefreshToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions);
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
};

export const getRefreshTokenExpiry = (): Date => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date;
};
