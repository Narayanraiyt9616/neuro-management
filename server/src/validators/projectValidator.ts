import { z } from 'zod';

export const projectCreateSchema = z.object({
  name: z.string().trim().min(2, 'Project name must be at least 2 characters'),
  description: z.string().trim().optional().default(''),
  projectManagerId: z.string().optional(),
  startDate: z.string().or(z.date()).optional(),
  endDate: z.string().or(z.date()).optional(),
  budget: z.number().nonnegative('Budget cannot be negative').optional().default(0),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional().default('MEDIUM'),
  status: z
    .enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED', 'planned', 'active', 'in_progress', 'completed', 'on_hold'])
    .optional()
    .default('ACTIVE'),
  assignedEmployees: z.array(z.string()).optional().default([]),
  members: z
    .array(
      z.object({
        userId: z.string(),
        employeeId: z.string().optional(),
        name: z.string().min(1, 'Member name is required'),
        email: z.string().email('Valid email required'),
        role: z
          .enum(['PROJECT_MANAGER', 'TEAM_LEAD', 'DEVELOPER', 'DESIGNER', 'QA', 'CONTRIBUTOR', 'VIEWER'])
          .optional()
          .default('CONTRIBUTOR')
      })
    )
    .optional()
    .default([]),
  client: z.string().optional().default(''),
  customerId: z.string().optional(),
  tags: z.array(z.string()).optional().default([])
});

export const projectUpdateSchema = projectCreateSchema.partial().extend({
  progress: z.number().min(0).max(100).optional(),
  spent: z.number().nonnegative().optional()
});

export const taskCreateSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  title: z.string().trim().min(2, 'Task title must be at least 2 characters'),
  description: z.string().trim().optional().default(''),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional().default('MEDIUM'),
  deadline: z.string().or(z.date()),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'BLOCKED']).optional().default('TODO'),
  assignedToId: z.string().optional(),
  estimatedHours: z.number().nonnegative().optional().default(0),
  attachments: z
    .array(
      z.object({
        name: z.string(),
        url: z.string(),
        fileType: z.string(),
        fileSize: z.number().optional()
      })
    )
    .optional()
    .default([])
});

export const taskUpdateSchema = taskCreateSchema.partial().extend({
  loggedHours: z.number().nonnegative().optional(),
  statusNotes: z.string().optional()
});

export const taskStatusUpdateSchema = z.object({
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'BLOCKED']),
  statusNotes: z.string().optional()
});

export const taskCommentSchema = z.object({
  content: z.string().trim().min(1, 'Comment cannot be empty'),
  mentions: z.array(z.string()).optional().default([]),
  attachments: z
    .array(
      z.object({
        name: z.string(),
        url: z.string(),
        fileType: z.string()
      })
    )
    .optional()
    .default([])
});

export const milestoneCreateSchema = z.object({
  projectId: z.string().min(1, 'Project reference is required'),
  title: z.string().trim().min(2, 'Milestone title is required'),
  description: z.string().trim().optional().default(''),
  dueDate: z.string().or(z.date()),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'ACHIEVED', 'MISSED']).optional().default('PENDING'),
  order: z.number().optional().default(0)
});

export const milestoneUpdateSchema = milestoneCreateSchema.partial();

export const documentUploadSchema = z.object({
  projectId: z.string().optional(),
  taskId: z.string().optional(),
  title: z.string().trim().min(2, 'Document title is required'),
  fileName: z.string().trim().min(1, 'File name is required'),
  fileUrl: z.string().trim().min(1, 'File URL or data is required'),
  fileType: z.string().trim().min(1, 'File type is required'),
  fileSize: z.number().max(10485760, 'File size exceeds maximum limit of 10MB'),
  category: z
    .enum(['REQUIREMENTS', 'DESIGN', 'SPECIFICATION', 'CONTRACT', 'REPORT', 'ATTACHMENT', 'OTHER'])
    .optional()
    .default('OTHER'),
  isPublic: z.boolean().optional().default(false)
});

export const businessEventSchema = z.object({
  title: z.string().trim().min(2, 'Event title is required'),
  description: z.string().trim().optional().default(''),
  eventType: z
    .enum(['MEETING', 'DEADLINE', 'MILESTONE', 'HOLIDAY', 'COMPANY_EVENT', 'REVIEW'])
    .optional()
    .default('MEETING'),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  allDay: z.boolean().optional().default(false),
  location: z.string().trim().optional().default(''),
  meetingUrl: z.string().trim().optional().default(''),
  attendees: z
    .array(
      z.object({
        userId: z.string().optional(),
        name: z.string().min(1, 'Attendee name required'),
        email: z.string().email('Valid attendee email required')
      })
    )
    .optional()
    .default([]),
  projectId: z.string().optional(),
  taskId: z.string().optional(),
  color: z.string().optional().default('#3b82f6')
});

export const businessEventUpdateSchema = businessEventSchema.partial();

