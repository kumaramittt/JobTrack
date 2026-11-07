import React, { useState, useRef, useEffect } from 'react';
import { JobStatus } from '../types/job';
import { Send, Clock, CheckCircle2, XCircle, ChevronDown } from 'lucide-react';

interface StatusBadgeProps {
  status: JobStatus;
  interactive?: boolean;
  onStatusChange?: (newStatus: JobStatus) => void;
  size?: 'sm' | 'md';
}

const statusConfig: Record<
  JobStatus,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    bgLight: string;
    textLight: string;
    borderLight: string;
    bgDark: string;
    textDark: string;
    borderDark: string;
  }
> = {
  Applied: {
    label: 'Applied',
    icon: Send,
    bgLight: 'bg-blue-50',
    textLight: 'text-blue-700',
    borderLight: 'border-blue-200',
    bgDark: 'dark:bg-blue-950/60',
    textDark: 'dark:text-blue-300',
    borderDark: 'dark:border-blue-800/60',
  },
  Interview: {
    label: 'Interview',
    icon: Clock,
    bgLight: 'bg-amber-50',
    textLight: 'text-amber-800',
    borderLight: 'border-amber-200',
    bgDark: 'dark:bg-amber-950/60',
    textDark: 'dark:text-amber-300',
    borderDark: 'dark:border-amber-800/60',
  },
  Selected: {
    label: 'Selected / Offer',
    icon: CheckCircle2,
    bgLight: 'bg-emerald-50',
    textLight: 'text-emerald-800',
    borderLight: 'border-emerald-200',
    bgDark: 'dark:bg-emerald-950/60',
    textDark: 'dark:text-emerald-300',
    borderDark: 'dark:border-emerald-800/60',
  },
  Rejected: {
    label: 'Rejected',
    icon: XCircle,
    bgLight: 'bg-rose-50',
    textLight: 'text-rose-800',
    borderLight: 'border-rose-200',
    bgDark: 'dark:bg-rose-950/60',
    textDark: 'dark:text-rose-300',
    borderDark: 'dark:border-rose-800/60',
  },
};

const allStatuses: JobStatus[] = ['Applied', 'Interview', 'Selected', 'Rejected'];

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  interactive = false,
  onStatusChange,
  size = 'md',
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const config = statusConfig[status] || statusConfig.Applied;
  const Icon = config.icon;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const badgeContent = (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      } ${config.bgLight} ${config.textLight} ${config.borderLight} ${config.bgDark} ${config.textDark} ${config.borderDark} transition-all`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span className="whitespace-nowrap">{config.label}</span>
      {interactive && <ChevronDown className="w-3 h-3 opacity-70 ml-0.5" />}
    </span>
  );

  if (!interactive || !onStatusChange) {
    return badgeContent;
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/30 rounded-md"
        title="Click to update status"
      >
        {badgeContent}
      </button>

      {open && (
        <div className="absolute left-0 mt-1.5 w-44 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-30 py-1.5 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Update Status
          </div>
          {allStatuses.map((s) => {
            const sc = statusConfig[s];
            const SIcon = sc.icon;
            const isCurrent = s === status;
            return (
              <button
                key={s}
                type="button"
                onClick={() => {
                  onStatusChange(s);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left cursor-pointer transition-colors ${
                  isCurrent
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <SIcon className="w-3.5 h-3.5" />
                  <span>{sc.label}</span>
                </div>
                {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
