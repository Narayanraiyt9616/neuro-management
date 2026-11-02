import React, { useState, useEffect, useRef } from 'react';
import { Menu, Search, Bell, Building2, Brain, Sparkles, Check, CheckCheck } from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { useApiHealth } from '../../hooks/useApiHealth';
import { TopNavProps } from '../../types';
import notificationService, { INotificationItem } from '../../services/notificationService';
import AiAssistantDrawer from '../ai/AiAssistantDrawer';

export const TopNav: React.FC<TopNavProps> = ({ setMobileOpen, pageTitle = 'Dashboard' }) => {
  const { activeBusiness } = useBusiness();
  const { isHealthy, loading, refetch } = useApiHealth(30000);

  // AI Assistant Drawer state
  const [isAiOpen, setIsAiOpen] = useState<boolean>(false);

  // Notification state
  const [notifications, setNotifications] = useState<INotificationItem[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const loadNotifications = async () => {
    try {
      const res = await notificationService.getNotifications();
      if (res && res.data) {
        setNotifications(res.data);
      }
    } catch {
      // Fallback silent failure if endpoint unreachable or no auth
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id || n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  return (
    <>
      <header className="h-16 bg-white dark:bg-gray-900 border-b border-slate-200/80 dark:border-gray-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 focus:outline-hidden cursor-pointer"
            aria-label="Open mobile menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              {pageTitle}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80">
              <Building2 className="w-3 h-3" />
              <span className="truncate max-w-44">{activeBusiness?.name || 'BizNexus Enterprise'}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search */}
          <div className="hidden md:flex items-center relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search records, entities, invoices..."
              className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg w-48 lg:w-60 focus:outline-hidden focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 transition-all text-slate-800 dark:text-slate-200 placeholder-slate-400"
            />
          </div>

          {/* AI Assistant Quick Trigger */}
          <button
            onClick={() => setIsAiOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-xs transition-all cursor-pointer"
            title="Open AI Business Copilot"
          >
            <Brain className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AI Copilot</span>
            <Sparkles className="w-3 h-3 text-indigo-200" />
          </button>

          {/* Real-time Health Monitor */}
          <button
            onClick={() => { refetch(); }}
            title="Backend API Status - Click to refresh"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-gray-700 transition-colors cursor-pointer"
          >
            <span className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-emerald-500' : loading ? 'bg-amber-400' : 'bg-rose-500'}`} />
            <span className="hidden lg:inline">{isHealthy ? 'API 200 OK' : 'Standby'}</span>
          </button>

          {/* Global Notification Bell & Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen((v) => !v)}
              className="p-2 text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-800 rounded-lg relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-rose-600 text-white text-[9px] font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Menu */}
            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-900/60">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-gray-900 dark:text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 rounded-full font-semibold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center cursor-pointer"
                    >
                      <CheckCheck className="w-3.5 h-3.5 mr-1" />
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700/60">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-gray-400">
                      No notifications at this time.
                    </div>
                  ) : (
                    notifications.slice(0, 15).map((notif) => {
                      const id = notif.id || notif._id || Math.random().toString();
                      return (
                        <div
                          key={id}
                          className={`p-3 text-xs transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/40 flex items-start justify-between gap-2 ${
                            !notif.read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                          }`}
                        >
                          <div className="space-y-0.5 flex-1">
                            <div className="font-semibold text-gray-900 dark:text-white flex items-center space-x-1.5">
                              {!notif.read && (
                                <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                              )}
                              <span>{notif.title}</span>
                            </div>
                            <div className="text-gray-600 dark:text-gray-300 text-[11px] leading-relaxed">
                              {notif.message}
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono">
                              {new Date(notif.createdAt || Date.now()).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>

                          {!notif.read && (
                            <button
                              onClick={(e) => handleMarkAsRead(id, e)}
                              className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-1 rounded-sm cursor-pointer"
                              title="Mark as read"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60 text-center">
                  <span className="text-[10px] text-gray-400">
                    Real-time updates via Socket.io & MongoDB Event Stream
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global AI Assistant Drawer */}
      <AiAssistantDrawer isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </>
  );
};

export default TopNav;
