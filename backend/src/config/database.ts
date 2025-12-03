import { PrismaClient } from '@prisma/client';

// Determine if we're using PostgreSQL or SQLite based on DATABASE_URL
const isPostgres = process.env.DATABASE_URL?.startsWith('postgres');

let prisma: PrismaClient;

if (isPostgres) {
  // Production: PostgreSQL (no necesita adapter)
  prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
} else {
  // Development: SQLite con adapter
  const { PrismaLibSql } = require('@prisma/adapter-libsql');

  const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL || 'file:./prisma/dev.db'
  });

  prisma = new PrismaClient({
    adapter: adapter as any,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

export default prisma;
