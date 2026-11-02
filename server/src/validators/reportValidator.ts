import { z } from 'zod';

export const reportGenerateSchema = z.object({
  reportType: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUAL']),
  format: z.enum(['json', 'csv', 'pdf']).default('json'),
  startDate: z.string().optional(),
  endDate: z.string().optional()
});
