import React, { useState, useEffect, useCallback } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { useAuth } from '../../context/AuthContext';
import projectService from '../../services/projectService';
import socketService from '../../services/socketService';
import {
  IProjectItem,
  ITaskItem,
  ITaskCommentItem,
  IProjectDocumentItem,
  IProjectTimelineData,
  IAggregatedCalendarItem,
  ProjectStatusType,
  ProjectPriorityType,
  TaskStatusType,
  TaskPriorityType,
  DocumentCategoryType,
  BusinessEventTypeType
} from '../../types';
import {
  FolderKanban,
  Plus,
  Search,
  Calendar,
  Clock,
  AlertCircle,
  X,
  Edit2,
  Trash2,
  MessageSquare,
  Send,
  Users,
  User,
  FileText,
  Download,
  Flag,
  DollarSign,
  Layers,
  RefreshCw,
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const ProjectsManagementPage: React.FC = () => {
  const { activeBusiness } = useBusiness();
  const { user } = useAuth();
  const businessId = activeBusiness?._id || '';

  // Tab State
  type TabType = 'projects' | 'kanban' | 'timeline' | 'documents' | 'calendar';
  const [activeTab, setActiveTab] = useState<TabType>('projects');

  // Core Data States
  const [projects, setProjects] = useState<IProjectItem[]>([]);
  const [tasks, setTasks] = useState<ITaskItem[]>([]);
  const [documents, setDocuments] = useState<IProjectDocumentItem[]>([]);
  const [calendarItems, setCalendarItems] = useState<IAggregatedCalendarItem[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [timelineData, setTimelineData] = useState<IProjectTimelineData | null>(null);

  // Loading & Filter States
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [notificationBanner, setNotificationBanner] = useState<string | null>(null);

  // Modals & Drawers
  const [showProjectModal, setShowProjectModal] = useState<boolean>(false);
  const [editingProject, setEditingProject] = useState<IProjectItem | null>(null);

  const [showTaskModal, setShowTaskModal] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<ITaskItem | null>(null);

  const [showTaskDrawer, setShowTaskDrawer] = useState<boolean>(false);
  const [activeTask, setActiveTask] = useState<ITaskItem | null>(null);
  const [taskComments, setTaskComments] = useState<ITaskCommentItem[]>([]);
  const [commentInput, setCommentInput] = useState<string>('');
  const [mentionInput, setMentionInput] = useState<string>('');
  const [commentLoading, setCommentLoading] = useState<boolean>(false);

  const [showMilestoneModal, setShowMilestoneModal] = useState<boolean>(false);
  const [showDocUploadModal, setShowDocUploadModal] = useState<boolean>(false);
  const [showEventModal, setShowEventModal] = useState<boolean>(false);

  // Form States - Project
  const [projectName, setProjectName] = useState<string>('');
  const [projectDescription, setProjectDescription] = useState<string>('');
  const [projectManagerId, setProjectManagerId] = useState<string>('');
  const [projectStartDate, setProjectStartDate] = useState<string>('');
  const [projectEndDate, setProjectEndDate] = useState<string>('');
  const [projectBudget, setProjectBudget] = useState<string>('');
  const [projectPriority, setProjectPriority] = useState<ProjectPriorityType>('MEDIUM');
  const [projectStatus, setProjectStatus] = useState<ProjectStatusType>('PLANNING');
  const [projectClient, setProjectClient] = useState<string>('');
  const [projectTags, setProjectTags] = useState<string>('');

  // Form States - Task
  const [taskTitle, setTaskTitle] = useState<string>('');
  const [taskDescription, setTaskDescription] = useState<string>('');
  const [taskProjectId, setTaskProjectId] = useState<string>('');
  const [taskPriority, setTaskPriority] = useState<TaskPriorityType>('MEDIUM');
  const [taskDeadline, setTaskDeadline] = useState<string>('');
  const [taskAssignedToId, setTaskAssignedToId] = useState<string>('');
  const [taskEstimatedHours, setTaskEstimatedHours] = useState<string>('');

  // Form States - Milestone
  const [milestoneTitle, setMilestoneTitle] = useState<string>('');
  const [milestoneDesc, setMilestoneDesc] = useState<string>('');
  const [milestoneDueDate, setMilestoneDueDate] = useState<string>('');
  const [milestoneProjectId, setMilestoneProjectId] = useState<string>('');

  // Form States - Document Upload
  const [docTitle, setDocTitle] = useState<string>('');
  const [docCategory, setDocCategory] = useState<DocumentCategoryType>('REQUIREMENTS');
  const [docProjectId, setDocProjectId] = useState<string>('');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docError, setDocError] = useState<string | null>(null);

  // Form States - Calendar Event
  const [eventTitle, setEventTitle] = useState<string>('');
  const [eventDescription, setEventDescription] = useState<string>('');
  const [eventType, setEventType] = useState<BusinessEventTypeType>('MEETING');
  const [eventStartDate, setEventStartDate] = useState<string>('');
  const [eventEndDate, setEventEndDate] = useState<string>('');
  const [eventLocation, setEventLocation] = useState<string>('');
  const [eventAllDay, setEventAllDay] = useState<boolean>(false);
  const [eventProjectId, setEventProjectId] = useState<string>('');

  // Calendar View State
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month');
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());

  // Drag and Drop Kanban State
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  // --------------------------------------------------------------------------
  // Data Fetching
  // --------------------------------------------------------------------------
  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      const res = await projectService.getProjects({
        businessId: businessId || undefined,
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined
      });
      if (res.success) {
        setProjects(res.data);
        if (!selectedProjectId && res.data.length > 0) {
          setSelectedProjectId(res.data[0].id || res.data[0]._id || '');
        }
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  }, [businessId, searchTerm, statusFilter, priorityFilter, selectedProjectId]);

  const loadTasks = useCallback(async () => {
    try {
      const res = await projectService.getTasks({
        businessId: businessId || undefined,
        projectId: selectedProjectId || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        search: searchTerm || undefined
      });
      if (res.success) {
        setTasks(res.data);
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
    }
  }, [businessId, selectedProjectId, statusFilter, priorityFilter, searchTerm]);

  const loadDocuments = useCallback(async () => {
    try {
      const res = await projectService.getDocuments({
        businessId: businessId || undefined,
        projectId: selectedProjectId || undefined,
        search: searchTerm || undefined
      });
      if (res.success) {
        setDocuments(res.data);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    }
  }, [businessId, selectedProjectId, searchTerm]);

  const loadCalendar = useCallback(async () => {
    try {
      const res = await projectService.getAggregatedCalendar({
        businessId: businessId || undefined
      });
      if (res.success) {
        setCalendarItems(res.data);
      }
    } catch (err) {
      console.error('Failed to load calendar feed:', err);
    }
  }, [businessId]);

  const loadTimeline = useCallback(async () => {
    if (!selectedProjectId) return;
    try {
      const res = await projectService.getProjectTimeline(selectedProjectId);
      if (res.success) {
        setTimelineData(res.data);
      }
    } catch (err) {
      console.error('Failed to load timeline:', err);
    }
  }, [selectedProjectId]);

  // Initial & Tab-specific loading
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    if (activeTab === 'kanban' || activeTab === 'projects') {
      loadTasks();
    } else if (activeTab === 'timeline') {
      loadTimeline();
    } else if (activeTab === 'documents') {
      loadDocuments();
    } else if (activeTab === 'calendar') {
      loadCalendar();
    }
  }, [activeTab, loadTasks, loadTimeline, loadDocuments, loadCalendar]);

  // --------------------------------------------------------------------------
  // Socket.io Real-Time Collaboration Setup
  // --------------------------------------------------------------------------
  useEffect(() => {
    socketService.connect();

    if (businessId) {
      socketService.joinBusiness(businessId);
    }
    if (user?.id) {
      socketService.joinUser(user.id);
    }
    if (selectedProjectId) {
      socketService.joinProject(selectedProjectId);
    }

    const unbindNotification = socketService.on('notification:new', (payload: any) => {
      setNotificationBanner(`🔔 ${payload.title}: ${payload.message}`);
      setTimeout(() => setNotificationBanner(null), 6000);
    });

    const unbindTaskStatus = socketService.on('task:status_changed', (payload: any) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === payload.taskId ? { ...t, status: payload.toStatus } : t))
      );
      setNotificationBanner(`⚡ Task "${payload.taskTitle}" moved to ${payload.toStatus} by ${payload.updatedBy}`);
      setTimeout(() => setNotificationBanner(null), 5000);
      loadProjects(); // Auto refresh progress
    });

    const unbindTaskCreated = socketService.on('task:created', () => {
      loadTasks();
      loadProjects();
    });

    const unbindCommentAdded = socketService.on('task:comment_added', (payload: any) => {
      if (activeTask && activeTask.id === payload.taskId) {
        loadTaskComments(activeTask.id);
      }
    });

    return () => {
      unbindNotification();
      unbindTaskStatus();
      unbindTaskCreated();
      unbindCommentAdded();
      if (selectedProjectId) {
        socketService.leaveProject(selectedProjectId);
      }
    };
  }, [businessId, user?.id, selectedProjectId, activeTask, loadProjects, loadTasks]);

  // --------------------------------------------------------------------------
  // Task Comments & Details Drawer
  // --------------------------------------------------------------------------
  const loadTaskComments = async (taskId: string) => {
    try {
      const res = await projectService.getTaskComments(taskId);
      if (res.success) {
        setTaskComments(res.data);
      }
    } catch (err) {
      console.error('Failed to load task comments:', err);
    }
  };

  const openTaskDrawer = (task: ITaskItem) => {
    setActiveTask(task);
    setShowTaskDrawer(true);
    loadTaskComments(task.id);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTask || !commentInput.trim()) return;

    try {
      setCommentLoading(true);
      const mentions = mentionInput
        .split(',')
        .map((m) => m.trim().replace(/^@/, ''))
        .filter(Boolean);

      const res = await projectService.addTaskComment(activeTask.id, {
        content: commentInput.trim(),
        mentions
      });

      if (res.success) {
        setTaskComments((prev) => [...prev, res.data]);
        setCommentInput('');
        setMentionInput('');
        setActiveTask((prev) => (prev ? { ...prev, commentsCount: (prev.commentsCount || 0) + 1 } : null));
      }
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setCommentLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // Kanban Drag and Drop
  // --------------------------------------------------------------------------
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: TaskStatusType) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    setDraggedTaskId(null);

    if (!taskId) return;

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: targetStatus } : t))
    );

    try {
      await projectService.updateTaskStatus(taskId, targetStatus, `Moved on Kanban to ${targetStatus}`);
      loadProjects(); // Recalculate project progress
    } catch (err) {
      console.error('Failed to update task status via Kanban:', err);
      loadTasks(); // Rollback on error
    }
  };

  // --------------------------------------------------------------------------
  // Project CRUD Handlers
  // --------------------------------------------------------------------------
  const handleOpenCreateProject = () => {
    setEditingProject(null);
    setProjectName('');
    setProjectDescription('');
    setProjectManagerId('');
    setProjectStartDate('');
    setProjectEndDate('');
    setProjectBudget('');
    setProjectPriority('MEDIUM');
    setProjectStatus('PLANNING');
    setProjectClient('');
    setProjectTags('');
    setShowProjectModal(true);
  };

  const handleOpenEditProject = (proj: IProjectItem) => {
    setEditingProject(proj);
    setProjectName(proj.name);
    setProjectDescription(proj.description || '');
    setProjectManagerId(proj.projectManagerId || '');
    setProjectStartDate(proj.startDate ? proj.startDate.substring(0, 10) : '');
    setProjectEndDate(proj.endDate ? proj.endDate.substring(0, 10) : '');
    setProjectBudget(proj.budget ? String(proj.budget) : '');
    setProjectPriority(proj.priority || 'MEDIUM');
    setProjectStatus(proj.status || 'PLANNING');
    setProjectClient(proj.client || '');
    setProjectTags((proj.tags || []).join(', '));
    setShowProjectModal(true);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    const payload: Partial<IProjectItem> = {
      name: projectName.trim(),
      description: projectDescription.trim(),
      projectManagerId: projectManagerId || undefined,
      startDate: projectStartDate || undefined,
      endDate: projectEndDate || undefined,
      budget: projectBudget ? parseFloat(projectBudget) : undefined,
      priority: projectPriority,
      status: projectStatus,
      client: projectClient.trim() || undefined,
      tags: projectTags ? projectTags.split(',').map((t) => t.trim()).filter(Boolean) : []
    };

    try {
      if (editingProject) {
        await projectService.updateProject(editingProject.id || editingProject._id!, payload);
      } else {
        await projectService.createProject(payload);
      }
      setShowProjectModal(false);
      loadProjects();
    } catch (err: any) {
      alert(err.message || 'Error saving project');
    }
  };

  const handleDeleteProject = async (proj: IProjectItem) => {
    if (!window.confirm(`Are you sure you want to delete project "${proj.name}"?`)) return;
    try {
      await projectService.deleteProject(proj.id || proj._id!);
      loadProjects();
    } catch (err: any) {
      alert(err.message || 'Could not delete project. Active tasks may still exist.');
    }
  };

  // --------------------------------------------------------------------------
  // Task CRUD Handlers
  // --------------------------------------------------------------------------
  const handleOpenCreateTask = () => {
    setEditingTask(null);
    setTaskTitle('');
    setTaskDescription('');
    setTaskProjectId(selectedProjectId || (projects[0]?.id || projects[0]?._id || ''));
    setTaskPriority('MEDIUM');
    setTaskDeadline(new Date(Date.now() + 7 * 86400000).toISOString().substring(0, 10));
    setTaskAssignedToId('');
    setTaskEstimatedHours('8');
    setShowTaskModal(true);
  };

  const handleOpenEditTask = (t: ITaskItem) => {
    setEditingTask(t);
    setTaskTitle(t.title);
    setTaskDescription(t.description || '');
    setTaskProjectId(t.projectId);
    setTaskPriority(t.priority);
    setTaskDeadline(t.deadline ? t.deadline.substring(0, 10) : '');
    setTaskAssignedToId(t.assignedToId || '');
    setTaskEstimatedHours(t.estimatedHours ? String(t.estimatedHours) : '');
    setShowTaskModal(true);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskDeadline) return;

    const payload: Partial<ITaskItem> = {
      projectId: taskProjectId || selectedProjectId,
      title: taskTitle.trim(),
      description: taskDescription.trim(),
      priority: taskPriority,
      deadline: taskDeadline,
      assignedToId: taskAssignedToId || undefined,
      estimatedHours: taskEstimatedHours ? parseFloat(taskEstimatedHours) : undefined
    };

    try {
      if (editingTask) {
        await projectService.updateTask(editingTask.id || editingTask._id!, payload);
      } else {
        await projectService.createTask(payload);
      }
      setShowTaskModal(false);
      loadTasks();
      loadProjects();
    } catch (err: any) {
      alert(err.message || 'Error saving task');
    }
  };

  const handleDeleteTask = async (task: ITaskItem) => {
    if (!window.confirm(`Delete task "${task.title}"?`)) return;
    try {
      await projectService.deleteTask(task.id || task._id!);
      loadTasks();
      loadProjects();
      if (showTaskDrawer && activeTask?.id === task.id) {
        setShowTaskDrawer(false);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete task');
    }
  };

  // --------------------------------------------------------------------------
  // Document Management with 10MB Strict Limit
  // --------------------------------------------------------------------------
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDocError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > MAX_FILE_SIZE) {
        setDocError(`File size exceeds 10MB limit (${(file.size / (1024 * 1024)).toFixed(2)}MB). Please select a smaller file.`);
        setDocFile(null);
        return;
      }
      setDocFile(file);
      if (!docTitle) {
        setDocTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFile) {
      setDocError('Please select a file to upload');
      return;
    }
    if (docFile.size > MAX_FILE_SIZE) {
      setDocError('Maximum upload file size allowed is 10MB.');
      return;
    }

    // Convert file to mock/base64 URL for persistent storage demonstration
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const fileUrl = (reader.result as string) || `/uploads/${encodeURIComponent(docFile.name)}`;
        await projectService.uploadDocument({
          projectId: docProjectId || selectedProjectId || undefined,
          title: docTitle || docFile.name,
          fileName: docFile.name,
          fileUrl,
          fileType: docFile.type || 'application/octet-stream',
          fileSize: docFile.size,
          category: docCategory,
          isPublic: true
        });
        setShowDocUploadModal(false);
        setDocFile(null);
        setDocTitle('');
        setDocError(null);
        loadDocuments();
      } catch (err: any) {
        setDocError(err.message || 'Document upload failed');
      }
    };
    reader.readAsDataURL(docFile);
  };

  const handleDeleteDocument = async (doc: IProjectDocumentItem) => {
    if (!window.confirm(`Delete document "${doc.title}"?`)) return;
    try {
      await projectService.deleteDocument(doc.id || doc._id!);
      loadDocuments();
    } catch (err: any) {
      alert(err.message || 'Error deleting document');
    }
  };

  // --------------------------------------------------------------------------
  // Calendar Event & Milestone Handlers
  // --------------------------------------------------------------------------
  const handleSaveMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneTitle.trim() || !milestoneDueDate) return;

    try {
      await projectService.createMilestone({
        projectId: milestoneProjectId || selectedProjectId,
        title: milestoneTitle.trim(),
        description: milestoneDesc.trim(),
        dueDate: milestoneDueDate,
        status: 'PENDING'
      });
      setShowMilestoneModal(false);
      setMilestoneTitle('');
      setMilestoneDesc('');
      setMilestoneDueDate('');
      loadTimeline();
      loadCalendar();
    } catch (err: any) {
      alert(err.message || 'Failed to create milestone');
    }
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventStartDate || !eventEndDate) return;

    try {
      await projectService.createBusinessEvent({
        title: eventTitle.trim(),
        description: eventDescription.trim(),
        eventType,
        startDate: eventStartDate,
        endDate: eventEndDate,
        allDay: eventAllDay,
        location: eventLocation.trim(),
        projectId: eventProjectId || selectedProjectId || undefined,
        color: eventType === 'MEETING' ? '#3B82F6' : eventType === 'DEADLINE' ? '#EF4444' : '#10B981'
      });
      setShowEventModal(false);
      setEventTitle('');
      setEventDescription('');
      setEventStartDate('');
      setEventEndDate('');
      setEventLocation('');
      loadCalendar();
    } catch (err: any) {
      alert(err.message || 'Failed to create event');
    }
  };

  // --------------------------------------------------------------------------
  // Helper UI Badges
  // --------------------------------------------------------------------------
  const renderPriorityBadge = (p: ProjectPriorityType | TaskPriorityType) => {
    const styles: Record<string, string> = {
      LOW: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200',
      MEDIUM: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200',
      HIGH: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200',
      URGENT: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 animate-pulse'
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${styles[p] || styles.MEDIUM}`}>
        <Flag className="w-3 h-3 mr-1" />
        {p}
      </span>
    );
  };

  const renderStatusBadge = (s: ProjectStatusType | string) => {
    const normalized = (s || '').toUpperCase();
    const map: Record<string, { label: string; cls: string }> = {
      PLANNING: { label: 'Planning', cls: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-300' },
      ACTIVE: { label: 'Active', cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300' },
      ON_HOLD: { label: 'On Hold', cls: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300' },
      COMPLETED: { label: 'Completed', cls: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300' },
      CANCELLED: { label: 'Cancelled', cls: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300' }
    };
    const item = map[normalized] || { label: normalized, cls: 'bg-gray-100 text-gray-800 border-gray-300' };
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${item.cls}`}>{item.label}</span>;
  };

  // Kanban Columns Definition
  const kanbanColumns: Array<{ id: TaskStatusType; title: string; color: string; border: string }> = [
    { id: 'TODO', title: 'To Do', color: 'bg-slate-50 dark:bg-slate-900/40', border: 'border-slate-300 dark:border-slate-700' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-blue-50/50 dark:bg-blue-950/20', border: 'border-blue-300 dark:border-blue-800' },
    { id: 'REVIEW', title: 'Review', color: 'bg-amber-50/50 dark:bg-amber-950/20', border: 'border-amber-300 dark:border-amber-800' },
    { id: 'COMPLETED', title: 'Completed', color: 'bg-emerald-50/50 dark:bg-emerald-950/20', border: 'border-emerald-300 dark:border-emerald-800' },
    { id: 'BLOCKED', title: 'Blocked', color: 'bg-red-50/50 dark:bg-red-950/20', border: 'border-red-300 dark:border-red-800' }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Real-time Notification Banner */}
      {notificationBanner && (
        <div className="bg-indigo-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center space-x-3">
            <Bell className="w-5 h-5 animate-bounce" />
            <span className="text-sm font-medium">{notificationBanner}</span>
          </div>
          <button onClick={() => setNotificationBanner(null)} className="text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Main Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-100 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
              <FolderKanban className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Projects & Collaboration Hub
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage projects, live Kanban boards, Gantt timelines, documents, and business schedule
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Project Selector */}
          {projects.length > 0 && (
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
            >
              {projects.map((p) => (
                <option key={p.id || p._id} value={p.id || p._id}>
                  {p.name} ({p.projectCode})
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handleOpenCreateProject}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New Project
          </button>

          <button
            onClick={handleOpenCreateTask}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New Task
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-800 pb-px space-x-2 sm:space-x-8">
        <button
          onClick={() => setActiveTab('projects')}
          className={`pb-3 text-sm font-medium flex items-center space-x-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'projects'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          <FolderKanban className="w-4 h-4" />
          <span>All Projects ({projects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('kanban')}
          className={`pb-3 text-sm font-medium flex items-center space-x-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'kanban'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Kanban Board</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`pb-3 text-sm font-medium flex items-center space-x-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'timeline'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Timeline & Milestones</span>
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`pb-3 text-sm font-medium flex items-center space-x-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'documents'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Document Vault</span>
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`pb-3 text-sm font-medium flex items-center space-x-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'calendar'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>Schedule & Calendar</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-gray-800 p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects, tasks, files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300"
          >
            <option value="">All Statuses</option>
            <option value="PLANNING">Planning</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>

          <button
            onClick={() => {
              loadProjects();
              loadTasks();
              loadDocuments();
              loadCalendar();
            }}
            className="p-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* TAB 1: ALL PROJECTS OVERVIEW */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
              <FolderKanban className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">No projects found</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">
                Get started by creating your first business project.
              </p>
              <button
                onClick={handleOpenCreateProject}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                Create Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((proj) => (
                <div
                  key={proj.id || proj._id}
                  className={`bg-white dark:bg-gray-800 rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                    selectedProjectId === (proj.id || proj._id)
                      ? 'border-indigo-500 dark:border-indigo-500 ring-2 ring-indigo-500/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400">
                        {proj.projectCode}
                      </span>
                      <div className="flex items-center space-x-1.5">
                        {renderPriorityBadge(proj.priority)}
                        {renderStatusBadge(proj.status)}
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
                      {proj.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1 mb-4">
                      {proj.description || 'No description provided.'}
                    </p>

                    {/* Progress Bar */}
                    <div className="space-y-1 mb-4">
                      <div className="flex justify-between text-xs font-medium text-gray-600 dark:text-gray-300">
                        <span>Progress</span>
                        <span>{proj.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(0, proj.progress))}%` }}
                        />
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-3 mb-4">
                      <div className="flex items-center space-x-1.5">
                        <User className="w-3.5 h-3.5" />
                        <span className="truncate">{proj.projectManagerName || 'No Manager'}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>{proj.budget ? `₹${proj.budget.toLocaleString()}` : 'No Budget'}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{proj.endDate ? new Date(proj.endDate).toLocaleDateString() : 'No Deadline'}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Users className="w-3.5 h-3.5" />
                        <span>{proj.assignedEmployees?.length || proj.members?.length || 0} Members</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-3">
                    <button
                      onClick={() => {
                        setSelectedProjectId(proj.id || proj._id!);
                        setActiveTab('kanban');
                      }}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 flex items-center space-x-1"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Open Kanban</span>
                    </button>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenEditProject(proj)}
                        className="p-1.5 text-gray-500 hover:text-indigo-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        title="Edit Project"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(proj)}
                        className="p-1.5 text-gray-500 hover:text-red-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        title="Delete Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INTERACTIVE KANBAN BOARD */}
      {activeTab === 'kanban' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Kanban Board: {projects.find((p) => (p.id || p._id) === selectedProjectId)?.name || 'All Projects'}
              </h2>
              <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                Drag cards across columns to update task status
              </span>
            </div>
            <button
              onClick={handleOpenCreateTask}
              className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
            {kanbanColumns.map((col) => {
              const colTasks = tasks.filter((t) => t.status === col.id);
              return (
                <div
                  key={col.id}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, col.id)}
                  className={`rounded-2xl border p-3 flex flex-col min-h-[520px] transition-colors ${col.color} ${col.border}`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className="font-semibold text-xs tracking-wider uppercase text-gray-700 dark:text-gray-300">
                      {col.title}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-xs border border-gray-200 dark:border-gray-700">
                      {colTasks.length}
                    </span>
                  </div>

                  {/* Task Cards */}
                  <div className="space-y-3 flex-1">
                    {colTasks.map((t) => (
                      <div
                        key={t.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, t.id)}
                        onClick={() => openTaskDrawer(t)}
                        className="bg-white dark:bg-gray-800 p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs hover:shadow-md cursor-grab active:cursor-grabbing transition-all space-y-2 group"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-[11px] font-mono text-gray-400 group-hover:text-indigo-500 font-semibold">
                            {t.taskNumber}
                          </span>
                          {renderPriorityBadge(t.priority)}
                        </div>

                        <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                          {t.title}
                        </h4>

                        <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700/60">
                          <div className="flex items-center space-x-2">
                            <span className="flex items-center text-gray-500">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(t.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                            {t.commentsCount > 0 && (
                              <span className="flex items-center text-indigo-500">
                                <MessageSquare className="w-3 h-3 mr-1" />
                                {t.commentsCount}
                              </span>
                            )}
                          </div>

                          <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                            {t.assignedToName ? t.assignedToName.charAt(0).toUpperCase() : '?'}
                          </div>
                        </div>
                      </div>
                    ))}
                    {colTasks.length === 0 && (
                      <div className="h-28 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex items-center justify-center text-xs text-gray-400">
                        Drop task here
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: PROJECT TIMELINE & MILESTONES */}
      {activeTab === 'timeline' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Project Schedule & Milestones
              </h2>
              <p className="text-xs text-gray-500">
                Gantt-style timeline tracking tasks, progress milestones, and critical deadlines
              </p>
            </div>
            <button
              onClick={() => {
                setMilestoneProjectId(selectedProjectId);
                setShowMilestoneModal(true);
              }}
              className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Milestone</span>
            </button>
          </div>

          {/* Timeline Cards */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  Overall Completion ({timelineData?.progress || 0}%)
                </span>
                <span className="text-xs text-gray-500">
                  {timelineData?.tasks?.filter((t) => t.status === 'COMPLETED').length || 0} / {timelineData?.tasks?.length || 0} Tasks Done
                </span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-700 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${timelineData?.progress || 0}%` }}
                />
              </div>
            </div>

            {/* Milestones List */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center space-x-2">
                <Flag className="w-4 h-4 text-indigo-500" />
                <span>Project Milestones</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {timelineData?.milestones && timelineData.milestones.length > 0 ? (
                  timelineData.milestones.map((m) => (
                    <div
                      key={m.id || m._id}
                      className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/40 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          Milestone #{m.order || 1}
                        </span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                          {m.status}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{m.title}</h4>
                      <p className="text-xs text-gray-500">{m.description || 'Target milestone completion'}</p>
                      <div className="text-xs text-gray-400 flex items-center space-x-1 pt-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Due {new Date(m.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-xs text-gray-400 p-4 border border-dashed rounded-xl text-center">
                    No milestones defined. Click "Add Milestone" to set up major delivery markers.
                  </div>
                )}
              </div>
            </div>

            {/* Task Timeline Feed */}
            <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-indigo-500" />
                <span>Task Deadlines & Schedule</span>
              </h3>

              <div className="space-y-2.5">
                {tasks.map((task) => {
                  const isOverdue = new Date(task.deadline) < new Date() && task.status !== 'COMPLETED';
                  return (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700/60 text-xs"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${
                            task.status === 'COMPLETED'
                              ? 'bg-emerald-500'
                              : isOverdue
                              ? 'bg-red-500 animate-ping'
                              : 'bg-indigo-500'
                          }`}
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-gray-900 dark:text-white">{task.title}</span>
                            <span className="font-mono text-gray-400">({task.taskNumber})</span>
                            {isOverdue && (
                              <span className="px-1.5 py-0.2 rounded bg-red-100 text-red-700 font-bold text-[10px]">
                                OVERDUE
                              </span>
                            )}
                          </div>
                          <span className="text-gray-400">Assigned: {task.assignedToName || 'Unassigned'}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {renderPriorityBadge(task.priority)}
                        <span className="text-gray-500">
                          {new Date(task.deadline).toLocaleDateString()}
                        </span>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                          {task.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DOCUMENT MANAGEMENT VAULT */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Project Document Vault
              </h2>
              <p className="text-xs text-gray-500">
                Securely upload and share requirements, specifications, contracts, and design assets (Strict 10MB limit)
              </p>
            </div>
            <button
              onClick={() => {
                setDocProjectId(selectedProjectId);
                setShowDocUploadModal(true);
              }}
              className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Upload Document</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {documents.length > 0 ? (
              documents.map((doc) => (
                <div
                  key={doc.id || doc._id}
                  className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                        {doc.category}
                      </span>
                      <span className="text-xs text-gray-400">
                        {(doc.fileSize / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </div>

                    <div className="flex items-start space-x-3 pt-1">
                      <FileText className="w-8 h-8 text-indigo-500 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate" title={doc.title}>
                          {doc.title}
                        </h4>
                        <p className="text-xs text-gray-400 truncate">{doc.fileName}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-xs">
                    <span className="text-gray-400">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </span>

                    <div className="flex items-center space-x-1">
                      <a
                        href={doc.fileUrl}
                        download={doc.fileName}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-indigo-600 hover:text-indigo-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        title="Download / View"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDeleteDocument(doc)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        title="Delete Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-4 p-12 text-center bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                <FileText className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">No documents uploaded yet</h3>
                <p className="text-xs text-gray-500 mt-1 mb-4">
                  Upload project proposals, specifications, or contracts up to 10MB each.
                </p>
                <button
                  onClick={() => setShowDocUploadModal(true)}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                >
                  Upload First File
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: CENTRALIZED CALENDAR & MEETINGS */}
      {activeTab === 'calendar' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Centralized Enterprise Calendar
              </h2>
              <p className="text-xs text-gray-500">
                Aggregated agenda of meetings, project delivery milestones, and task deadlines
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                <button
                  onClick={() => setCalendarView('month')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    calendarView === 'month' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-xs' : 'text-gray-500'
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setCalendarView('week')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    calendarView === 'week' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-xs' : 'text-gray-500'
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setCalendarView('day')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    calendarView === 'day' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-xs' : 'text-gray-500'
                  }`}
                >
                  Day
                </button>
              </div>

              <button
                onClick={() => {
                  setEventProjectId(selectedProjectId);
                  setShowEventModal(true);
                }}
                className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Schedule Event</span>
              </button>
            </div>
          </div>

          {/* Aggregated Calendar Items Grid */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCalendarDate(new Date(calendarDate.setMonth(calendarDate.getMonth() - 1)))}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  onClick={() => setCalendarDate(new Date(calendarDate.setMonth(calendarDate.getMonth() + 1)))}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center space-x-3 text-xs">
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-gray-500">Meetings</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-gray-500">Milestones</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-gray-500">Deadlines</span>
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {calendarItems.length > 0 ? (
                calendarItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 flex items-center justify-between hover:bg-gray-100/60 dark:hover:bg-gray-900 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: item.color || '#3B82F6' }}
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                            {item.title}
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                            {item.type}
                          </span>
                        </div>
                        {item.metadata?.projectName && (
                          <span className="text-xs text-indigo-500">Project: {item.metadata.projectName}</span>
                        )}
                      </div>
                    </div>

                    <div className="text-right text-xs text-gray-500">
                      <div>{new Date(item.start).toLocaleDateString()}</div>
                      <div>
                        {new Date(item.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-gray-400">
                  No upcoming meetings or deadlines found in this period.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* TASK DETAILS & COLLABORATION DRAWER */}
      {/* ---------------------------------------------------------------------- */}
      {showTaskDrawer && activeTask && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-gray-800 h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto space-y-6">
            <div className="space-y-5">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-1 rounded">
                    {activeTask.taskNumber}
                  </span>
                  {renderPriorityBadge(activeTask.priority)}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenEditTask(activeTask)}
                    className="p-1.5 text-gray-400 hover:text-indigo-600 rounded"
                    title="Edit Task"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTask(activeTask)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                    title="Delete Task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowTaskDrawer(false)}
                    className="p-1.5 text-gray-400 hover:text-gray-700 rounded"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{activeTask.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 whitespace-pre-wrap">
                  {activeTask.description || 'No description added.'}
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 dark:bg-gray-900/40 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                <div>
                  <span className="text-gray-400 block mb-0.5">Status</span>
                  <select
                    value={activeTask.status}
                    onChange={(e) => {
                      const newStatus = e.target.value as TaskStatusType;
                      setActiveTask({ ...activeTask, status: newStatus });
                      projectService.updateTaskStatus(activeTask.id, newStatus);
                      setTasks((prev) => prev.map((t) => (t.id === activeTask.id ? { ...t, status: newStatus } : t)));
                    }}
                    className="text-xs font-semibold bg-white dark:bg-gray-800 border rounded px-2 py-1 text-gray-800 dark:text-gray-200"
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="REVIEW">Review</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="BLOCKED">Blocked</option>
                  </select>
                </div>

                <div>
                  <span className="text-gray-400 block mb-0.5">Assigned To</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {activeTask.assignedToName || 'Unassigned'}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400 block mb-0.5">Deadline</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {new Date(activeTask.deadline).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400 block mb-0.5">Estimated Hours</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {activeTask.estimatedHours || 0} hrs
                  </span>
                </div>
              </div>

              {/* Discussion Thread & Mentions */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center space-x-1.5">
                    <MessageSquare className="w-4 h-4 text-indigo-500" />
                    <span>Team Discussion ({taskComments.length})</span>
                  </h4>
                  <span className="text-[11px] text-gray-400">Supports @mentions</span>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {taskComments.map((c) => (
                    <div
                      key={c.id || c._id}
                      className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700/60 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900 dark:text-white">{c.authorName}</span>
                        <span className="text-gray-400 text-[10px]">
                          {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{c.content}</p>
                      {c.mentions && c.mentions.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {c.mentions.map((m, idx) => (
                            <span key={idx} className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">
                              @{m}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {taskComments.length === 0 && (
                    <div className="text-center text-xs text-gray-400 py-4">
                      No comments yet. Start the conversation with your team.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Comment Input Box */}
            <form onSubmit={handleAddComment} className="pt-3 border-t border-gray-100 dark:border-gray-700 space-y-2">
              <input
                type="text"
                placeholder="Mention colleagues e.g. alex, sarah (optional)"
                value={mentionInput}
                onChange={(e) => setMentionInput(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300"
              />
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Write a message or update..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={commentLoading || !commentInput.trim()}
                  className="px-3.5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium flex items-center space-x-1"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* MODAL: CREATE / EDIT PROJECT */}
      {/* ---------------------------------------------------------------------- */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700 mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingProject ? 'Edit Project' : 'Create New Project'}
              </h3>
              <button onClick={() => setShowProjectModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. NextGen ERP Platform Migration"
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Describe project objectives and deliverables..."
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={projectPriority}
                    onChange={(e) => setProjectPriority(e.target.value as ProjectPriorityType)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Initial Status
                  </label>
                  <select
                    value={projectStatus}
                    onChange={(e) => setProjectStatus(e.target.value as ProjectStatusType)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                  >
                    <option value="PLANNING">Planning</option>
                    <option value="ACTIVE">Active</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={projectStartDate}
                    onChange={(e) => setProjectStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Target End Date
                  </label>
                  <input
                    type="date"
                    value={projectEndDate}
                    onChange={(e) => setProjectEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Budget (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={projectBudget}
                    onChange={(e) => setProjectBudget(e.target.value)}
                    placeholder="e.g. 500000"
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={projectClient}
                    onChange={(e) => setProjectClient(e.target.value)}
                    placeholder="e.g. Acme Corp"
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={projectTags}
                  onChange={(e) => setProjectTags(e.target.value)}
                  placeholder="e.g. backend, mobile, redesign"
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowProjectModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  {editingProject ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* MODAL: CREATE / EDIT TASK */}
      {/* ---------------------------------------------------------------------- */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700 mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingTask ? 'Edit Task' : 'Create New Task'}
              </h3>
              <button onClick={() => setShowTaskModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Design responsive customer checkout flow"
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Provide specifications, acceptance criteria, or guidelines..."
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Assign Project
                  </label>
                  <select
                    value={taskProjectId}
                    onChange={(e) => setTaskProjectId(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                  >
                    {projects.map((p) => (
                      <option key={p.id || p._id} value={p.id || p._id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as TaskPriorityType)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Deadline *
                  </label>
                  <input
                    type="date"
                    required
                    value={taskDeadline}
                    onChange={(e) => setTaskDeadline(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Est. Hours
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={taskEstimatedHours}
                    onChange={(e) => setTaskEstimatedHours(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* MODAL: DOCUMENT UPLOAD (WITH STRICT 10MB LIMIT) */}
      {/* ---------------------------------------------------------------------- */}
      {showDocUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700 mb-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Upload Document</h3>
              </div>
              <button onClick={() => setShowDocUploadModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {docError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400 rounded-xl text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{docError}</span>
              </div>
            )}

            <form onSubmit={handleUploadDocument} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. Architecture Specification Document"
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value as DocumentCategoryType)}
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                >
                  <option value="REQUIREMENTS">Requirements</option>
                  <option value="DESIGN">Design & Wireframes</option>
                  <option value="SPECIFICATION">Technical Specification</option>
                  <option value="CONTRACT">Contract & Agreement</option>
                  <option value="REPORT">Report</option>
                  <option value="ATTACHMENT">Attachment</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Select File (Max 10MB) *
                </label>
                <input
                  type="file"
                  required
                  onChange={handleFileChange}
                  className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Allowed formats: PDF, DOCX, XLSX, PNG, JPG, ZIP (Strictly capped at 10MB).
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowDocUploadModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* MODAL: ADD MILESTONE */}
      {/* ---------------------------------------------------------------------- */}
      {showMilestoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700 mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add Project Milestone</h3>
              <button onClick={() => setShowMilestoneModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMilestone} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Milestone Title *
                </label>
                <input
                  type="text"
                  required
                  value={milestoneTitle}
                  onChange={(e) => setMilestoneTitle(e.target.value)}
                  placeholder="e.g. Phase 1 Alpha Delivery"
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={milestoneDesc}
                  onChange={(e) => setMilestoneDesc(e.target.value)}
                  placeholder="Milestone scope and review criteria..."
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Target Due Date *
                </label>
                <input
                  type="date"
                  required
                  value={milestoneDueDate}
                  onChange={(e) => setMilestoneDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowMilestoneModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* MODAL: SCHEDULE BUSINESS EVENT */}
      {/* ---------------------------------------------------------------------- */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700 mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Schedule Event / Meeting</h3>
              <button onClick={() => setShowEventModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="e.g. Sprint Planning & Architecture Review"
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Event Type
                </label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as BusinessEventTypeType)}
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                >
                  <option value="MEETING">Meeting</option>
                  <option value="REVIEW">Review</option>
                  <option value="DEADLINE">Deadline</option>
                  <option value="MILESTONE">Milestone</option>
                  <option value="COMPANY_EVENT">Company Event</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={eventStartDate}
                    onChange={(e) => setEventStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={eventEndDate}
                    onChange={(e) => setEventEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="eventAllDayCheck"
                  checked={eventAllDay}
                  onChange={(e) => setEventAllDay(e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="eventAllDayCheck" className="text-xs text-gray-700 dark:text-gray-300">
                  All day event
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Location / Meeting Link
                </label>
                <input
                  type="text"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  placeholder="e.g. Conference Room A or https://meet.google.com/xyz"
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsManagementPage;
