import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { JobApplication, UserProfile, NotificationItem, ThemeMode } from '../types/job';
import {
  getStoredApplications,
  saveStoredApplications,
  getStoredProfile,
  saveStoredProfile,
  getStoredTheme,
  saveStoredTheme,
  getStoredNotifications,
  saveStoredNotifications,
  INITIAL_DEMO_APPLICATIONS,
  INITIAL_NOTIFICATIONS,
} from '../utils/storage';

export interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface JobContextType {
  applications: JobApplication[];
  profile: UserProfile;
  theme: ThemeMode;
  notifications: NotificationItem[];
  searchQuery: string;
  toast: ToastNotification | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
  setSearchQuery: (query: string) => void;
  addApplication: (job: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>) => JobApplication;
  updateApplication: (id: string, updates: Partial<JobApplication>) => void;
  deleteApplication: (id: string) => boolean;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  resetDemoData: () => void;
  clearAllData: () => void;
  importApplications: (newApps: JobApplication[]) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export const JobProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [applications, setApplications] = useState<JobApplication[]>(getStoredApplications);
  const [profile, setProfile] = useState<UserProfile>(getStoredProfile);
  const [theme, setThemeState] = useState<ThemeMode>(getStoredTheme);
  const [notifications, setNotifications] = useState<NotificationItem[]>(getStoredNotifications);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toast, setToast] = useState<ToastNotification | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}`;
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((cur) => (cur?.id === id ? null : cur));
    }, 4000);
  };

  const hideToast = () => {
    setToast(null);
  };

  // Sync theme with HTML class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    saveStoredTheme(theme);
  }, [theme]);

  // Persist applications
  useEffect(() => {
    saveStoredApplications(applications);
  }, [applications]);

  // Persist profile
  useEffect(() => {
    saveStoredProfile(profile);
  }, [profile]);

  // Persist notifications
  useEffect(() => {
    saveStoredNotifications(notifications);
  }, [notifications]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const addApplication = (jobData: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>): JobApplication => {
    const now = new Date().toISOString();
    const newJob: JobApplication = {
      ...jobData,
      id: `job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: now,
      updatedAt: now,
    };

    setApplications((prev) => [newJob, ...prev]);

    // Create a notification for the newly added job
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Application Added',
      message: `Tracked application for ${newJob.role} at ${newJob.company}.`,
      date: new Date().toISOString().slice(0, 10),
      type: newJob.status === 'Interview' ? 'interview' : 'info',
      read: false,
      jobId: newJob.id,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    return newJob;
  };

  const updateApplication = (id: string, updates: Partial<JobApplication>) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === id) {
          const updated = {
            ...app,
            ...updates,
            updatedAt: new Date().toISOString(),
          };

          // If status changed to Interview or Selected, notify user
          if (updates.status && updates.status !== app.status) {
            const notifTitle =
              updates.status === 'Interview'
                ? 'Interview Scheduled!'
                : updates.status === 'Selected'
                ? 'Offer Received!'
                : `Status: ${updates.status}`;

            const notif: NotificationItem = {
              id: `notif-${Date.now()}`,
              title: notifTitle,
              message: `${app.company} application status changed to ${updates.status}.`,
              date: new Date().toISOString().slice(0, 10),
              type: updates.status === 'Selected' || updates.status === 'Interview' ? 'interview' : 'status',
              read: false,
              jobId: id,
            };
            setNotifications((n) => [notif, ...n]);
          }

          return updated;
        }
        return app;
      })
    );
  };

  const deleteApplication = (id: string): boolean => {
    try {
      if (!id) {
        showToast('Unable to delete: Invalid application ID.', 'error');
        return false;
      }

      const cleanId = String(id).trim();
      let targetApp: JobApplication | undefined;

      // Filter and sync LocalStorage immediately
      setApplications((prev) => {
        targetApp = prev.find((app) => String(app.id).trim() === cleanId);
        if (!targetApp) {
          console.warn(`Application with ID "${cleanId}" was not found.`);
          return prev;
        }

        const remaining = prev.filter((app) => String(app.id).trim() !== cleanId);
        // Requirement 5: Update LocalStorage immediately after deletion
        saveStoredApplications(remaining);
        return remaining;
      });

      if (targetApp) {
        // Requirement 9: Show a success message after successful deletion
        showToast(
          `Application for "${targetApp.role}" at ${targetApp.company} was deleted successfully.`,
          'success'
        );

        // Add a notification entry for record
        const notif: NotificationItem = {
          id: `notif-${Date.now()}`,
          title: 'Application Removed',
          message: `Deleted application for ${targetApp.role} at ${targetApp.company}.`,
          date: new Date().toISOString().slice(0, 10),
          type: 'alert',
          read: false,
        };
        setNotifications((n) => [notif, ...n]);
        return true;
      } else {
        showToast('Application not found or already removed.', 'error');
        return false;
      }
    } catch (err: any) {
      console.error('Error in deleteApplication:', err);
      showToast('An error occurred while deleting the application.', 'error');
      return false;
    }
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  const resetDemoData = () => {
    setApplications(INITIAL_DEMO_APPLICATIONS);
    setNotifications(INITIAL_NOTIFICATIONS);
    saveStoredApplications(INITIAL_DEMO_APPLICATIONS);
    saveStoredNotifications(INITIAL_NOTIFICATIONS);
    showToast('Demo applications restored successfully.', 'info');
  };

  const clearAllData = () => {
    setApplications([]);
    saveStoredApplications([]);
    showToast('All application data cleared.', 'info');
  };

  const importApplications = (newApps: JobApplication[]) => {
    setApplications((prev) => {
      const merged = [...newApps, ...prev];
      saveStoredApplications(merged);
      return merged;
    });
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Import Successful',
      message: `Imported ${newApps.length} job application(s) successfully.`,
      date: new Date().toISOString().slice(0, 10),
      type: 'info',
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
    showToast(`Imported ${newApps.length} application(s) successfully.`, 'success');
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <JobContext.Provider
      value={{
        applications,
        profile,
        theme,
        notifications,
        searchQuery,
        toast,
        showToast,
        hideToast,
        setSearchQuery,
        addApplication,
        updateApplication,
        deleteApplication,
        updateProfile,
        setTheme,
        toggleTheme,
        resetDemoData,
        clearAllData,
        importApplications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotifications,
      }}
    >
      {children}
    </JobContext.Provider>
  );
};

export const useJobContext = (): JobContextType => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJobContext must be used within a JobProvider');
  }
  return context;
};
