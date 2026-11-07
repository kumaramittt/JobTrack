import React from 'react';

interface CompanyAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const BRAND_PALETTES: Record<string, { bg: string; text: string; border: string }> = {
  google: { bg: 'bg-red-50 dark:bg-red-950/40', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-800/60' },
  microsoft: { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800/60' },
  amazon: { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800/60' },
  infosys: { bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-800/60' },
  tcs: { bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800/60' },
  apple: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-800 dark:text-slate-200', border: 'border-slate-300 dark:border-slate-700' },
  meta: { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800/60' },
  netflix: { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800/60' },
};

const COLOR_ROTATION = [
  { bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-800/60' },
  { bg: 'bg-sky-50 dark:bg-sky-950/40', text: 'text-sky-600 dark:text-sky-400', border: 'border-sky-200 dark:border-sky-800/60' },
  { bg: 'bg-teal-50 dark:bg-teal-950/40', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-200 dark:border-teal-800/60' },
  { bg: 'bg-violet-50 dark:bg-violet-950/40', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-200 dark:border-violet-800/60' },
  { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800/60' },
  { bg: 'bg-fuchsia-50 dark:bg-fuchsia-950/40', text: 'text-fuchsia-600 dark:text-fuchsia-400', border: 'border-fuchsia-200 dark:border-fuchsia-800/60' },
  { bg: 'bg-cyan-50 dark:bg-cyan-950/40', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-200 dark:border-cyan-800/60' },
];

export const CompanyAvatar: React.FC<CompanyAvatarProps> = ({ name, size = 'md', className = '' }) => {
  const cleanName = (name || 'Company').trim();
  const initial = cleanName.charAt(0).toUpperCase();
  const key = cleanName.toLowerCase();

  let palette = BRAND_PALETTES[key];
  if (!palette) {
    let hash = 0;
    for (let i = 0; i < cleanName.length; i++) {
      hash = cleanName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % COLOR_ROTATION.length;
    palette = COLOR_ROTATION[index];
  }

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs font-semibold rounded-md',
    md: 'w-9 h-9 text-sm font-semibold rounded-lg',
    lg: 'w-11 h-11 text-base font-bold rounded-xl',
    xl: 'w-14 h-14 text-xl font-bold rounded-2xl',
  };

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 border select-none ${palette.bg} ${palette.text} ${palette.border} ${sizeClasses[size]} ${className}`}
      aria-label={cleanName}
    >
      <span>{initial}</span>
    </div>
  );
};
