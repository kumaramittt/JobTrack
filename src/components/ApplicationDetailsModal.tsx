import React from 'react';
import {
  X,
  Building2,
  Briefcase,
  MapPin,
  Calendar,
  ExternalLink,
  DollarSign,
  FileText,
  UserCheck,
  Mail,
  Edit2,
  Trash2,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { JobApplication, JobStatus } from '../types/job';
import { CompanyAvatar } from './CompanyAvatar';
import { StatusBadge } from './StatusBadge';
import { JobTypeBadge } from './JobTypeBadge';

interface ApplicationDetailsModalProps {
  isOpen: boolean;
  application: JobApplication | null;
  onClose: () => void;
  onEdit: (application: JobApplication) => void;
  onDelete: (application: JobApplication) => void;
  onStatusChange?: (newStatus: JobStatus) => void;
}

export const ApplicationDetailsModal: React.FC<ApplicationDetailsModalProps> = ({
  isOpen,
  application,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  if (!isOpen || !application) return null;

  // Format date nicely e.g., "Nov 01, 2026"
  const formatDisplayDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
        }
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-2xl my-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-details-title"
      >
        {/* Modal Top Header with Company Banner */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5 sm:gap-4 min-w-0">
              <CompanyAvatar name={application.company} size="lg" />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    {application.company}
                  </span>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <JobTypeBadge type={application.jobType} />
                </div>
                <h2
                  id="modal-details-title"
                  className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate"
                >
                  {application.role}
                </h2>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{application.location}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shrink-0"
              aria-label="Close details"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Status Bar */}
          <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Current Status:
              </span>
              <StatusBadge
                status={application.status}
                size="md"
                interactive={Boolean(onStatusChange)}
                onStatusChange={onStatusChange}
              />
            </div>

            {application.jobLink && (
              <a
                href={application.jobLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-lg transition-colors"
              >
                <span>Job Posting</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Applied Date */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Calendar className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Applied Date
                </span>
              </div>
              <p className="text-xs font-mono font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                {formatDisplayDate(application.appliedDate)}
              </p>
            </div>

            {/* Salary */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <DollarSign className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Compensation
                </span>
              </div>
              <p className="text-xs font-mono font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                {application.salaryRange || 'Not specified'}
              </p>
            </div>

            {/* Interview Date if present */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Interview Date
                </span>
              </div>
              <p className="text-xs font-mono font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                {application.interviewDate
                  ? formatDisplayDate(application.interviewDate)
                  : 'None scheduled'}
              </p>
            </div>
          </div>

          {/* Recruiter / Contact Info */}
          {(application.contactPerson || application.contactEmail) && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-indigo-500" />
                <span>Contact & Recruiter Details</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {application.contactPerson && (
                  <div>
                    <span className="text-slate-400 text-[11px] block">Contact Person</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {application.contactPerson}
                    </span>
                  </div>
                )}
                {application.contactEmail && (
                  <div>
                    <span className="text-slate-400 text-[11px] block">Email Address</span>
                    <a
                      href={`mailto:${application.contactEmail}`}
                      className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 mt-0.5 truncate"
                    >
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{application.contactEmail}</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Full Job Description & Notes Section */}
          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 bg-white dark:bg-slate-900">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Job Description & Application Notes</span>
            </h3>

            {application.notes ? (
              <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-lg border border-slate-100 dark:border-slate-800/60 font-sans">
                {application.notes}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400 italic bg-slate-50/50 dark:bg-slate-800/20 rounded-lg border border-dashed border-slate-200 dark:border-slate-800">
                No description or notes recorded for this application. Click &quot;Edit Application&quot; to add details.
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/30 dark:bg-slate-800/20 shrink-0">
          <button
            type="button"
            onClick={() => {
              onDelete(application);
              onClose();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onEdit(application);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all cursor-pointer hover:shadow-md"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Application</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
