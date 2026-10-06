import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { verifyAccessToken } from '../utils/jwt';
import { AppError } from '../utils/appError';
import { prisma } from '../config/prisma';

export const authenticate = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    // 1. Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    // 2. Check httpOnly cookie fallback
    else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return next(AppError.unauthorized('Authentication token missing'));
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded;
    return next();
  } catch (error) {
    return next(AppError.unauthorized('Invalid or expired authentication token'));
  }
};

/**
 * Flexible authentication: verifies token if present, or seamlessly falls back
 * to a local guest user session so asking questions NEVER throws "token missing".
 */
export const authenticateWithGuestFallback = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      try {
        const decoded = verifyAccessToken(token);
        req.user = decoded;
        return next();
      } catch {
        // Fallback to guest
      }
    }

    // Find or create guest user
    let guestUser = await prisma.user.findUnique({
      where: { email: 'guest@nova.ai' },
    });

    if (!guestUser) {
      guestUser = await prisma.user.create({
        data: {
          email: 'guest@nova.ai',
          password: 'guest_protected_dummy_hash_123',
          name: 'Guest Explorer',
          settings: {
            create: {
              assistantName: 'Nova',
              personality: 'general',
              theme: 'dark',
              language: 'en',
              voiceEnabled: true,
              autoSpeak: false,
              temperature: 0.7,
            },
          },
        },
      });
    }

    req.user = {
      userId: guestUser.id,
      email: guestUser.email,
      role: guestUser.role,
    };
    return next();
  } catch (err) {
    next(err);
  }
};

export const requireRole = (role: 'ADMIN' | 'USER') => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(AppError.unauthorized());
    }
    if (req.user.role !== role && req.user.role !== 'ADMIN') {
      return next(AppError.forbidden(`Requires ${role} permissions`));
    }
    return next();
  };
};
