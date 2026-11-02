import { Response, NextFunction } from 'express';
import ProjectService from '../services/projectService';
import ApiResponse from '../utils/apiResponse';
import { IAuthRequest } from '../types';
import {
  projectCreateSchema,
  projectUpdateSchema,
  taskCreateSchema,
  taskUpdateSchema,
  taskStatusUpdateSchema,
  taskCommentSchema,
  milestoneCreateSchema,
  milestoneUpdateSchema,
  documentUploadSchema,
  businessEventSchema,
  businessEventUpdateSchema
} from '../validators/projectValidator';

function extractBusinessId(req: IAuthRequest): string {
  const headerId = req.headers['x-business-id'] as string;
  const paramId = Array.isArray(req.params.businessId) ? req.params.businessId[0] : req.params.businessId;
  const queryId = req.query.businessId as string;
  const userBizId = req.user?.businessId;
  const bizId = headerId || paramId || queryId || userBizId;
  if (!bizId) {
    throw new Error('Business identifier is required. Provide x-business-id header.');
  }
  return Array.isArray(bizId) ? bizId[0] : bizId;
}

function getParamId(req: IAuthRequest): string {
  const id = req.params.id;
  if (!id) throw new Error('Resource identifier is required in request parameters.');
  return Array.isArray(id) ? id[0] : id;
}

export class ProjectController {
  /**
   * ============================================================================
   * MODULE 1: PROJECT MANAGEMENT
   * ============================================================================
   */
  static async createProject(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const validated = projectCreateSchema.parse(req.body);
      const actorUser = req.user
        ? {
            userId: req.user.userId,
            name: `${(req.user as any).firstName || ''} ${(req.user as any).lastName || ''}`.trim() || req.user.email,
            role: req.user.role
          }
        : undefined;

      const project = await ProjectService.createProject(businessId, validated, actorUser);
      return ApiResponse.created(res, project, 'Project created successfully.');
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return ApiResponse.error(res, 'Validation error', 400, err.errors);
      }
      return ApiResponse.error(res, err.message || 'Failed to create project', 400);
    }
  }

  static async listProjects(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const filters = {
        search: req.query.search as string,
        status: req.query.status as string,
        priority: req.query.priority as string,
        managerId: req.query.managerId as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined
      };
      const actorUser = req.user ? { userId: req.user.userId, role: req.user.role } : undefined;
      const result = await ProjectService.listProjects(businessId, filters, actorUser);
      return ApiResponse.success(res, result, 'Projects retrieved successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async getProjectById(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const projectId = getParamId(req);
      const project = await ProjectService.getProjectById(businessId, projectId);
      return ApiResponse.success(res, project, 'Project details retrieved successfully.');
    } catch (err: any) {
      return ApiResponse.error(res, err.message || 'Project not found', 404);
    }
  }

  static async updateProject(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const projectId = getParamId(req);
      const validated = projectUpdateSchema.parse(req.body);
      const actorUser = req.user
        ? {
            userId: req.user.userId,
            name: `${(req.user as any).firstName || ''} ${(req.user as any).lastName || ''}`.trim() || req.user.email,
            role: req.user.role
          }
        : undefined;

      const project = await ProjectService.updateProject(businessId, projectId, validated, actorUser);
      return ApiResponse.success(res, project, 'Project updated successfully.');
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return ApiResponse.error(res, 'Validation error', 400, err.errors);
      }
      return ApiResponse.error(res, err.message || 'Failed to update project', 400);
    }
  }

  static async deleteProject(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const projectId = getParamId(req);
      const result = await ProjectService.deleteProject(businessId, projectId);
      return ApiResponse.success(res, result, result.message);
    } catch (err: any) {
      return ApiResponse.error(res, err.message || 'Failed to delete project', 400);
    }
  }

  /**
   * ============================================================================
   * MODULE 2: TASK MANAGEMENT
   * ============================================================================
   */
  static async createTask(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const validated = taskCreateSchema.parse(req.body);
      const actorUser = req.user
        ? {
            userId: req.user.userId,
            name: `${(req.user as any).firstName || ''} ${(req.user as any).lastName || ''}`.trim() || req.user.email,
            role: req.user.role
          }
        : undefined;

      const task = await ProjectService.createTask(businessId, validated, actorUser);
      return ApiResponse.created(res, task, 'Task created and dispatched successfully.');
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return ApiResponse.error(res, 'Validation error', 400, err.errors);
      }
      return ApiResponse.error(res, err.message || 'Failed to create task', 400);
    }
  }

  static async listTasks(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const filters = {
        projectId: req.query.projectId as string,
        status: req.query.status as string,
        priority: req.query.priority as string,
        assignedToId: req.query.assignedToId as string,
        search: req.query.search as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined
      };
      const result = await ProjectService.listTasks(businessId, filters);
      return ApiResponse.success(res, result, 'Tasks retrieved successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async getTaskById(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const taskId = getParamId(req);
      const task = await ProjectService.getTaskById(businessId, taskId);
      return ApiResponse.success(res, task, 'Task details retrieved.');
    } catch (err: any) {
      return ApiResponse.error(res, err.message || 'Task not found', 404);
    }
  }

  static async updateTask(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const taskId = getParamId(req);
      const validated = taskUpdateSchema.parse(req.body);
      const actorUser = req.user
        ? {
            userId: req.user.userId,
            name: `${(req.user as any).firstName || ''} ${(req.user as any).lastName || ''}`.trim() || req.user.email,
            role: req.user.role
          }
        : undefined;

      const task = await ProjectService.updateTask(businessId, taskId, validated, actorUser);
      return ApiResponse.success(res, task, 'Task updated.');
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return ApiResponse.error(res, 'Validation error', 400, err.errors);
      }
      return ApiResponse.error(res, err.message || 'Failed to update task', 400);
    }
  }

  static async updateTaskStatus(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const taskId = getParamId(req);
      const validated = taskStatusUpdateSchema.parse(req.body);
      const actorUser = req.user
        ? {
            userId: req.user.userId,
            name: `${(req.user as any).firstName || ''} ${(req.user as any).lastName || ''}`.trim() || req.user.email,
            role: req.user.role
          }
        : undefined;

      const task = await ProjectService.updateTaskStatus(
        businessId,
        taskId,
        validated.status,
        actorUser,
        validated.statusNotes
      );
      return ApiResponse.success(res, task, 'Task status updated on Kanban board.');
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return ApiResponse.error(res, 'Validation error', 400, err.errors);
      }
      return ApiResponse.error(res, err.message || 'Failed to update task status', 400);
    }
  }

  static async deleteTask(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const taskId = getParamId(req);
      const result = await ProjectService.deleteTask(businessId, taskId);
      return ApiResponse.success(res, result, result.message);
    } catch (err: any) {
      return ApiResponse.error(res, err.message || 'Failed to delete task', 400);
    }
  }

  /**
   * ============================================================================
   * MODULE 3: KANBAN BOARD
   * ============================================================================
   */
  static async getKanbanBoard(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const projectId = getParamId(req);
      const kanban = await ProjectService.getKanbanBoard(businessId, projectId);
      return ApiResponse.success(res, kanban, 'Kanban board retrieved successfully.');
    } catch (err: any) {
      return ApiResponse.error(res, err.message || 'Failed to load Kanban board', 400);
    }
  }

  /**
   * ============================================================================
   * MODULE 4: TIMELINE & MILESTONES
   * ============================================================================
   */
  static async getProjectTimeline(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const projectId = getParamId(req);
      const timeline = await ProjectService.getProjectTimeline(businessId, projectId);
      return ApiResponse.success(res, timeline, 'Project timeline and Gantt schedule retrieved.');
    } catch (err: any) {
      return ApiResponse.error(res, err.message || 'Failed to load timeline', 400);
    }
  }

  static async createMilestone(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const validated = milestoneCreateSchema.parse(req.body);
      const milestone = await ProjectService.createMilestone(businessId, validated);
      return ApiResponse.created(res, milestone, 'Milestone scheduled successfully.');
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return ApiResponse.error(res, 'Validation error', 400, err.errors);
      }
      return ApiResponse.error(res, err.message || 'Failed to create milestone', 400);
    }
  }

  static async updateMilestone(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const milestoneId = getParamId(req);
      const validated = milestoneUpdateSchema.parse(req.body);
      const milestone = await ProjectService.updateMilestone(businessId, milestoneId, validated);
      return ApiResponse.success(res, milestone, 'Milestone updated.');
    } catch (err: any) {
      return ApiResponse.error(res, err.message || 'Failed to update milestone', 400);
    }
  }

  static async deleteMilestone(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const milestoneId = getParamId(req);
      const result = await ProjectService.deleteMilestone(businessId, milestoneId);
      return ApiResponse.success(res, result, result.message);
    } catch (err: any) {
      return ApiResponse.error(res, err.message || 'Failed to delete milestone', 400);
    }
  }

  /**
   * ============================================================================
   * MODULE 5: TEAM COLLABORATION & COMMENTS
   * ============================================================================
   */
  static async addTaskComment(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const taskId = getParamId(req);
      const validated = taskCommentSchema.parse(req.body);
      const actorUser = {
        userId: req.user!.userId,
        name: `${(req.user as any).firstName || ''} ${(req.user as any).lastName || ''}`.trim() || req.user!.email,
        role: req.user!.role
      };

      const comment = await ProjectService.addTaskComment(businessId, taskId, validated, actorUser);
      return ApiResponse.created(res, comment, 'Comment added.');
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return ApiResponse.error(res, 'Validation error', 400, err.errors);
      }
      return ApiResponse.error(res, err.message || 'Failed to add comment', 400);
    }
  }

  static async listTaskComments(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const taskId = getParamId(req);
      const comments = await ProjectService.listTaskComments(businessId, taskId);
      return ApiResponse.success(res, comments, 'Comments retrieved.');
    } catch (err) {
      next(err);
    }
  }

  /**
   * ============================================================================
   * MODULE 6: DOCUMENT MANAGEMENT
   * ============================================================================
   */
  static async uploadDocument(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const validated = documentUploadSchema.parse(req.body);
      const actorUser = req.user
        ? {
            userId: req.user.userId,
            name: `${(req.user as any).firstName || ''} ${(req.user as any).lastName || ''}`.trim() || req.user.email
          }
        : undefined;

      const doc = await ProjectService.uploadDocument(businessId, validated, actorUser);
      return ApiResponse.created(res, doc, 'Document attached and registered successfully.');
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return ApiResponse.error(res, 'Validation error', 400, err.errors);
      }
      return ApiResponse.error(res, err.message || 'Failed to upload document', 400);
    }
  }

  static async listDocuments(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const filters = {
        projectId: req.query.projectId as string,
        taskId: req.query.taskId as string,
        category: req.query.category as string,
        search: req.query.search as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined
      };
      const result = await ProjectService.listDocuments(businessId, filters);
      return ApiResponse.success(res, result, 'Documents retrieved successfully.');
    } catch (err) {
      next(err);
    }
  }

  static async deleteDocument(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const documentId = getParamId(req);
      const result = await ProjectService.deleteDocument(businessId, documentId);
      return ApiResponse.success(res, result, result.message);
    } catch (err: any) {
      return ApiResponse.error(res, err.message || 'Failed to delete document', 400);
    }
  }

  /**
   * ============================================================================
   * MODULE 8: CENTRALIZED CALENDAR & BUSINESS EVENTS
   * ============================================================================
   */
  static async createBusinessEvent(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const validated = businessEventSchema.parse(req.body);
      const actorUser = req.user
        ? {
            userId: req.user.userId,
            name: `${(req.user as any).firstName || ''} ${(req.user as any).lastName || ''}`.trim() || req.user.email
          }
        : undefined;

      const event = await ProjectService.createBusinessEvent(businessId, validated, actorUser);
      return ApiResponse.created(res, event, 'Business event scheduled successfully.');
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return ApiResponse.error(res, 'Validation error', 400, err.errors);
      }
      return ApiResponse.error(res, err.message || 'Failed to schedule event', 400);
    }
  }

  static async listBusinessEvents(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const filters = {
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        eventType: req.query.eventType as string
      };
      const events = await ProjectService.listBusinessEvents(businessId, filters);
      return ApiResponse.success(res, events, 'Events retrieved.');
    } catch (err) {
      next(err);
    }
  }

  static async getAggregatedCalendar(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const businessId = extractBusinessId(req);
      const filters = {
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string
      };
      const feed = await ProjectService.getAggregatedCalendar(businessId, filters);
      return ApiResponse.success(res, feed, 'Aggregated calendar feed generated.');
    } catch (err) {
      next(err);
    }
  }
}

export default ProjectController;

