import mongoose, { Types } from 'mongoose';
import Project, { IProjectDocument, ProjectStatus, ProjectPriority } from '../models/Project';
import Task, { ITaskDocument, TaskStatus, TaskPriority } from '../models/Task';
import TaskComment, { ITaskCommentDocument } from '../models/TaskComment';
import ProjectMilestone, { IProjectMilestoneDocument, MilestoneStatus } from '../models/ProjectMilestone';
import ProjectDocument, { IProjectDocumentDocument } from '../models/ProjectDocument';
import BusinessEvent, { IBusinessEventDocument } from '../models/BusinessEvent';
import ProjectMember, { IProjectMemberDocument } from '../models/ProjectMember';
import Notification from '../models/Notification';
import User from '../models/User';
import Employee from '../models/Employee';
import logger from '../utils/logger';
import HRService from './hrService';
import { notifyUser, emitTaskEvent, emitToBusiness } from '../socket';
import {
  IProjectCreateInput,
  IProjectUpdateInput,
  ITaskCreateInput,
  ITaskUpdateInput,
  ITaskCommentInput,
  IProjectMilestoneInput,
  IProjectMilestoneUpdateInput,
  IProjectDocumentInput,
  IBusinessEventInput,
  IBusinessEventUpdateInput,
  IKanbanBoardData,
  IProjectTimelineData
} from '../types';

function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

// In-Memory Fallback Stores for resilient and offline execution
export const memProjects: Map<string, any> = new Map();
export const memTasks: Map<string, any> = new Map();
export const memTaskComments: Map<string, any> = new Map();
export const memMilestones: Map<string, any> = new Map();
export const memDocuments: Map<string, any> = new Map();
export const memEvents: Map<string, any> = new Map();
export const memProjectMembers: Map<string, any> = new Map();

export class ProjectService {
  /**
   * ============================================================================
   * MODULE 1: PROJECT MANAGEMENT
   * ============================================================================
   */
  static async createProject(businessId: string, input: IProjectCreateInput, actorUser?: { userId?: string; name?: string; role?: string }) {
    const startDate = input.startDate ? new Date(input.startDate) : new Date();
    const endDate = input.endDate ? new Date(input.endDate) : undefined;
    const actorName = actorUser?.name || 'Authorized Manager';

    if (isDbConnected()) {
      const count = await Project.countDocuments({ businessId: new Types.ObjectId(businessId) });
      const year = startDate.getFullYear();
      const projectCode = `PRJ-${year}-${String(1001 + count).padStart(4, '0')}`;

      let managerName = '';
      let managerIdObj: Types.ObjectId | undefined;
      if (input.projectManagerId && Types.ObjectId.isValid(input.projectManagerId)) {
        managerIdObj = new Types.ObjectId(input.projectManagerId);
        const u = await User.findById(managerIdObj).lean();
        if (u) managerName = u.name || u.email;
      }

      const assignedObjs = (input.assignedEmployees || [])
        .filter((id) => Types.ObjectId.isValid(id))
        .map((id) => new Types.ObjectId(id));

      const initialHistory = [
        {
          action: 'PROJECT_CREATED',
          performedBy: actorName,
          timestamp: new Date(),
          details: `Project "${input.name}" initiated in ${input.status || 'ACTIVE'} status.`
        }
      ];

      const project = await Project.create({
        businessId: new Types.ObjectId(businessId),
        projectCode,
        name: input.name.trim(),
        description: input.description || '',
        projectManagerId: managerIdObj,
        projectManagerName: managerName,
        startDate,
        endDate,
        budget: input.budget || 0,
        spent: 0,
        priority: input.priority || 'MEDIUM',
        status: (input.status || 'ACTIVE').toUpperCase(),
        assignedEmployees: assignedObjs,
        members: (input.members || []).map((m) => ({
          userId: new Types.ObjectId(m.userId),
          employeeId: m.employeeId && Types.ObjectId.isValid(m.employeeId) ? new Types.ObjectId(m.employeeId) : undefined,
          name: m.name,
          email: m.email,
          role: m.role || 'CONTRIBUTOR',
          assignedAt: new Date()
        })),
        progress: 0,
        client: input.client || '',
        customerId: input.customerId && Types.ObjectId.isValid(input.customerId) ? new Types.ObjectId(input.customerId) : undefined,
        tags: input.tags || [],
        history: initialHistory
      });

      // Notification for assigned manager
      if (managerIdObj && managerIdObj.toString() !== actorUser?.userId) {
        await Notification.create({
          businessId: new Types.ObjectId(businessId),
          recipientUserId: managerIdObj,
          title: 'Assigned as Project Manager',
          message: `You have been appointed as Project Manager for "${project.name}".`,
          type: 'PROJECT_ASSIGNMENT',
          metadata: { projectId: project._id, projectCode: project.projectCode }
        });
        notifyUser(managerIdObj.toString(), {
          recipientUserId: managerIdObj.toString(),
          title: 'Assigned as Project Manager',
          message: `You have been appointed as Project Manager for "${project.name}".`,
          type: 'PROJECT_ASSIGNMENT',
          createdAt: new Date().toISOString()
        });
      }

      emitToBusiness(businessId, 'project:created', { projectId: project._id, name: project.name });
      return project;
    }

    // In-memory fallback
    const newId = `prj_${Date.now()}`;
    const projectCode = `PRJ-${startDate.getFullYear()}-${String(1001 + memProjects.size).padStart(4, '0')}`;
    const proj = {
      _id: newId,
      businessId,
      projectCode,
      name: input.name.trim(),
      description: input.description || '',
      projectManagerId: input.projectManagerId,
      projectManagerName: 'Assigned Manager',
      startDate,
      endDate,
      budget: input.budget || 0,
      spent: 0,
      priority: input.priority || 'MEDIUM',
      status: (input.status || 'ACTIVE').toUpperCase(),
      assignedEmployees: input.assignedEmployees || [],
      members: input.members || [],
      progress: 0,
      client: input.client || '',
      tags: input.tags || [],
      history: [
        {
          action: 'PROJECT_CREATED',
          performedBy: actorName,
          timestamp: new Date(),
          details: `Project "${input.name}" initiated.`
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memProjects.set(newId, proj);
    return proj;
  }

  static async listProjects(
    businessId: string,
    filters: { search?: string; status?: string; priority?: string; managerId?: string; page?: number; limit?: number } = {},
    actorUser?: { userId?: string; role?: string }
  ) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.max(1, Math.min(100, filters.limit || 50));
    const skip = (page - 1) * limit;

    if (isDbConnected()) {
      const query: any = { businessId: new Types.ObjectId(businessId) };
      if (filters.status) query.status = filters.status.toUpperCase();
      if (filters.priority) query.priority = filters.priority.toUpperCase();
      if (filters.managerId && Types.ObjectId.isValid(filters.managerId)) {
        query.projectManagerId = new Types.ObjectId(filters.managerId);
      }
      if (filters.search) {
        const regex = new RegExp(filters.search.trim(), 'i');
        query.$or = [{ name: regex }, { projectCode: regex }, { client: regex }, { description: regex }];
      }

      // If employee, only filter to assigned projects if required by permission
      if (actorUser?.role === 'EMPLOYEE' && actorUser.userId && Types.ObjectId.isValid(actorUser.userId)) {
        query.$or = [
          ...(query.$or || []),
          { assignedEmployees: new Types.ObjectId(actorUser.userId) },
          { 'members.userId': new Types.ObjectId(actorUser.userId) },
          { projectManagerId: new Types.ObjectId(actorUser.userId) }
        ];
      }

      const [projects, total] = await Promise.all([
        Project.find(query)
          .populate('projectManagerId', 'firstName lastName email')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Project.countDocuments(query)
      ]);

      return { projects, total, page, totalPages: Math.ceil(total / limit) };
    }

    let list = Array.from(memProjects.values()).filter((p) => p.businessId === businessId);
    if (filters.status) list = list.filter((p) => String(p.status).toUpperCase() === filters.status?.toUpperCase());
    if (filters.priority) list = list.filter((p) => p.priority === filters.priority);
    if (filters.search) {
      const s = filters.search.toLowerCase();
      list = list.filter((p) => p.name?.toLowerCase().includes(s) || p.projectCode?.toLowerCase().includes(s));
    }

    return {
      projects: list.slice(skip, skip + limit),
      total: list.length,
      page,
      totalPages: Math.ceil(list.length / limit)
    };
  }

  static async getProjectById(businessId: string, projectId: string) {
    if (isDbConnected()) {
      const project = await Project.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(projectId)
      })
        .populate('projectManagerId', 'firstName lastName email')
        .lean();

      if (!project) throw new Error('Project not found.');

      // Fetch task stats & counts
      const [totalTasks, completedTasks, milestones, documents] = await Promise.all([
        Task.countDocuments({ businessId: new Types.ObjectId(businessId), projectId: project._id }),
        Task.countDocuments({ businessId: new Types.ObjectId(businessId), projectId: project._id, status: 'COMPLETED' }),
        ProjectMilestone.find({ businessId: new Types.ObjectId(businessId), projectId: project._id }).sort({ dueDate: 1 }).lean(),
        ProjectDocument.find({ businessId: new Types.ObjectId(businessId), projectId: project._id }).sort({ createdAt: -1 }).lean()
      ]);

      const computedProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : (project.progress || 0);

      return {
        ...project,
        totalTasks,
        completedTasks,
        computedProgress,
        milestones,
        documents
      };
    }

    const proj = memProjects.get(projectId);
    if (!proj) throw new Error('Project not found.');
    const projTasks = Array.from(memTasks.values()).filter((item) => item.projectId === projectId);
    const completedTasks = projTasks.filter((item) => item.status === 'COMPLETED').length;
    const progress = projTasks.length > 0 ? Math.round((completedTasks / projTasks.length) * 100) : proj.progress || 0;
    proj.progress = progress;
    return {
      ...proj,
      totalTasks: projTasks.length,
      completedTasks,
      computedProgress: progress,
      progress
    };
  }

  static async updateProject(
    businessId: string,
    projectId: string,
    input: IProjectUpdateInput,
    actorUser?: { userId?: string; name?: string; role?: string }
  ) {
    const actorName = actorUser?.name || 'Manager';

    if (isDbConnected()) {
      const project = await Project.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(projectId)
      });

      if (!project) throw new Error('Project not found.');

      const oldStatus = project.status;
      if (input.name) project.name = input.name.trim();
      if (input.description !== undefined) project.description = input.description;
      if (input.budget !== undefined) project.budget = input.budget;
      if (input.spent !== undefined) project.spent = input.spent;
      if (input.priority) project.priority = input.priority;
      if (input.progress !== undefined) project.progress = input.progress;
      if (input.startDate) project.startDate = new Date(input.startDate);
      if (input.endDate !== undefined) project.endDate = input.endDate ? new Date(input.endDate) : undefined;
      if (input.client !== undefined) project.client = input.client;
      if (input.tags) project.tags = input.tags;

      if (input.status) {
        project.status = input.status.toUpperCase();
        if (oldStatus !== project.status) {
          project.history.push({
            action: 'STATUS_CHANGED',
            performedBy: actorName,
            timestamp: new Date(),
            details: `Status transitioned from ${oldStatus} to ${project.status}`
          });

          emitToBusiness(businessId, 'project:status_changed', {
            projectId: project._id,
            oldStatus,
            newStatus: project.status
          });
        }
      }

      if (input.projectManagerId && Types.ObjectId.isValid(input.projectManagerId)) {
        project.projectManagerId = new Types.ObjectId(input.projectManagerId);
        const u = await User.findById(project.projectManagerId).lean();
        if (u) project.projectManagerName = u.name || u.email;
      }

      await project.save();
      return project;
    }

    const proj = memProjects.get(projectId);
    if (!proj) throw new Error('Project not found.');
    Object.assign(proj, input);
    if (input.status) proj.status = input.status.toUpperCase();
    proj.updatedAt = new Date();
    return proj;
  }

  static async deleteProject(businessId: string, projectId: string) {
    if (isDbConnected()) {
      const project = await Project.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(projectId)
      });
      if (!project) throw new Error('Project not found.');

      // Safeguard: Check if project has active non-completed tasks
      const activeTasksCount = await Task.countDocuments({
        businessId: new Types.ObjectId(businessId),
        projectId: project._id,
        status: { $in: ['TODO', 'IN_PROGRESS', 'REVIEW'] }
      });

      if (activeTasksCount > 0) {
        throw new Error(
          `Cannot delete project "${project.name}". It contains ${activeTasksCount} active tasks. Complete or cancel tasks first.`
        );
      }

      await Promise.all([
        Project.deleteOne({ _id: project._id }),
        Task.deleteMany({ projectId: project._id }),
        ProjectMilestone.deleteMany({ projectId: project._id }),
        ProjectDocument.deleteMany({ projectId: project._id })
      ]);

      return { success: true, message: `Project "${project.name}" and associated records removed successfully.` };
    }

    const proj = memProjects.get(projectId);
    if (!proj) throw new Error('Project not found.');

    const activeTasks = Array.from(memTasks.values()).filter(
      (t) => t.projectId === projectId && ['TODO', 'IN_PROGRESS', 'REVIEW'].includes(t.status)
    );
    if (activeTasks.length > 0) {
      throw new Error(`Cannot delete project with active tasks (${activeTasks.length} active).`);
    }

    memProjects.delete(projectId);
    return { success: true, message: 'Project removed.' };
  }

  /**
   * ============================================================================
   * MODULE 2: TASK MANAGEMENT
   * ============================================================================
   */
  static async createTask(
    businessId: string,
    input: ITaskCreateInput,
    actorUser?: { userId?: string; name?: string; role?: string }
  ) {
    const deadline = new Date(input.deadline);
    const actorName = actorUser?.name || 'Task Creator';

    if (isDbConnected()) {
      const project = await Project.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(input.projectId)
      });
      if (!project) throw new Error('Target project not found.');

      const count = await Task.countDocuments({ businessId: new Types.ObjectId(businessId) });
      const year = deadline.getFullYear();
      const taskNumber = `TSK-${year}-${String(1001 + count).padStart(4, '0')}`;

      let assignedToName = '';
      let assignedToEmail = '';
      let assignedIdObj: Types.ObjectId | undefined;
      if (input.assignedToId && Types.ObjectId.isValid(input.assignedToId)) {
        assignedIdObj = new Types.ObjectId(input.assignedToId);
        const u = await User.findById(assignedIdObj).lean();
        if (u) {
          assignedToName = u.name || u.email;
          assignedToEmail = u.email;
        }
      }

      const initialHistory = [
        {
          action: 'TASK_CREATED',
          fromStatus: undefined,
          toStatus: input.status || 'TODO',
          performedBy: actorName,
          timestamp: new Date(),
          notes: `Task initialized in ${input.status || 'TODO'} status.`
        }
      ];

      const task = await Task.create({
        businessId: new Types.ObjectId(businessId),
        projectId: project._id,
        taskNumber,
        title: input.title.trim(),
        description: input.description || '',
        priority: input.priority || 'MEDIUM',
        deadline,
        status: input.status || 'TODO',
        assignedToId: assignedIdObj,
        assignedToName,
        assignedToEmail,
        createdById: actorUser?.userId && Types.ObjectId.isValid(actorUser.userId) ? new Types.ObjectId(actorUser.userId) : undefined,
        createdByName: actorName,
        estimatedHours: input.estimatedHours || 0,
        loggedHours: 0,
        attachments: (input.attachments || []).map((a) => ({
          name: a.name,
          url: a.url,
          fileType: a.fileType,
          fileSize: a.fileSize || 0,
          uploadedAt: new Date()
        })),
        commentsCount: 0,
        history: initialHistory
      });

      // Notification to assignee
      if (assignedIdObj && assignedIdObj.toString() !== actorUser?.userId) {
        await HRService.createNotification(
          businessId,
          assignedIdObj.toString(),
          'New Task Assigned',
          `You were assigned task "${task.title}" in project "${project.name}". Due: ${deadline.toLocaleDateString()}.`,
          'TASK_ASSIGNMENT',
          { taskId: task._id, projectId: project._id, taskNumber: task.taskNumber }
        );
        notifyUser(assignedIdObj.toString(), {
          recipientUserId: assignedIdObj.toString(),
          title: 'New Task Assigned',
          message: `You were assigned task "${task.title}".`,
          type: 'TASK_ASSIGNMENT',
          createdAt: new Date().toISOString()
        });
      }

      emitTaskEvent(project._id.toString(), 'created', {
        taskId: task._id,
        projectId: project._id,
        businessId,
        title: task.title,
        status: task.status
      });

      return task;
    }

    // In-memory fallback
    const newId = `tsk_${Date.now()}`;
    const taskNumber = `TSK-${deadline.getFullYear()}-${String(1001 + memTasks.size).padStart(4, '0')}`;
    const t = {
      _id: newId,
      businessId,
      projectId: input.projectId,
      taskNumber,
      title: input.title.trim(),
      description: input.description || '',
      priority: input.priority || 'MEDIUM',
      deadline,
      status: input.status || 'TODO',
      assignedToId: input.assignedToId,
      assignedToName: 'Assigned Engineer',
      assignedToEmail: 'engineer@nexuscorp.com',
      createdById: actorUser?.userId,
      createdByName: actorName,
      estimatedHours: input.estimatedHours || 0,
      loggedHours: 0,
      attachments: input.attachments || [],
      commentsCount: 0,
      history: [
        {
          action: 'TASK_CREATED',
          toStatus: input.status || 'TODO',
          performedBy: actorName,
          timestamp: new Date()
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memTasks.set(newId, t);

    // Notification in memory
    if (input.assignedToId) {
      HRService.createNotification(
        businessId,
        input.assignedToId,
        'New Task Assigned',
        `You were assigned task "${t.title}". Due: ${deadline.toLocaleDateString()}.`,
        'TASK_ASSIGNMENT',
        { taskId: newId, projectId: input.projectId, taskNumber }
      ).catch(() => {});
    }

    // Recalculate parent project progress in in-memory
    const p = memProjects.get(input.projectId);
    if (p) {
      const projTasks = Array.from(memTasks.values()).filter((item) => item.projectId === input.projectId);
      const completedCount = projTasks.filter((item) => item.status === 'COMPLETED').length;
      p.progress = projTasks.length > 0 ? Math.round((completedCount / projTasks.length) * 100) : 0;
    }

    return t;
  }

  static async listTasks(
    businessId: string,
    filters: { projectId?: string; status?: string; priority?: string; assignedToId?: string; search?: string; page?: number; limit?: number } = {}
  ) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.max(1, Math.min(100, filters.limit || 50));
    const skip = (page - 1) * limit;

    if (isDbConnected()) {
      const query: any = { businessId: new Types.ObjectId(businessId) };
      if (filters.projectId && Types.ObjectId.isValid(filters.projectId)) {
        query.projectId = new Types.ObjectId(filters.projectId);
      }
      if (filters.status) query.status = filters.status;
      if (filters.priority) query.priority = filters.priority;
      if (filters.assignedToId && Types.ObjectId.isValid(filters.assignedToId)) {
        query.assignedToId = new Types.ObjectId(filters.assignedToId);
      }
      if (filters.search) {
        const regex = new RegExp(filters.search.trim(), 'i');
        query.$or = [{ title: regex }, { taskNumber: regex }, { description: regex }];
      }

      const [tasks, total] = await Promise.all([
        Task.find(query)
          .populate('projectId', 'name projectCode')
          .sort({ deadline: 1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Task.countDocuments(query)
      ]);

      return { tasks, total, page, totalPages: Math.ceil(total / limit) };
    }

    let list = Array.from(memTasks.values()).filter((t) => t.businessId === businessId);
    if (filters.projectId) list = list.filter((t) => t.projectId === filters.projectId);
    if (filters.status) list = list.filter((t) => t.status === filters.status);
    if (filters.priority) list = list.filter((t) => t.priority === filters.priority);
    if (filters.search) {
      const s = filters.search.toLowerCase();
      list = list.filter((t) => t.title?.toLowerCase().includes(s) || t.taskNumber?.toLowerCase().includes(s));
    }

    return {
      tasks: list.slice(skip, skip + limit),
      total: list.length,
      page,
      totalPages: Math.ceil(list.length / limit)
    };
  }

  static async getTaskById(businessId: string, taskId: string) {
    if (isDbConnected()) {
      const task = await Task.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(taskId)
      })
        .populate('projectId', 'name projectCode status')
        .populate('assignedToId', 'firstName lastName email')
        .lean();

      if (!task) throw new Error('Task not found.');

      const comments = await TaskComment.find({
        businessId: new Types.ObjectId(businessId),
        taskId: task._id
      })
        .sort({ createdAt: 1 })
        .lean();

      return { ...task, comments };
    }

    const t = memTasks.get(taskId);
    if (!t) throw new Error('Task not found.');
    const comments = Array.from(memTaskComments.values()).filter((c) => c.taskId === taskId);
    return { ...t, comments };
  }

  /**
   * Status change with Kanban board real-time broadcast and project progress updates
   */
  static async updateTaskStatus(
    businessId: string,
    taskId: string,
    newStatus: TaskStatus,
    actorUser?: { userId?: string; name?: string; role?: string },
    statusNotes?: string
  ) {
    const actorName = actorUser?.name || 'Operator';

    if (isDbConnected()) {
      const task = await Task.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(taskId)
      });
      if (!task) throw new Error('Task not found.');

      const fromStatus = task.status;
      task.status = newStatus;
      if (newStatus === 'COMPLETED') {
        task.completedAt = new Date();
      }

      task.history.push({
        action: 'STATUS_UPDATED',
        fromStatus,
        toStatus: newStatus,
        performedBy: actorName,
        timestamp: new Date(),
        notes: statusNotes || `Status updated to ${newStatus}`
      });

      await task.save();

      // Recalculate Project progress
      const [totalTasks, completedTasks] = await Promise.all([
        Task.countDocuments({ businessId: task.businessId, projectId: task.projectId }),
        Task.countDocuments({ businessId: task.businessId, projectId: task.projectId, status: 'COMPLETED' })
      ]);

      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      await Project.updateOne({ _id: task.projectId }, { progress });

      // Real-time Kanban broadcast
      emitTaskEvent(task.projectId.toString(), 'status_changed', {
        taskId: task._id,
        projectId: task.projectId,
        businessId,
        fromStatus,
        toStatus: newStatus,
        taskTitle: task.title,
        updatedBy: actorName
      });

      return task;
    }

    const t = memTasks.get(taskId);
    if (!t) throw new Error('Task not found.');
    const fromStatus = t.status;
    t.status = newStatus;
    if (newStatus === 'COMPLETED') t.completedAt = new Date();
    t.history.push({
      action: 'STATUS_UPDATED',
      fromStatus,
      toStatus: newStatus,
      performedBy: actorName,
      timestamp: new Date()
    });
    t.updatedAt = new Date();

    // Recalculate parent project progress in in-memory
    const p = memProjects.get(t.projectId);
    if (p) {
      const projTasks = Array.from(memTasks.values()).filter((item) => item.projectId === t.projectId);
      const completedCount = projTasks.filter((item) => item.status === 'COMPLETED').length;
      p.progress = projTasks.length > 0 ? Math.round((completedCount / projTasks.length) * 100) : 0;
    }

    return t;
  }

  static async updateTask(
    businessId: string,
    taskId: string,
    input: ITaskUpdateInput,
    actorUser?: { userId?: string; name?: string; role?: string }
  ) {
    const actorName = actorUser?.name || 'Manager';

    if (isDbConnected()) {
      const task = await Task.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(taskId)
      });
      if (!task) throw new Error('Task not found.');

      if (input.title) task.title = input.title.trim();
      if (input.description !== undefined) task.description = input.description;
      if (input.priority) task.priority = input.priority;
      if (input.deadline) task.deadline = new Date(input.deadline);
      if (input.estimatedHours !== undefined) task.estimatedHours = input.estimatedHours;
      if (input.loggedHours !== undefined) task.loggedHours = input.loggedHours;

      if (input.assignedToId && Types.ObjectId.isValid(input.assignedToId)) {
        const newAssigneeId = new Types.ObjectId(input.assignedToId);
        if (!task.assignedToId || task.assignedToId.toString() !== newAssigneeId.toString()) {
          task.assignedToId = newAssigneeId;
          const u = await User.findById(newAssigneeId).lean();
          if (u) {
            task.assignedToName = u.name || u.email;
            task.assignedToEmail = u.email;
          }

          task.history.push({
            action: 'REASSIGNED',
            performedBy: actorName,
            timestamp: new Date(),
            notes: `Task reassigned to ${task.assignedToName}`
          });
        }
      }

      if (input.status && input.status !== task.status) {
        return this.updateTaskStatus(businessId, taskId, input.status, actorUser, input.statusNotes);
      }

      await task.save();
      return task;
    }

    const t = memTasks.get(taskId);
    if (!t) throw new Error('Task not found.');
    Object.assign(t, input);
    t.updatedAt = new Date();

    // Recalculate parent project progress in in-memory
    const p = memProjects.get(t.projectId);
    if (p) {
      const projTasks = Array.from(memTasks.values()).filter((item) => item.projectId === t.projectId);
      const completedCount = projTasks.filter((item) => item.status === 'COMPLETED').length;
      p.progress = projTasks.length > 0 ? Math.round((completedCount / projTasks.length) * 100) : 0;
    }

    return t;
  }

  static async deleteTask(businessId: string, taskId: string) {
    if (isDbConnected()) {
      const task = await Task.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(taskId)
      });
      if (!task) throw new Error('Task not found.');

      await Promise.all([
        Task.deleteOne({ _id: task._id }),
        TaskComment.deleteMany({ taskId: task._id }),
        ProjectDocument.deleteMany({ taskId: task._id })
      ]);

      return { success: true, message: `Task "${task.title}" deleted successfully.` };
    }

    const t = memTasks.get(taskId);
    if (!t) throw new Error('Task not found.');
    memTasks.delete(taskId);
    return { success: true, message: 'Task deleted.' };
  }

  /**
   * ============================================================================
   * MODULE 3: KANBAN BOARD
   * ============================================================================
   */
  static async getKanbanBoard(businessId: string, projectId: string): Promise<IKanbanBoardData> {
    if (isDbConnected()) {
      const project = await Project.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(projectId)
      }).lean();

      if (!project) throw new Error('Project not found.');

      const tasks = await Task.find({
        businessId: new Types.ObjectId(businessId),
        projectId: project._id
      })
        .populate('assignedToId', 'firstName lastName email')
        .sort({ deadline: 1 })
        .lean();

      const columns: IKanbanBoardData['columns'] = {
        TODO: [],
        IN_PROGRESS: [],
        REVIEW: [],
        COMPLETED: [],
        BLOCKED: []
      };

      for (const t of tasks) {
        const col = (t.status as TaskStatus) || 'TODO';
        if (columns[col]) {
          columns[col].push(t);
        } else {
          columns.TODO.push(t);
        }
      }

      return {
        projectId: project._id.toString(),
        projectName: project.name,
        columns,
        totalTasks: tasks.length
      };
    }

    const proj = memProjects.get(projectId);
    const tasks = Array.from(memTasks.values()).filter((t) => t.projectId === projectId);
    const columns: IKanbanBoardData['columns'] = {
      TODO: [],
      IN_PROGRESS: [],
      REVIEW: [],
      COMPLETED: [],
      BLOCKED: []
    };
    for (const t of tasks) {
      const col = (t.status as TaskStatus) || 'TODO';
      if (columns[col]) columns[col].push(t);
      else columns.TODO.push(t);
    }
    return {
      projectId,
      projectName: proj?.name || 'Project',
      columns,
      totalTasks: tasks.length
    };
  }

  /**
   * ============================================================================
   * MODULE 4: PROJECT TIMELINE & GANTT
   * ============================================================================
   */
  static async getProjectTimeline(businessId: string, projectId: string): Promise<IProjectTimelineData> {
    if (isDbConnected()) {
      const project = await Project.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(projectId)
      }).lean();

      if (!project) throw new Error('Project not found.');

      const [milestones, tasks, events] = await Promise.all([
        ProjectMilestone.find({ businessId: new Types.ObjectId(businessId), projectId: project._id })
          .sort({ dueDate: 1 })
          .lean(),
        Task.find({ businessId: new Types.ObjectId(businessId), projectId: project._id })
          .sort({ deadline: 1 })
          .lean(),
        BusinessEvent.find({ businessId: new Types.ObjectId(businessId), projectId: project._id })
          .sort({ startDate: 1 })
          .lean()
      ]);

      const now = new Date();
      const enrichedTasks = tasks.map((t) => ({
        ...t,
        isOverdue: t.status !== 'COMPLETED' && new Date(t.deadline) < now
      }));

      return {
        projectId: project._id.toString(),
        projectName: project.name,
        startDate: project.startDate.toISOString(),
        endDate: project.endDate?.toISOString(),
        progress: project.progress || 0,
        milestones,
        tasks: enrichedTasks,
        events
      };
    }

    const proj = memProjects.get(projectId);
    const milestones = Array.from(memMilestones.values()).filter((m) => m.projectId === projectId);
    const tasks = Array.from(memTasks.values()).filter((t) => t.projectId === projectId);
    const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
    const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : proj?.progress || 0;
    if (proj) proj.progress = progress;
    return {
      projectId,
      projectName: proj?.name || 'Project',
      startDate: new Date().toISOString(),
      progress,
      milestones,
      tasks,
      events: []
    };
  }

  static async createMilestone(businessId: string, input: IProjectMilestoneInput) {
    const dueDate = new Date(input.dueDate);
    if (isDbConnected()) {
      const milestone = await ProjectMilestone.create({
        businessId: new Types.ObjectId(businessId),
        projectId: new Types.ObjectId(input.projectId),
        title: input.title.trim(),
        description: input.description || '',
        dueDate,
        status: input.status || 'PENDING',
        order: input.order || 0
      });
      return milestone;
    }

    const newId = `mls_${Date.now()}`;
    const m = {
      _id: newId,
      businessId,
      projectId: input.projectId,
      title: input.title.trim(),
      description: input.description || '',
      dueDate,
      status: input.status || 'PENDING',
      order: input.order || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memMilestones.set(newId, m);
    return m;
  }

  static async updateMilestone(businessId: string, milestoneId: string, input: IProjectMilestoneUpdateInput) {
    if (isDbConnected()) {
      const milestone = await ProjectMilestone.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(milestoneId)
      });
      if (!milestone) throw new Error('Milestone not found.');

      if (input.title) milestone.title = input.title.trim();
      if (input.description !== undefined) milestone.description = input.description;
      if (input.dueDate) milestone.dueDate = new Date(input.dueDate);
      if (input.status) {
        milestone.status = input.status;
        if (input.status === 'ACHIEVED') milestone.achievedAt = new Date();
      }
      if (input.order !== undefined) milestone.order = input.order;

      await milestone.save();
      return milestone;
    }

    const m = memMilestones.get(milestoneId);
    if (!m) throw new Error('Milestone not found.');
    Object.assign(m, input);
    m.updatedAt = new Date();
    return m;
  }

  static async deleteMilestone(businessId: string, milestoneId: string) {
    if (isDbConnected()) {
      await ProjectMilestone.deleteOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(milestoneId)
      });
      return { success: true, message: 'Milestone deleted.' };
    }
    memMilestones.delete(milestoneId);
    return { success: true, message: 'Milestone deleted.' };
  }

  /**
   * ============================================================================
   * MODULE 5: TEAM COLLABORATION & COMMENTS
   * ============================================================================
   */
  static async addTaskComment(
    businessId: string,
    taskId: string,
    input: ITaskCommentInput,
    actorUser: { userId: string; name: string; role?: string }
  ) {
    if (!input.content || input.content.trim().length === 0) {
      throw new Error('Comment content cannot be empty.');
    }

    if (isDbConnected()) {
      const task = await Task.findOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(taskId)
      });
      if (!task) throw new Error('Target task not found.');

      const comment = await TaskComment.create({
        businessId: new Types.ObjectId(businessId),
        projectId: task.projectId,
        taskId: task._id,
        authorId: new Types.ObjectId(actorUser.userId),
        authorName: actorUser.name,
        authorRole: actorUser.role || 'EMPLOYEE',
        content: input.content.trim(),
        mentions: input.mentions || [],
        attachments: input.attachments || []
      });

      // Increment comments count
      await Task.updateOne({ _id: task._id }, { $inc: { commentsCount: 1 } });

      // Notify task assignee if different from commenter
      if (task.assignedToId && task.assignedToId.toString() !== actorUser.userId) {
        await Notification.create({
          businessId: new Types.ObjectId(businessId),
          recipientUserId: task.assignedToId,
          title: 'New Comment on Task',
          message: `${actorUser.name} commented on "${task.title}": "${input.content.slice(0, 80)}"`,
          type: 'NEW_COMMENT',
          metadata: { taskId: task._id, projectId: task.projectId }
        });
        notifyUser(task.assignedToId.toString(), {
          recipientUserId: task.assignedToId.toString(),
          title: 'New Comment on Task',
          message: `${actorUser.name} commented on "${task.title}".`,
          type: 'NEW_COMMENT',
          createdAt: new Date().toISOString()
        });
      }

      emitTaskEvent(task.projectId.toString(), 'comment_added', {
        taskId: task._id,
        commentId: comment._id,
        author: actorUser.name,
        content: comment.content
      });

      return comment;
    }

    const t = memTasks.get(taskId);
    if (!t) throw new Error('Task not found.');
    const newId = `cmt_${Date.now()}`;
    const comment = {
      _id: newId,
      businessId,
      projectId: t.projectId,
      taskId,
      authorId: actorUser.userId,
      authorName: actorUser.name,
      authorRole: actorUser.role || 'EMPLOYEE',
      content: input.content.trim(),
      mentions: input.mentions || [],
      attachments: input.attachments || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memTaskComments.set(newId, comment);
    t.commentsCount = (t.commentsCount || 0) + 1;
    return comment;
  }

  static async listTaskComments(businessId: string, taskId: string) {
    if (isDbConnected()) {
      return TaskComment.find({
        businessId: new Types.ObjectId(businessId),
        taskId: new Types.ObjectId(taskId)
      })
        .sort({ createdAt: 1 })
        .lean();
    }
    return Array.from(memTaskComments.values()).filter((c) => c.taskId === taskId);
  }

  /**
   * ============================================================================
   * MODULE 6: DOCUMENT MANAGEMENT
   * ============================================================================
   */
  static async uploadDocument(
    businessId: string,
    input: IProjectDocumentInput,
    actorUser?: { userId?: string; name?: string }
  ) {
    if (input.fileSize > 10485760) {
      throw new Error('File size exceeds the 10MB maximum policy limit.');
    }

    if (isDbConnected()) {
      const doc = await ProjectDocument.create({
        businessId: new Types.ObjectId(businessId),
        projectId: input.projectId && Types.ObjectId.isValid(input.projectId) ? new Types.ObjectId(input.projectId) : undefined,
        taskId: input.taskId && Types.ObjectId.isValid(input.taskId) ? new Types.ObjectId(input.taskId) : undefined,
        title: input.title.trim(),
        fileName: input.fileName.trim(),
        fileUrl: input.fileUrl.trim(),
        fileType: input.fileType.toLowerCase().trim(),
        fileSize: input.fileSize,
        category: input.category || 'OTHER',
        uploadedById: actorUser?.userId && Types.ObjectId.isValid(actorUser.userId) ? new Types.ObjectId(actorUser.userId) : undefined,
        uploadedByName: actorUser?.name || 'Authorized Member',
        isPublic: input.isPublic || false
      });
      return doc;
    }

    const newId = `doc_${Date.now()}`;
    const doc = {
      _id: newId,
      businessId,
      ...input,
      uploadedById: actorUser?.userId,
      uploadedByName: actorUser?.name || 'Member',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memDocuments.set(newId, doc);
    return doc;
  }

  static async listDocuments(
    businessId: string,
    filters: { projectId?: string; taskId?: string; category?: string; search?: string; page?: number; limit?: number } = {}
  ) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.max(1, Math.min(100, filters.limit || 50));
    const skip = (page - 1) * limit;

    if (isDbConnected()) {
      const query: any = { businessId: new Types.ObjectId(businessId) };
      if (filters.projectId && Types.ObjectId.isValid(filters.projectId)) {
        query.projectId = new Types.ObjectId(filters.projectId);
      }
      if (filters.taskId && Types.ObjectId.isValid(filters.taskId)) {
        query.taskId = new Types.ObjectId(filters.taskId);
      }
      if (filters.category) query.category = filters.category;
      if (filters.search) {
        const regex = new RegExp(filters.search.trim(), 'i');
        query.$or = [{ title: regex }, { fileName: regex }];
      }

      const [documents, total] = await Promise.all([
        ProjectDocument.find(query)
          .populate('projectId', 'name projectCode')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        ProjectDocument.countDocuments(query)
      ]);

      return { documents, total, page, totalPages: Math.ceil(total / limit) };
    }

    let list = Array.from(memDocuments.values()).filter((d) => d.businessId === businessId);
    if (filters.projectId) list = list.filter((d) => d.projectId === filters.projectId);
    if (filters.category) list = list.filter((d) => d.category === filters.category);
    if (filters.search) {
      const s = filters.search.toLowerCase();
      list = list.filter((d) => d.title?.toLowerCase().includes(s) || d.fileName?.toLowerCase().includes(s));
    }

    return {
      documents: list.slice(skip, skip + limit),
      total: list.length,
      page,
      totalPages: Math.ceil(list.length / limit)
    };
  }

  static async deleteDocument(businessId: string, documentId: string) {
    if (isDbConnected()) {
      await ProjectDocument.deleteOne({
        businessId: new Types.ObjectId(businessId),
        _id: new Types.ObjectId(documentId)
      });
      return { success: true, message: 'Document removed successfully.' };
    }
    memDocuments.delete(documentId);
    return { success: true, message: 'Document removed.' };
  }

  /**
   * ============================================================================
   * MODULE 8: CENTRALIZED CALENDAR & BUSINESS EVENTS
   * ============================================================================
   */
  static async createBusinessEvent(
    businessId: string,
    input: IBusinessEventInput,
    actorUser?: { userId?: string; name?: string }
  ) {
    const startDate = new Date(input.startDate);
    const endDate = new Date(input.endDate);

    if (endDate < startDate) {
      throw new Error('Event end date cannot be earlier than start date.');
    }

    if (isDbConnected()) {
      const event = await BusinessEvent.create({
        businessId: new Types.ObjectId(businessId),
        title: input.title.trim(),
        description: input.description || '',
        eventType: input.eventType || 'MEETING',
        startDate,
        endDate,
        allDay: input.allDay || false,
        location: input.location || '',
        meetingUrl: input.meetingUrl || '',
        attendees: input.attendees || [],
        projectId: input.projectId && Types.ObjectId.isValid(input.projectId) ? new Types.ObjectId(input.projectId) : undefined,
        taskId: input.taskId && Types.ObjectId.isValid(input.taskId) ? new Types.ObjectId(input.taskId) : undefined,
        color: input.color || '#3b82f6',
        createdById: actorUser?.userId && Types.ObjectId.isValid(actorUser.userId) ? new Types.ObjectId(actorUser.userId) : undefined
      });
      return event;
    }

    const newId = `evt_${Date.now()}`;
    const ev = {
      _id: newId,
      businessId,
      ...input,
      startDate,
      endDate,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memEvents.set(newId, ev);
    return ev;
  }

  static async listBusinessEvents(
    businessId: string,
    filters: { startDate?: string; endDate?: string; eventType?: string } = {}
  ) {
    const sDate = filters.startDate ? new Date(filters.startDate) : new Date(Date.now() - 30 * 86400000);
    const eDate = filters.endDate ? new Date(filters.endDate) : new Date(Date.now() + 60 * 86400000);

    if (isDbConnected()) {
      const query: any = {
        businessId: new Types.ObjectId(businessId),
        startDate: { $lte: eDate },
        endDate: { $gte: sDate }
      };
      if (filters.eventType) query.eventType = filters.eventType;

      return BusinessEvent.find(query).sort({ startDate: 1 }).lean();
    }

    return Array.from(memEvents.values()).filter((e) => e.businessId === businessId);
  }

  /**
   * Unified Aggregated Calendar: Combines business events, project deadlines, and task deadlines
   */
  static async getAggregatedCalendar(
    businessId: string,
    filters: { startDate?: string; endDate?: string } = {}
  ) {
    const sDate = filters.startDate ? new Date(filters.startDate) : new Date(Date.now() - 30 * 86400000);
    const eDate = filters.endDate ? new Date(filters.endDate) : new Date(Date.now() + 60 * 86400000);

    if (isDbConnected()) {
      const [events, projects, tasks, milestones] = await Promise.all([
        BusinessEvent.find({
          businessId: new Types.ObjectId(businessId),
          startDate: { $lte: eDate },
          endDate: { $gte: sDate }
        }).lean(),
        Project.find({
          businessId: new Types.ObjectId(businessId),
          status: { $in: ['PLANNING', 'ACTIVE', 'ON_HOLD'] }
        }).lean(),
        Task.find({
          businessId: new Types.ObjectId(businessId),
          deadline: { $gte: sDate, $lte: eDate }
        }).lean(),
        ProjectMilestone.find({
          businessId: new Types.ObjectId(businessId),
          dueDate: { $gte: sDate, $lte: eDate }
        }).lean()
      ]);

      const calendarEntries: Array<{
        id: string;
        title: string;
        type: string;
        startDate: Date;
        endDate?: Date;
        status?: string;
        priority?: string;
        color: string;
        referenceId?: string;
      }> = [];

      // 1. Business Events
      for (const ev of events) {
        calendarEntries.push({
          id: ev._id.toString(),
          title: ev.title,
          type: ev.eventType,
          startDate: ev.startDate,
          endDate: ev.endDate,
          color: ev.color || '#3b82f6',
          referenceId: ev._id.toString()
        });
      }

      // 2. Project Deadlines
      for (const p of projects) {
        if (p.endDate && p.endDate >= sDate && p.endDate <= eDate) {
          calendarEntries.push({
            id: `prj_${p._id}`,
            title: `[Project Deadline] ${p.name}`,
            type: 'PROJECT_DEADLINE',
            startDate: p.endDate,
            status: String(p.status),
            priority: p.priority,
            color: '#8b5cf6',
            referenceId: p._id.toString()
          });
        }
      }

      // 3. Task Deadlines
      for (const t of tasks) {
        calendarEntries.push({
          id: `tsk_${t._id}`,
          title: `[Task] ${t.title}`,
          type: 'TASK_DEADLINE',
          startDate: t.deadline,
          status: t.status,
          priority: t.priority,
          color: t.status === 'COMPLETED' ? '#10b981' : new Date(t.deadline) < new Date() ? '#ef4444' : '#f59e0b',
          referenceId: t._id.toString()
        });
      }

      // 4. Milestones
      for (const m of milestones) {
        calendarEntries.push({
          id: `mls_${m._id}`,
          title: `[Milestone] ${m.title}`,
          type: 'MILESTONE',
          startDate: m.dueDate,
          status: m.status,
          color: '#06b6d4',
          referenceId: m._id.toString()
        });
      }

      return calendarEntries;
    }

    // In-memory fallback calendar
    const entries: any[] = [];
    Array.from(memEvents.values()).forEach((e) => {
      entries.push({
        id: e._id,
        title: e.title,
        type: e.eventType || 'MEETING',
        startDate: e.startDate,
        endDate: e.endDate,
        color: '#3b82f6'
      });
    });
    Array.from(memTasks.values()).forEach((t) => {
      entries.push({
        id: t._id,
        title: `[Task] ${t.title}`,
        type: 'TASK_DEADLINE',
        startDate: t.deadline,
        status: t.status,
        color: t.status === 'COMPLETED' ? '#10b981' : '#f59e0b'
      });
    });
    return entries;
  }
}

export default ProjectService;
