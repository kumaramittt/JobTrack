import React from 'react';
import { JobType } from '../types/job';
import { Briefcase, GraduationCap, Globe, Clock, FileSpreadsheet } from 'lucide-react';

interface JobTypeBadgeProps {
  type: JobType;
  className?: string;
}

export const JobTypeBadge: React.FC<JobTypeBadgeProps> = ({ type, className = '' }) => {
  const getIcon = () => {
    switch (type) {
      case 'Internship':
        return <GraduationCap className="w-3 h-3 text-violet-500" />;
      case 'Remote':
        return <Globe className="w-3 h-3 text-cyan-500" />;
      case 'Part-time':
        return <Clock className="w-3 h-3 text-amber-500" />;
      case 'Contract':
        return <FileSpreadsheet className="w-3 h-3 text-indigo-500" />;
      case 'Full-time':
      default:
        return <Briefcase className="w-3 h-3 text-blue-500" />;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 ${className}`}
    >
      {getIcon()}
      <span>{type}</span>
    </span>
  );
};
