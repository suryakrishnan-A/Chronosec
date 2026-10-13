import { PrismaClient } from '@prisma/client';

const rawUrl = process.env.DATABASE_URL?.trim();
// Strip surrounding single/double quotes if user accidentally pasted them in environment variables
let databaseUrl = rawUrl ? rawUrl.replace(/^["']|["']$/g, '').trim() : undefined;

if (databaseUrl && databaseUrl.includes('neon.tech') && !databaseUrl.includes('sslmode=')) {
  databaseUrl += databaseUrl.includes('?') ? '&sslmode=require' : '?sslmode=require';
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(databaseUrl ? { datasources: { db: { url: databaseUrl } } } : {}),
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
