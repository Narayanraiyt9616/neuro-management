import apiClient from './api';
import {
  IProjectItem,
  ITaskItem,
  ITaskCommentItem,
  IProjectMilestoneItem,
  IProjectDocumentItem,
  IBusinessEventItem,
  IKanbanBoardData,
  IProjectTimelineData,
  IAggregatedCalendarItem,
  TaskStatusType
} from '../types';

export interface IProjectFilters {
  businessId?: string;
  search?: string;
  status?: string;
  priority?: string;
  page?: number;
  limit?: number;
}

export interface ITaskFilters {
  businessId?: string;
  projectId?: string;
  status?: string;
  priority?: string;
  assignedToId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface IDocumentFilters {
  businessId?: string;
  projectId?: string;
  taskId?: string;
  category?: string;
  search?: string;
}

export interface ICalendarFilters {
  businessId?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Project, Task, Kanban, Collaboration, Document & Calendar API Service
 */
export const projectService = {
  // Projects
  async getProjects(filters: IProjectFilters = {}): Promise<{ success: boolean; data: IProjectItem[]; count: number }> {
    const res = await apiClient.get('/projects', { params: filters });
    return res as unknown as { success: boolean; data: IProjectItem[]; count: number };
  },

  async getProjectById(id: string): Promise<{ success: boolean; data: IProjectItem }> {
    const res = await apiClient.get(`/projects/${id}`);
    return res as unknown as { success: boolean; data: IProjectItem };
  },

  async createProject(data: Partial<IProjectItem>): Promise<{ success: boolean; data: IProjectItem; message?: string }> {
    const res = await apiClient.post('/projects', data);
    return res as unknown as { success: boolean; data: IProjectItem; message?: string };
  },

  async updateProject(id: string, data: Partial<IProjectItem>): Promise<{ success: boolean; data: IProjectItem; message?: string }> {
    const res = await apiClient.put(`/projects/${id}`, data);
    return res as unknown as { success: boolean; data: IProjectItem; message?: string };
  },

  async deleteProject(id: string): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.delete(`/projects/${id}`);
    return res as unknown as { success: boolean; message: string };
  },

  async getKanbanBoard(projectId: string): Promise<{ success: boolean; data: IKanbanBoardData }> {
    const res = await apiClient.get(`/projects/${projectId}/kanban`);
    return res as unknown as { success: boolean; data: IKanbanBoardData };
  },

  async getProjectTimeline(projectId: string): Promise<{ success: boolean; data: IProjectTimelineData }> {
    const res = await apiClient.get(`/projects/${projectId}/timeline`);
    return res as unknown as { success: boolean; data: IProjectTimelineData };
  },

  // Tasks
  async getTasks(filters: ITaskFilters = {}): Promise<{ success: boolean; data: ITaskItem[]; count: number }> {
    const res = await apiClient.get('/projects/tasks', { params: filters });
    return res as unknown as { success: boolean; data: ITaskItem[]; count: number };
  },

  async getTaskById(id: string): Promise<{ success: boolean; data: ITaskItem }> {
    const res = await apiClient.get(`/projects/tasks/${id}`);
    return res as unknown as { success: boolean; data: ITaskItem };
  },

  async createTask(data: Partial<ITaskItem>): Promise<{ success: boolean; data: ITaskItem; message?: string }> {
    const res = await apiClient.post('/projects/tasks', data);
    return res as unknown as { success: boolean; data: ITaskItem; message?: string };
  },

  async updateTask(id: string, data: Partial<ITaskItem>): Promise<{ success: boolean; data: ITaskItem; message?: string }> {
    const res = await apiClient.put(`/projects/tasks/${id}`, data);
    return res as unknown as { success: boolean; data: ITaskItem; message?: string };
  },

  async updateTaskStatus(
    id: string,
    status: TaskStatusType,
    notes?: string,
    loggedHours?: number
  ): Promise<{ success: boolean; data: ITaskItem; message?: string }> {
    const res = await apiClient.patch(`/projects/tasks/${id}/status`, { status, notes, loggedHours });
    return res as unknown as { success: boolean; data: ITaskItem; message?: string };
  },

  async deleteTask(id: string): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.delete(`/projects/tasks/${id}`);
    return res as unknown as { success: boolean; message: string };
  },

  // Task Comments & Collaboration
  async getTaskComments(taskId: string): Promise<{ success: boolean; data: ITaskCommentItem[] }> {
    const res = await apiClient.get(`/projects/tasks/${taskId}/comments`);
    return res as unknown as { success: boolean; data: ITaskCommentItem[] };
  },

  async addTaskComment(
    taskId: string,
    data: { content: string; mentions?: string[]; attachments?: any[] }
  ): Promise<{ success: boolean; data: ITaskCommentItem; message?: string }> {
    const res = await apiClient.post(`/projects/tasks/${taskId}/comments`, data);
    return res as unknown as { success: boolean; data: ITaskCommentItem; message?: string };
  },

  // Document Management
  async getDocuments(filters: IDocumentFilters = {}): Promise<{ success: boolean; data: IProjectDocumentItem[]; count: number }> {
    const res = await apiClient.get('/projects/documents', { params: filters });
    return res as unknown as { success: boolean; data: IProjectDocumentItem[]; count: number };
  },

  async uploadDocument(data: {
    projectId?: string;
    taskId?: string;
    title: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    category?: string;
    isPublic?: boolean;
  }): Promise<{ success: boolean; data: IProjectDocumentItem; message?: string }> {
    const res = await apiClient.post('/projects/documents', data);
    return res as unknown as { success: boolean; data: IProjectDocumentItem; message?: string };
  },

  async deleteDocument(id: string): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.delete(`/projects/documents/${id}`);
    return res as unknown as { success: boolean; message: string };
  },

  // Milestones
  async createMilestone(data: Partial<IProjectMilestoneItem>): Promise<{ success: boolean; data: IProjectMilestoneItem; message?: string }> {
    const res = await apiClient.post('/projects/milestones', data);
    return res as unknown as { success: boolean; data: IProjectMilestoneItem; message?: string };
  },

  async updateMilestone(id: string, data: Partial<IProjectMilestoneItem>): Promise<{ success: boolean; data: IProjectMilestoneItem; message?: string }> {
    const res = await apiClient.put(`/projects/milestones/${id}`, data);
    return res as unknown as { success: boolean; data: IProjectMilestoneItem; message?: string };
  },

  async deleteMilestone(id: string): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.delete(`/projects/milestones/${id}`);
    return res as unknown as { success: boolean; message: string };
  },

  // Calendar & Events
  async getAggregatedCalendar(filters: ICalendarFilters = {}): Promise<{ success: boolean; data: IAggregatedCalendarItem[] }> {
    const res = await apiClient.get('/projects/calendar/feed', { params: filters });
    return res as unknown as { success: boolean; data: IAggregatedCalendarItem[] };
  },

  async getBusinessEvents(filters: ICalendarFilters = {}): Promise<{ success: boolean; data: IBusinessEventItem[] }> {
    const res = await apiClient.get('/projects/calendar/events', { params: filters });
    return res as unknown as { success: boolean; data: IBusinessEventItem[] };
  },

  async createBusinessEvent(data: Partial<IBusinessEventItem>): Promise<{ success: boolean; data: IBusinessEventItem; message?: string }> {
    const res = await apiClient.post('/projects/calendar/events', data);
    return res as unknown as { success: boolean; data: IBusinessEventItem; message?: string };
  }
};

export default projectService;

