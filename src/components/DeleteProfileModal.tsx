import React, { useState } from 'react';
import { X, AlertTriangle, Trash2, ShieldAlert } from 'lucide-react';
import { UserProfile } from '../types/job';

interface DeleteProfileModalProps {
  isOpen: boolean;
  profile: UserProfile;
  onClose: () => void;
  onConfirmDelete: (alsoDeleteApplications: boolean) => void;
}

export const DeleteProfileModal: React.FC<DeleteProfileModalProps> = ({
  isOpen,
  profile,
  onClose,
  onConfirmDelete,
}) => {
  const [alsoDeleteData, setAlsoDeleteData] = useState(true);
  const [confirmText, setConfirmText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleDelete = () => {
    if (confirmText.trim().toUpperCase() !== 'DELETE') {
      setErrorMsg('Please type "DELETE" in capital letters to confirm.');
      return;
    }
    setErrorMsg('');
    onConfirmDelete(alsoDeleteData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 shadow-2xl p-6 overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-rose-100 dark:border-rose-950/60">
          <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
            <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950/70 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Delete Profile & Account
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Banner */}
        <div className="mt-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs text-rose-800 dark:text-rose-200">
            <p className="font-bold">This action cannot be undone.</p>
            <p className="mt-0.5 text-rose-700 dark:text-rose-300">
              You are about to permanently delete the profile for{' '}
              <strong>{profile.name}</strong> ({profile.email}).
            </p>
          </div>
        </div>

        {/* Profile Card Preview */}
        <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {profile.name}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {profile.email} · {profile.targetRole}
            </p>
          </div>
        </div>

        {/* Options */}
        <div className="mt-4 space-y-3">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={alsoDeleteData}
              onChange={(e) => setAlsoDeleteData(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
            />
            <span className="text-xs text-slate-700 dark:text-slate-300">
              Also wipe all saved job applications, interview schedules, and analytics from this browser
            </span>
          </label>

          {/* Type confirmation */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              To verify deletion, please type <span className="text-rose-600 font-mono font-bold">DELETE</span> below:
            </label>
            <input
              type="text"
              placeholder="Type DELETE to confirm"
              value={confirmText}
              onChange={(e) => {
                setConfirmText(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
            {errorMsg && (
              <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">{errorMsg}</p>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={confirmText.trim().toUpperCase() !== 'DELETE'}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Permanently Delete Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};
