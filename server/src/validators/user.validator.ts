import { z } from 'zod';

export const updateSettingsSchema = z.object({
  assistantName: z.string().min(1).max(50).optional(),
  personality: z.enum(['general', 'coding', 'business', 'academic', 'creative', 'custom']).optional(),
  customSystemPrompt: z.string().max(2000).optional().nullable(),
  language: z.string().min(2).max(10).optional(),
  theme: z.enum(['dark', 'light']).optional(),
  voiceEnabled: z.boolean().optional(),
  autoSpeak: z.boolean().optional(),
  temperature: z.number().min(0).max(1).optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  email: z.string().email().optional(),
});
