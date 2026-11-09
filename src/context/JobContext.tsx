import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { JobApplication, UserProfile, NotificationItem, ThemeMode, ApplicationMetrics } from '../types/job';
import {
  getStoredApplications,
  saveStoredApplications,
  getStoredProfile,
  saveStoredProfile,
  clearStoredProfile,
  getStoredTheme,
  saveStoredTheme,
  getStoredNotifications,
  saveStoredNotifications,
  getStoredIsDemo,
  saveStoredIsDemo,
  getStoredAuthSession,
  saveStoredAuthSession,
  DEFAULT_USER_PROFILE,
  INITIAL_DEMO_APPLICATIONS,
  INITIAL_NOTIFICATIONS,
} from '../utils/storage';
import { calculateApplicationMetrics } from '../utils/metrics';
import { getTodayDateString } from '../utils/date';

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
  isDemoData: boolean;
  metrics: ApplicationMetrics;
  isAuthenticated: boolean;
  authProvider: 'google' | 'email' | 'guest';
  isGoogleModalOpen: boolean;
  openGoogleModal: () => void;
  closeGoogleModal: () => void;
  loginWithGoogle: (googleData: { name: string; email: string; avatarUrl?: string }) => void;
  loginWithEmail: (email: string, name?: string) => void;
  loginAsDemo: () => void;
  logout: () => void;
  deleteProfile: (alsoDeleteApplications?: boolean) => void;
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
  checkDuplicate: (company: string, role: string, excludeId?: string) => boolean;
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
  const [isDemoData, setIsDemoData] = useState<boolean>(getStoredIsDemo);
  const [authSession, setAuthSession] = useState(getStoredAuthSession);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toast, setToast] = useState<ToastNotification | null>(null);

  // Compute centralized metrics dynamically from current applications state
  const metrics = useMemo(() => calculateApplicationMetrics(applications), [applications]);

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

  const checkDuplicate = (company: string, role: string, excludeId?: string): boolean => {
    const c = company.trim().toLowerCase();
    const r = role.trim().toLowerCase();
    if (!c || !r) return false;
    return applications.some(
      (app) =>
        app.id !== excludeId &&
        app.company.trim().toLowerCase() === c &&
        app.role.trim().toLowerCase() === r
    );
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

    // If previously in demo mode, transition to real user data
    if (isDemoData) {
      setIsDemoData(false);
      saveStoredIsDemo(false);
    }

    // Create a notification for the newly added job using IST date
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Application Added',
      message: `Tracked application for ${newJob.role} at ${newJob.company}.`,
      date: getTodayDateString(),
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

      // Look up target application from state
      let targetApp = applications.find((app) => String(app.id).trim() === cleanId);

      // If not in state, check stored data fallback
      if (!targetApp) {
        const stored = getStoredApplications();
        targetApp = stored.find((app) => String(app.id).trim() === cleanId);
      }

      if (!targetApp) {
        showToast('Application not found or already removed.', 'error');
        return false;
      }

      // Filter out the selected application
      const remaining = applications.filter((app) => String(app.id).trim() !== cleanId);

      // 1. Immediately persist to LocalStorage to ensure persistence across page refreshes
      saveStoredApplications(remaining);

      // 2. Update React state immediately
      setApplications(remaining);

      // 3. Show clear success message
      showToast(
        `Application for "${targetApp.role}" at ${targetApp.company} was deleted successfully.`,
        'success'
      );

      // 4. Add notification record
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
    setIsDemoData(true);
    saveStoredApplications(INITIAL_DEMO_APPLICATIONS);
    saveStoredNotifications(INITIAL_NOTIFICATIONS);
    saveStoredIsDemo(true);
    showToast('Sample demo applications loaded successfully.', 'info');
  };

  const clearAllData = () => {
    setApplications([]);
    setIsDemoData(false);
    saveStoredApplications([]);
    saveStoredIsDemo(false);
    showToast('All application data cleared. Ready for your own applications.', 'info');
  };

  const importApplications = (newApps: JobApplication[]) => {
    setApplications((prev) => {
      const merged = [...newApps, ...prev];
      saveStoredApplications(merged);
      return merged;
    });
    setIsDemoData(false);
    saveStoredIsDemo(false);
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Import Successful',
      message: `Imported ${newApps.length} job application(s) successfully.`,
      date: getTodayDateString(),
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

  // Authentication & Profile lifecycle handlers
  const openGoogleModal = () => setIsGoogleModalOpen(true);
  const closeGoogleModal = () => setIsGoogleModalOpen(false);

  const loginWithGoogle = (googleData: { name: string; email: string; avatarUrl?: string }) => {
    const updatedProfile: UserProfile = {
      ...profile,
      name: googleData.name,
      email: googleData.email,
      avatarUrl: googleData.avatarUrl,
      authProvider: 'google',
      authTimestamp: new Date().toISOString(),
      isDemoAccount: false,
    };
    setProfile(updatedProfile);
    saveStoredProfile(updatedProfile);
    const session = { isAuthenticated: true, provider: 'google' as const };
    setAuthSession(session);
    saveStoredAuthSession(session);
    showToast(`Signed in with Google as ${googleData.name}`, 'success');
  };

  const loginWithEmail = (emailVal: string, nameVal?: string) => {
    const updatedProfile: UserProfile = {
      ...profile,
      email: emailVal,
      name: nameVal || profile.name || emailVal.split('@')[0],
      authProvider: 'email',
      authTimestamp: new Date().toISOString(),
      isDemoAccount: false,
    };
    setProfile(updatedProfile);
    saveStoredProfile(updatedProfile);
    const session = { isAuthenticated: true, provider: 'email' as const };
    setAuthSession(session);
    saveStoredAuthSession(session);
  };

  const loginAsDemo = () => {
    const updatedProfile: UserProfile = {
      ...DEFAULT_USER_PROFILE,
      authProvider: 'guest',
      isDemoAccount: true,
    };
    setProfile(updatedProfile);
    saveStoredProfile(updatedProfile);
    const session = { isAuthenticated: true, provider: 'guest' as const };
    setAuthSession(session);
    saveStoredAuthSession(session);
    resetDemoData();
  };

  const logout = () => {
    const session = { isAuthenticated: false, provider: 'guest' as const };
    setAuthSession(session);
    saveStoredAuthSession(session);
    showToast('You have been logged out of your session.', 'info');
  };

  const deleteProfile = (alsoDeleteApplications = true) => {
    clearStoredProfile();
    const blankProfile: UserProfile = {
      name: 'Guest User',
      email: '',
      targetRole: 'Job Seeker',
      location: '',
      timezone: 'Asia/Kolkata',
      isDemoAccount: false,
      authProvider: 'guest',
    };
    setProfile(blankProfile);
    saveStoredProfile(blankProfile);

    if (alsoDeleteApplications) {
      setApplications([]);
      saveStoredApplications([]);
      setNotifications([]);
      saveStoredNotifications([]);
      setIsDemoData(false);
      saveStoredIsDemo(false);
    }

    const session = { isAuthenticated: false, provider: 'guest' as const };
    setAuthSession(session);
    saveStoredAuthSession(session);
    showToast('Your profile and account have been deleted permanently.', 'info');
  };

  return (
    <JobContext.Provider
      value={{
        applications,
        profile,
        theme,
        notifications,
        searchQuery,
        isDemoData,
        metrics,
        isAuthenticated: authSession.isAuthenticated,
        authProvider: authSession.provider,
        isGoogleModalOpen,
        openGoogleModal,
        closeGoogleModal,
        loginWithGoogle,
        loginWithEmail,
        loginAsDemo,
        logout,
        deleteProfile,
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
        checkDuplicate,
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
