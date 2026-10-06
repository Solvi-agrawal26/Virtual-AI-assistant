import { Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/appError';
import { AuthenticatedRequest } from '../types';

export const getSettings = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    let settings = await prisma.assistantSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      settings = await prisma.assistantSettings.create({
        data: {
          userId,
          assistantName: 'Nova',
          personality: 'general',
          language: 'en',
          theme: 'dark',
          voiceEnabled: true,
          autoSpeak: false,
          temperature: 0.7,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: { settings },
    });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const updateData = req.body;

    const settings = await prisma.assistantSettings.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        ...updateData,
      },
    });

    res.status(200).json({
      success: true,
      data: { settings },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { name, email } = req.body;

    if (email) {
      const existing = await prisma.user.findFirst({
        where: { email, NOT: { id: userId } },
      });
      if (existing) {
        return next(AppError.conflict('Email is already in use by another account'));
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(200).json({
      success: true,
      data: { user: updatedUser },
    });
  } catch (error) {
    next(error);
  }
};
