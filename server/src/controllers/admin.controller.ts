import { Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../types';

export const getUsageStats = async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalUsers, totalConversations, totalMessages, messagesToday] = await Promise.all([
      prisma.user.count(),
      prisma.conversation.count(),
      prisma.message.count(),
      prisma.message.count({
        where: {
          createdAt: { gte: today },
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalConversations,
          totalMessages,
          messagesToday,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
