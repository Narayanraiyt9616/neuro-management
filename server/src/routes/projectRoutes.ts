import { Router } from 'express';
import { ProjectController } from '../controllers/projectController';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

// Enforce authentication for all project and collaboration endpoints
router.use(authenticateToken);

/**
 * ============================================================================
 * CALENDAR & EVENTS (Place before parametrized :id routes)
 * ============================================================================
 */
router.get('/calendar/feed', ProjectController.getAggregatedCalendar);
router.get('/calendar/events', ProjectController.listBusinessEvents);
router.post(
  '/calendar/events',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  ProjectController.createBusinessEvent
);

/**
 * ============================================================================
 * TASKS & KANBAN INTERACTION
 * ============================================================================
 */
router.get('/tasks', ProjectController.listTasks);
router.post(
  '/tasks',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  ProjectController.createTask
);
router.get('/tasks/:id', ProjectController.getTaskById);
router.put(
  '/tasks/:id',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  ProjectController.updateTask
);
router.patch(
  '/tasks/:id/status',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  ProjectController.updateTaskStatus
);
router.delete(
  '/tasks/:id',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  ProjectController.deleteTask
);

/**
 * ============================================================================
 * TASK COMMENTS & COLLABORATION
 * ============================================================================
 */
router.get('/tasks/:id/comments', ProjectController.listTaskComments);
router.post(
  '/tasks/:id/comments',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  ProjectController.addTaskComment
);

/**
 * ============================================================================
 * DOCUMENT MANAGEMENT
 * ============================================================================
 */
router.get('/documents', ProjectController.listDocuments);
router.post(
  '/documents',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER', 'EMPLOYEE'),
  ProjectController.uploadDocument
);
router.delete(
  '/documents/:id',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  ProjectController.deleteDocument
);

/**
 * ============================================================================
 * PROJECT MILESTONES
 * ============================================================================
 */
router.post(
  '/milestones',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  ProjectController.createMilestone
);
router.put(
  '/milestones/:id',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  ProjectController.updateMilestone
);
router.delete(
  '/milestones/:id',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  ProjectController.deleteMilestone
);

/**
 * ============================================================================
 * PROJECT MANAGEMENT (CRUD, KANBAN & TIMELINE)
 * ============================================================================
 */
router.get('/', ProjectController.listProjects);
router.post(
  '/',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  ProjectController.createProject
);
router.get('/:id', ProjectController.getProjectById);
router.put(
  '/:id',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'MANAGER'),
  ProjectController.updateProject
);
router.delete(
  '/:id',
  authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER'),
  ProjectController.deleteProject
);
router.get('/:id/kanban', ProjectController.getKanbanBoard);
router.get('/:id/timeline', ProjectController.getProjectTimeline);

export default router;
