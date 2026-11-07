import React from 'react';
import { Briefcase, Plus, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  onAddClick?: () => void;
  onResetDemoClick?: () => void;
  actionText?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No job applications found',
  description = 'You have not added any job applications matching this criteria yet. Start tracking your applications to monitor your progress.',
  onAddClick,
  onResetDemoClick,
  actionText = 'Add Application',
}) => {
  return (
    <div className="py-14 px-4 text-center max-w-md mx-auto flex flex-col items-center justify-center">
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 shadow-xs">
        <Briefcase className="w-7 h-7" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1.5">
        {title}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
        {description}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {onAddClick && (
          <button
            type="button"
            onClick={onAddClick}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{actionText}</span>
          </button>
        )}
        {onResetDemoClick && (
          <button
            type="button"
            onClick={onResetDemoClick}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Load Demo Data</span>
          </button>
        )}
      </div>
    </div>
  );
};
