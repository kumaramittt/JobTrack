import React, { useState, useEffect } from 'react';
import { JobApplication, JobStatus, JobType } from '../types/job';
import { X, Building2, Briefcase, MapPin, Calendar, Link as LinkIcon, DollarSign, FileText, UserCheck, Mail, Trash2 } from 'lucide-react';

interface ApplicationModalProps {
  isOpen: boolean;
  application?: JobApplication | null; // null/undefined for create mode
  onClose: () => void;
  onSave: (jobData: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDelete?: (application: JobApplication) => void;
}

const statusOptions: { value: JobStatus; label: string }[] = [
  { value: 'Applied', label: 'Applied' },
  { value: 'Interview', label: 'Interview' },
  { value: 'Selected', label: 'Selected / Offer' },
  { value: 'Rejected', label: 'Rejected' },
];

const jobTypeOptions: { value: JobType; label: string }[] = [
  { value: 'Full-time', label: 'Full-time' },
  { value: 'Internship', label: 'Internship' },
  { value: 'Part-time', label: 'Part-time' },
  { value: 'Remote', label: 'Remote' },
  { value: 'Contract', label: 'Contract' },
];

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  isOpen,
  application,
  onClose,
  onSave,
  onDelete,
}) => {
  const isEditing = Boolean(application);

  const [formData, setFormData] = useState({
    company: '',
    role: '',
    location: '',
    jobType: 'Full-time' as JobType,
    appliedDate: new Date().toISOString().slice(0, 10),
    status: 'Applied' as JobStatus,
    jobLink: '',
    salaryRange: '',
    notes: '',
    contactPerson: '',
    contactEmail: '',
    interviewDate: '',
  });

  const [errors, setErrors] = useState<{
    company?: string;
    role?: string;
    location?: string;
    appliedDate?: string;
  }>({});

  useEffect(() => {
    if (application) {
      setFormData({
        company: application.company || '',
        role: application.role || '',
        location: application.location || '',
        jobType: application.jobType || 'Full-time',
        appliedDate: application.appliedDate || new Date().toISOString().slice(0, 10),
        status: application.status || 'Applied',
        jobLink: application.jobLink || '',
        salaryRange: application.salaryRange || '',
        notes: application.notes || '',
        contactPerson: application.contactPerson || '',
        contactEmail: application.contactEmail || '',
        interviewDate: application.interviewDate || '',
      });
      setErrors({});
    } else {
      setFormData({
        company: '',
        role: '',
        location: '',
        jobType: 'Full-time',
        appliedDate: new Date().toISOString().slice(0, 10),
        status: 'Applied',
        jobLink: '',
        salaryRange: '',
        notes: '',
        contactPerson: '',
        contactEmail: '',
        interviewDate: '',
      });
      setErrors({});
    }
  }, [application, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required.';
    }
    if (!formData.role.trim()) {
      newErrors.role = 'Job title/role is required.';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required (e.g., Remote or City).';
    }
    if (!formData.appliedDate) {
      newErrors.appliedDate = 'Application date is required.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      company: formData.company.trim(),
      role: formData.role.trim(),
      location: formData.location.trim(),
      jobType: formData.jobType,
      appliedDate: formData.appliedDate,
      status: formData.status,
      jobLink: formData.jobLink.trim() || undefined,
      salaryRange: formData.salaryRange.trim() || undefined,
      notes: formData.notes.trim() || undefined,
      contactPerson: formData.contactPerson.trim() || undefined,
      contactEmail: formData.contactEmail.trim() || undefined,
      interviewDate: formData.interviewDate ? formData.interviewDate : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-2xl my-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {isEditing ? 'Edit Job Application' : 'Add New Job Application'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isEditing
                ? `Update application details for ${formData.company || 'the company'}`
                : 'Track a new opportunity with relevant timeline and notes.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Company Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Company Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Google, Stripe, Microsoft"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className={`w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white placeholder-slate-400 ${
                    errors.company ? 'border-rose-400 dark:border-rose-700' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
              </div>
              {errors.company && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.company}</p>
              )}
            </div>

            {/* Job Title / Role */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Job Title / Role <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Frontend Developer, SWE Intern"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className={`w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white placeholder-slate-400 ${
                    errors.role ? 'border-rose-400 dark:border-rose-700' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
              </div>
              {errors.role && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.role}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Job Location */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Location <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-1">
                  {[
                    { label: 'Remote', val: 'Remote' },
                    { label: 'Hybrid', val: 'Hybrid' },
                    { label: 'On-site', val: 'On-site' },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => {
                          if (!prev.location.trim()) return { ...prev, location: preset.val };
                          if (prev.location.toLowerCase().includes(preset.val.toLowerCase())) return prev;
                          return { ...prev, location: `${prev.location} (${preset.val})` };
                        });
                        setErrors((e) => ({ ...e, location: undefined }));
                      }}
                      className="px-1.5 py-0.5 text-[10px] rounded bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 cursor-pointer"
                    >
                      +{preset.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Remote, San Francisco, CA"
                  value={formData.location}
                  onChange={(e) => {
                    setFormData({ ...formData, location: e.target.value });
                    if (errors.location) setErrors({ ...errors, location: undefined });
                  }}
                  className={`w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white placeholder-slate-400 ${
                    errors.location ? 'border-rose-400 dark:border-rose-700' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
              </div>
              {errors.location && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.location}</p>
              )}
            </div>

            {/* Job Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Job Type
              </label>
              <select
                value={formData.jobType}
                onChange={(e) => setFormData({ ...formData, jobType: e.target.value as JobType })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white cursor-pointer"
              >
                {jobTypeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as JobStatus })}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white cursor-pointer"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Application Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Application Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={formData.appliedDate}
                  onChange={(e) => setFormData({ ...formData, appliedDate: e.target.value })}
                  className={`w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white ${
                    errors.appliedDate ? 'border-rose-400 dark:border-rose-700' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
              </div>
              {errors.appliedDate && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.appliedDate}</p>
              )}
            </div>

            {/* Salary Range */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Salary Range (optional)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. $120,000 - $140,000 or ₹10 LPA"
                  value={formData.salaryRange}
                  onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white placeholder-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Job Link */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Job Post Link / URL (optional)
            </label>
            <div className="relative">
              <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                placeholder="https://company.com/careers/job-id"
                value={formData.jobLink}
                onChange={(e) => setFormData({ ...formData, jobLink: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white placeholder-slate-400"
              />
            </div>
          </div>

          {/* Interview Details Section (shown especially if status is Interview) */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200/80 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-2.5">
              Contact & Interview Details (optional)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                  Interview Date
                </label>
                <input
                  type="date"
                  value={formData.interviewDate}
                  onChange={(e) => setFormData({ ...formData, interviewDate: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                  Recruiter / Contact Name
                </label>
                <div className="relative">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. Jane Doe"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full pl-7 pr-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                  Contact Email
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="recruiter@company.com"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full pl-7 pr-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notes & Follow-ups (optional)
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <textarea
                rows={3}
                placeholder="Mention referral contacts, key skills covered in interview, recruiter advice, preparation links, etc."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white placeholder-slate-400 resize-none"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
            {isEditing && application && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(application);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            ) : (
              <div />
            )}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                {isEditing ? 'Save Changes' : 'Save Application'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
