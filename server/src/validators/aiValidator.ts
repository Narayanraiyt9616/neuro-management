import { z } from 'zod';

export const aiQuerySchema = z.object({
  question: z.string().min(2, 'Question must be at least 2 characters').max(1000, 'Question cannot exceed 1000 characters'),
  context: z.record(z.string(), z.unknown()).optional()
});

export type AiQueryInput = z.infer<typeof aiQuerySchema>;
