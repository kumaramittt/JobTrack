import React, { useState, useRef } from 'react';
import {
  User,
  Sun,
  Moon,
  Download,
  Upload,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Mail,
  Briefcase,
  MapPin,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { useJobContext } from '../context/JobContext';
import { exportApplicationsToCSV, parseApplicationsCSV } from '../utils/storage';

export const SettingsPage: React.FC = () => {
  const {
    profile,
    updateProfile,
    theme,
    setTheme,
    applications,
    clearAllData,
    resetDemoData,
    importApplications,
  } = useJobContext();

  const [profileForm, setProfileForm] = useState({
    name: profile.name,
    email: profile.email,
    targetRole: profile.targetRole,
    location: profile.location || '',
  });

  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keep form in sync if profile updates externally
  React.useEffect(() => {
    setProfileForm({
      name: profile.name,
      email: profile.email,
      targetRole: profile.targetRole,
      location: profile.location || '',
    });
  }, [profile]);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      setProfileError('Name cannot be empty.');
      return;
    }
    setProfileError(null);
    updateProfile({
      name: profileForm.name.trim(),
      email: profileForm.email.trim() || 'amitkumar678793@gmail.com',
      targetRole: profileForm.targetRole.trim() || 'Software Engineer',
      location: profileForm.location.trim(),
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleExportCSV = () => {
    exportApplicationsToCSV(applications);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) {
        setImportStatus({ success: false, message: 'Could not read CSV file.' });
        return;
      }
      const result = parseApplicationsCSV(text);
      if (result.error) {
        setImportStatus({ success: false, message: result.error });
      } else {
        importApplications(result.applications);
        setImportStatus({
          success: true,
          message: `Successfully imported ${result.applications.length} applications!`,
        });
      }
    };
    reader.onerror = () => {
      setImportStatus({ success: false, message: 'Failed to read file.' });
    };
    reader.readAsText(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Settings & Preferences
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Customize your profile, visual appearance, and manage application data backups.
        </p>
      </div>

      {/* 1. USER PROFILE SETTINGS */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">User Profile & Identity</h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Editable</span>
        </div>

        {/* Live Profile Header Preview */}
        <div className="flex items-center gap-3 p-3.5 mb-5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold text-base flex items-center justify-center shadow-xs shrink-0">
            {(profileForm.name || 'A').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {profileForm.name || 'Your Name'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {profileForm.targetRole || 'Software Engineer'} · {profileForm.email || 'Email'}
            </p>
          </div>
        </div>

        {profileSaved && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Profile name and settings updated successfully! Changes saved to LocalStorage.</span>
          </div>
        )}

        {profileError && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-center gap-2 text-xs text-rose-800 dark:text-rose-300">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>{profileError}</span>
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Your Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Amit Kumar"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Shown across your dashboard, sidebar, and reports.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Role / Domain
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={profileForm.targetRole}
                  onChange={(e) => setProfileForm({ ...profileForm, targetRole: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Preferred Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Remote, San Francisco, CA"
                  value={profileForm.location}
                  onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>

      {/* 2. THEME SELECTION */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Sun className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Appearance & Theme</h3>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Choose your interface appearance preference for daylight and late-night job tracking.
        </p>

        <div className="grid grid-cols-2 gap-4 max-w-md">
          {/* Light Theme Option */}
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              theme === 'light'
                ? 'bg-indigo-50/60 border-indigo-600 ring-2 ring-indigo-600/20'
                : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <Sun className="w-4 h-4" />
              </div>
              {theme === 'light' && (
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
              )}
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">Light Mode</span>
              <span className="text-[11px] text-slate-500">Clean white & soft slate palette</span>
            </div>
          </button>

          {/* Dark Theme Option */}
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              theme === 'dark'
                ? 'bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/20'
                : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-slate-800 text-indigo-400 flex items-center justify-center">
                <Moon className="w-4 h-4" />
              </div>
              {theme === 'dark' && (
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
              )}
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">Dark Mode</span>
              <span className="text-[11px] text-slate-500">Dark navy & deep slate contrast</span>
            </div>
          </button>
        </div>
      </div>

      {/* 3. IMPORT / EXPORT DATA */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Data Portability (CSV Export & Import)
          </h3>
        </div>

        {importStatus && (
          <div
            className={`mb-4 p-3 rounded-lg border text-xs flex items-center gap-2 ${
              importStatus.success
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 text-rose-800 dark:text-rose-300'
            }`}
          >
            {importStatus.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            )}
            <span>{importStatus.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Export to CSV */}
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                Export Applications to CSV
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                Download a clean comma-separated backup of all {applications.length} applications
                including company names, roles, statuses, dates, and notes.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={applications.length === 0}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Download CSV File</span>
            </button>
          </div>

          {/* Import from CSV */}
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                Import Applications from CSV
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                Upload a CSV file from a previous export or standard spreadsheet (requires Company
                and Role headers).
              </p>
            </div>
            <div>
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-file-input"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload CSV File</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. DANGER ZONE / DATA RESET */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-rose-200/80 dark:border-rose-900/60 shadow-2xs">
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-rose-100 dark:border-rose-900/40">
          <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          <h3 className="text-sm font-bold text-rose-700 dark:text-rose-400">
            Database & Storage Management
          </h3>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
          All data is persistently stored in your browser's LocalStorage. You can reload initial
          demo records or purge all saved entries.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          {/* Reset Demo Data */}
          {!showResetConfirm ? (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Restore Demo Data</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200 dark:border-amber-800">
              <span className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                Reset to 5 demo jobs?
              </span>
              <button
                type="button"
                onClick={() => {
                  resetDemoData();
                  setShowResetConfirm(false);
                }}
                className="px-2.5 py-1 text-xs font-semibold bg-amber-600 text-white rounded hover:bg-amber-700 cursor-pointer"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-2 py-1 text-xs text-slate-600 dark:text-slate-300 hover:underline cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Clear All Data */}
          {!showClearConfirm ? (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 rounded-lg border border-rose-200 dark:border-rose-900 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All Data</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/60 p-2 rounded-lg border border-rose-200 dark:border-rose-900">
              <span className="text-xs text-rose-800 dark:text-rose-300 font-medium">
                Delete all {applications.length} applications permanently?
              </span>
              <button
                type="button"
                onClick={() => {
                  clearAllData();
                  setShowClearConfirm(false);
                }}
                className="px-2.5 py-1 text-xs font-semibold bg-rose-600 text-white rounded hover:bg-rose-700 cursor-pointer"
              >
                Yes, Delete All
              </button>
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-2 py-1 text-xs text-slate-600 dark:text-slate-300 hover:underline cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
