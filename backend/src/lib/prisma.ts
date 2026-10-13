import { PrismaClient } from '@prisma/client';

function sanitizeDatabaseUrl(val?: string): string | undefined {
  if (!val) return undefined;
  let url = val.trim();
  // Match protocol start (handles 'psql postgresql://', quotes, prefixes, etc.)
  const match = url.match(/postgres(?:ql)?:\/\//i);
  if (match && match.index !== undefined && match.index >= 0) {
    url = url.slice(match.index);
  }
  // Strip trailing quotes, semicolons, and spaces
  url = url.replace(/['";\s]+$/, '').trim();
  // Ensure sslmode=require for Neon PostgreSQL
  if (url.includes('neon.tech') && !url.includes('sslmode=')) {
    url += url.includes('?') ? '&sslmode=require' : '?sslmode=require';
  }
  return url;
}

if (process.env.DATABASE_URL) {
  const cleaned = sanitizeDatabaseUrl(process.env.DATABASE_URL);
  if (cleaned) {
    process.env.DATABASE_URL = cleaned;
  }
}

if (process.env.DIRECT_URL) {
  const cleaned = sanitizeDatabaseUrl(process.env.DIRECT_URL);
  if (cleaned) {
    process.env.DIRECT_URL = cleaned;
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(process.env.DATABASE_URL ? { datasources: { db: { url: process.env.DATABASE_URL } } } : {}),
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
