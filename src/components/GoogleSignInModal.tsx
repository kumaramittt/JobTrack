import React, { useState } from 'react';
import { X, UserPlus, Check, ShieldCheck, Loader2 } from 'lucide-react';
import { UserProfile } from '../types/job';

interface GoogleSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: (googleProfile: { name: string; email: string; avatarUrl?: string }) => void;
}

export const GoogleSignInModal: React.FC<GoogleSignInModalProps> = ({
  isOpen,
  onClose,
  onSignIn,
}) => {
  const [selectedEmail, setSelectedEmail] = useState<string>('ankitsharma@gmail.com');
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [customError, setCustomError] = useState('');

  if (!isOpen) return null;

  const savedAccounts = [
    {
      name: 'Ankit Sharma',
      email: 'ankitsharma@gmail.com',
      avatarBg: 'bg-emerald-600',
    },
    {
      name: 'Amit Kumar',
      email: 'amitkumar678793@gmail.com',
      avatarBg: 'bg-indigo-600',
    },
  ];

  const handleSelectAccount = (account: typeof savedAccounts[0]) => {
    setSelectedEmail(account.email);
    setIsCustom(false);
    setCustomError('');
  };

  const handleProceed = () => {
    if (isCustom) {
      if (!customName.trim() || !customEmail.trim()) {
        setCustomError('Please provide both name and a valid Google email.');
        return;
      }
      if (!customEmail.includes('@')) {
        setCustomError('Please enter a valid email address.');
        return;
      }
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        onSignIn({
          name: customName.trim(),
          email: customEmail.trim().toLowerCase(),
        });
        onClose();
      }, 700);
      return;
    }

    const account = savedAccounts.find((a) => a.email === selectedEmail) || savedAccounts[0];
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSignIn({
        name: account.name,
        email: account.email,
      });
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            {/* Google Multicolor 'G' Logo */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              Sign in with Google
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subtitle */}
        <div className="pt-4 pb-3">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Choose an account
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            to continue to <strong>JobTrack</strong>
          </p>
        </div>

        {/* Account List */}
        <div className="space-y-2 py-1">
          {savedAccounts.map((acc) => {
            const isSelected = !isCustom && selectedEmail === acc.email;
            return (
              <div
                key={acc.email}
                onClick={() => !isLoading && handleSelectAccount(acc)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 ring-1 ring-indigo-500/30'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                } ${isLoading ? 'pointer-events-none opacity-60' : ''}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-full ${acc.avatarBg} text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs`}
                  >
                    {acc.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {acc.name}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {acc.email}
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Use another account option */}
          <div
            onClick={() => {
              if (!isLoading) {
                setIsCustom(true);
                setCustomError('');
              }
            }}
            className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
              isCustom
                ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 ring-1 ring-indigo-500/30'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            } ${isLoading ? 'pointer-events-none opacity-60' : ''}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                <UserPlus className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Use another Google account
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Sign in with custom name and address
                </p>
              </div>
            </div>

            {isCustom && (
              <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
            )}
          </div>
        </div>

        {/* Custom Input Fields if "Use another account" is selected */}
        {isCustom && (
          <div className="mt-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 space-y-2.5 animate-in fade-in duration-150">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Priya Sharma"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Google Email Address
              </label>
              <input
                type="email"
                placeholder="e.g. priya.work@gmail.com"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            {customError && (
              <p className="text-[11px] text-rose-600 dark:text-rose-400">{customError}</p>
            )}
          </div>
        )}

        {/* Security Notice */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>JobTrack accesses your name and email to personalize your job search portal.</span>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleProceed}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all cursor-pointer min-w-[130px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Continue</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
