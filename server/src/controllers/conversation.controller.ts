import { Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/appError';
import { AuthenticatedRequest } from '../types';

export const listConversations = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const search = req.query.search as string | undefined;

    const conversations = await prisma.conversation.findMany({
      where: {
        userId,
        ...(search
          ? {
              OR: [
                { title: { contains: search } },
                { messages: { some: { content: { contains: search } } } },
              ],
            }
          : {}),
      },
      include: {
        _count: {
          select: { messages: true },
        },
      },
      orderBy: [{ pinned: 'desc' }, { updatedAt: 'desc' }],
    });

    res.status(200).json({
      success: true,
      data: { conversations },
    });
  } catch (error) {
    next(error);
  }
};

export const getConversation = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const conversation = await prisma.conversation.findFirst({
      where: { id, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      return next(AppError.notFound('Conversation not found'));
    }

    res.status(200).json({
      success: true,
      data: { conversation },
    });
  } catch (error) {
    next(error);
  }
};

export const createConversation = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { title } = req.body;

    const conversation = await prisma.conversation.create({
      data: {
        title: title || 'New Conversation',
        userId,
      },
      include: {
        messages: true,
      },
    });

    res.status(201).json({
      success: true,
      data: { conversation },
    });
  } catch (error) {
    next(error);
  }
};

export const updateConversation = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { title, pinned } = req.body;

    const conversation = await prisma.conversation.findFirst({
      where: { id, userId },
    });

    if (!conversation) {
      return next(AppError.notFound('Conversation not found'));
    }

    const updated = await prisma.conversation.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(pinned !== undefined && { pinned }),
      },
    });

    res.status(200).json({
      success: true,
      data: { conversation: updated },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteConversation = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const conversation = await prisma.conversation.findFirst({
      where: { id, userId },
    });

    if (!conversation) {
      return next(AppError.notFound('Conversation not found'));
    }

    await prisma.conversation.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
