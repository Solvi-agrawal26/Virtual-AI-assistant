import { PrismaClient } from '@prisma/client';
import { env } from './env';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Connected to Database successfully');
  } catch (error) {
    console.warn('⚠️ Database connection warning:', (error as Error).message);
    console.warn('💡 Ensure PostgreSQL is running or verify your DATABASE_URL in .env');
  }
};
