import { Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { claudeService } from '../services/claude.service';
import { sanitizeText, inspectPromptSafety } from '../utils/sanitize';
import { AuthenticatedRequest, ChatMessageContext } from '../types';
import { logger } from '../utils/logger';

export const streamChat = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user!.userId;
  const { conversationId: reqConvId, message: rawMessage } = req.body;

  const message = sanitizeText(rawMessage);
  const safety = inspectPromptSafety(message);

  if (!safety.isSafe) {
    res.status(400).json({
      success: false,
      error: { message: safety.reason || 'Input rejected by safety check' },
    });
    return;
  }

  // Set SSE Headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const sendSSE = (data: unknown) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  let clientDisconnected = false;
  req.on('close', () => {
    clientDisconnected = true;
  });

  try {
    // 1. Fetch or create conversation
    let convId = reqConvId;
    let isNewConv = false;
    let autoTitle = 'New Chat';

    if (convId) {
      const existing = await prisma.conversation.findFirst({
        where: { id: convId, userId },
      });
      if (!existing) {
        sendSSE({ type: 'error', error: 'Conversation not found' });
        res.end();
        return;
      }
    } else {
      isNewConv = true;
      // Generate clean initial title from user query
      autoTitle = message.slice(0, 36).trim() + (message.length > 36 ? '...' : '');
      const created = await prisma.conversation.create({
        data: {
          title: autoTitle,
          userId,
        },
      });
      convId = created.id;
    }

    // 2. Fetch User Settings
    const userSettings = await prisma.assistantSettings.findUnique({
      where: { userId },
    });

    // 3. Save User Message to Database
    const savedUserMsg = await prisma.message.create({
      data: {
        conversationId: convId,
        role: 'user',
        content: message,
      },
    });

    // Inform client of conversation ID and user message
    sendSSE({
      type: 'start',
      conversationId: convId,
      userMessageId: savedUserMsg.id,
      title: isNewConv ? autoTitle : undefined,
    });

    // 4. Load Conversation Memory (last 16 messages for context)
    const history = await prisma.message.findMany({
      where: { conversationId: convId },
      orderBy: { createdAt: 'desc' },
      take: 16,
    });

    // Format context for Claude (chronological order)
    const contextMessages: ChatMessageContext[] = history
      .reverse()
      .map((msg) => ({
        role: (msg.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: msg.content,
      }));

    // 5. Stream from Claude Service
    await claudeService.streamResponse(
      contextMessages,
      {
        assistantName: userSettings?.assistantName,
        personality: userSettings?.personality,
        customSystemPrompt: userSettings?.customSystemPrompt,
        language: userSettings?.language,
        temperature: userSettings?.temperature,
      },
      (chunk: string) => {
        if (!clientDisconnected) {
          sendSSE({ type: 'chunk', text: chunk });
        }
      },
      async (fullText: string) => {
        try {
          // 6. Save Assistant response to database
          const savedAssistantMsg = await prisma.message.create({
            data: {
              conversationId: convId,
              role: 'assistant',
              content: fullText,
            },
          });

          // Update conversation timestamp
          await prisma.conversation.update({
            where: { id: convId },
            data: { updatedAt: new Date() },
          });

          if (!clientDisconnected) {
            sendSSE({
              type: 'done',
              messageId: savedAssistantMsg.id,
              fullText,
            });
            res.end();
          }
        } catch (dbErr) {
          logger.error('Failed to save assistant response message:', dbErr);
          if (!clientDisconnected) {
            sendSSE({ type: 'error', error: 'Failed to record complete response' });
            res.end();
          }
        }
      },
      (streamError: Error) => {
        logger.error('Stream processing error:', streamError);
        if (!clientDisconnected) {
          sendSSE({ type: 'error', error: streamError.message || 'Stream generation failed' });
          res.end();
        }
      },
      (sources) => {
        if (!clientDisconnected) {
          sendSSE({ type: 'sources', sources });
        }
      }
    );
  } catch (err) {
    logger.error('Chat endpoint error:', err);
    sendSSE({ type: 'error', error: (err as Error).message || 'Server error during chat stream' });
    res.end();
  }
};
