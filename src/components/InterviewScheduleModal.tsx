import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  Video,
  MapPin,
  Building2,
  Briefcase,
  Link as LinkIcon,
  FileText,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { JobApplication } from '../types/job';
import { CompanyAvatar } from './CompanyAvatar';

interface InterviewScheduleModalProps {
  isOpen: boolean;
  application: JobApplication | null;
  availableApplications?: JobApplication[]; // Applications available to schedule for
  initialDate?: string; // Preselected date from calendar click (YYYY-MM-DD)
  onClose: () => void;
  onSave: (applicationId: string, interviewDetails: {
    interviewDate: string;
    interviewTime?: string;
    interviewType?: 'Online' | 'Offline';
    interviewLink?: string;
    interviewStatus?: 'Scheduled' | 'Completed' | 'Rescheduled' | 'Cancelled';
  }) => void;
  onRemove?: (applicationId: string) => void;
}

export const InterviewScheduleModal: React.FC<InterviewScheduleModalProps> = ({
  isOpen,
  application,
  availableApplications = [],
  initialDate,
  onClose,
  onSave,
  onRemove,
}) => {
  const isEditing = Boolean(application && application.interviewDate);

  const [selectedAppId, setSelectedAppId] = useState<string>(application ? application.id : '');
  const [interviewDate, setInterviewDate] = useState<string>(
    application?.interviewDate || initialDate || new Date().toISOString().slice(0, 10)
  );
  const [interviewTime, setInterviewTime] = useState<string>(application?.interviewTime || '10:00');
  const [interviewType, setInterviewType] = useState<'Online' | 'Offline'>(
    application?.interviewType || 'Online'
  );
  const [interviewLink, setInterviewLink] = useState<string>(application?.interviewLink || '');
  const [interviewStatus, setInterviewStatus] = useState<
    'Scheduled' | 'Completed' | 'Rescheduled' | 'Cancelled'
  >(application?.interviewStatus || 'Scheduled');

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (application) {
      setSelectedAppId(application.id);
      setInterviewDate(application.interviewDate || initialDate || new Date().toISOString().slice(0, 10));
      setInterviewTime(application.interviewTime || '10:00');
      setInterviewType(application.interviewType || 'Online');
      setInterviewLink(application.interviewLink || '');
      setInterviewStatus(application.interviewStatus || 'Scheduled');
    } else {
      setSelectedAppId(availableApplications[0]?.id || '');
      setInterviewDate(initialDate || new Date().toISOString().slice(0, 10));
      setInterviewTime('10:00');
      setInterviewType('Online');
      setInterviewLink('');
      setInterviewStatus('Scheduled');
    }
    setError(null);
  }, [application, initialDate, isOpen, availableApplications]);

  if (!isOpen) return null;

  const currentApp = application || availableApplications.find((a) => a.id === selectedAppId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppId) {
      setError('Please select a job application to schedule an interview for.');
      return;
    }
    if (!interviewDate) {
      setError('Please select an interview date.');
      return;
    }

    onSave(selectedAppId, {
      interviewDate,
      interviewTime: interviewTime.trim() || undefined,
      interviewType,
      interviewLink: interviewLink.trim() || undefined,
      interviewStatus,
    });
    onClose();
  };

  const handleRemove = () => {
    if (currentApp && onRemove) {
      onRemove(currentApp.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-lg my-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-900">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {isEditing ? 'Edit Interview Schedule' : 'Schedule New Interview'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEditing
                  ? `Update interview details for ${currentApp?.company || 'job'}`
                  : 'Add interview date, time, and meeting link to your calendar'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-center gap-2 text-rose-800 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Job Application Selector (if not editing an existing specific application) */}
          {!application ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Select Job Application <span className="text-rose-500">*</span>
              </label>
              {availableApplications.length === 0 ? (
                <p className="text-slate-400 italic">No job applications available to schedule.</p>
              ) : (
                <select
                  value={selectedAppId}
                  onChange={(e) => setSelectedAppId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white cursor-pointer"
                >
                  {availableApplications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.company} – {app.role} ({app.status})
                    </option>
                  ))}
                </select>
              )}
            </div>
          ) : (
            /* Display Chosen Application Info */
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex items-center gap-3">
              <CompanyAvatar name={currentApp?.company || 'Company'} size="md" />
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                  {currentApp?.company}
                </span>
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold block truncate">
                  {currentApp?.role}
                </span>
                <span className="text-[11px] text-slate-400 block truncate">
                  {currentApp?.location}
                </span>
              </div>
            </div>
          )}

          {/* Interview Date & Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Interview Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Interview Time (optional)
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="time"
                  value={interviewTime}
                  onChange={(e) => setInterviewTime(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Interview Type Selector (Online vs Offline) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Interview Format / Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setInterviewType('Online')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  interviewType === 'Online'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500/30'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Online (Video Call)</span>
              </button>

              <button
                type="button"
                onClick={() => setInterviewType('Offline')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  interviewType === 'Offline'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500/30'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>In-person (On-site)</span>
              </button>
            </div>
          </div>

          {/* Meeting Link or Location Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {interviewType === 'Online'
                ? 'Video Meeting Link (Google Meet, Zoom, Teams)'
                : 'Office Address / Meeting Room'}
            </label>
            <div className="relative">
              {interviewType === 'Online' ? (
                <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              ) : (
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              )}
              <input
                type="text"
                placeholder={
                  interviewType === 'Online'
                    ? 'https://meet.google.com/abc-defg-hij'
                    : 'Building 4, 3rd Floor, Conference Room B'
                }
                value={interviewLink}
                onChange={(e) => setInterviewLink(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white placeholder-slate-400"
              />
            </div>
          </div>

          {/* Interview Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Interview Status
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {(['Scheduled', 'Completed', 'Rescheduled', 'Cancelled'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setInterviewStatus(st)}
                  className={`py-1.5 px-2 text-[11px] font-medium rounded-lg border transition-all text-center cursor-pointer ${
                    interviewStatus === st
                      ? st === 'Completed'
                        ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-400 text-emerald-700 dark:text-emerald-300 font-semibold'
                        : st === 'Cancelled'
                        ? 'bg-rose-50 dark:bg-rose-950 border-rose-400 text-rose-700 dark:text-rose-300 font-semibold'
                        : 'bg-amber-50 dark:bg-amber-950 border-amber-400 text-amber-700 dark:text-amber-300 font-semibold'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            {isEditing && onRemove ? (
              <button
                type="button"
                onClick={handleRemove}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Schedule</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all cursor-pointer hover:shadow-md"
              >
                {isEditing ? 'Save Changes' : 'Schedule Interview'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
