import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Briefcase,
  MapPin,
  Calendar,
  Link as LinkIcon,
  DollarSign,
  FileText,
  UserCheck,
  Mail,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useJobContext } from '../context/JobContext';
import { JobStatus, JobType } from '../types/job';

const statusOptions: { value: JobStatus; label: string; desc: string }[] = [
  { value: 'Applied', label: 'Applied', desc: 'Application submitted, pending response' },
  { value: 'Interview', label: 'Interview', desc: 'Screening or technical interview scheduled' },
  { value: 'Selected', label: 'Selected / Offer', desc: 'Offer letter extended or accepted' },
  { value: 'Rejected', label: 'Rejected', desc: 'Application not moving forward' },
];

const jobTypeOptions: JobType[] = ['Full-time', 'Internship', 'Remote', 'Part-time', 'Contract'];

export const AddApplicationPage: React.FC = () => {
  const { addApplication } = useJobContext();
  const navigate = useNavigate();

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
    jobLink?: string;
  }>({});

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required.';
    }
    if (!formData.role.trim()) {
      newErrors.role = 'Job title / role is required.';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required. Choose Remote, Hybrid, or enter an office location.';
    }
    if (!formData.appliedDate) {
      newErrors.appliedDate = 'Please select the date applied.';
    }
    if (formData.jobLink && !/^https?:\/\//i.test(formData.jobLink.trim())) {
      newErrors.jobLink = 'Link must start with http:// or https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    if (!validate()) return;

    addApplication({
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
      interviewDate: formData.interviewDate || undefined,
    });

    setSavedSuccess(true);
    setSubmitAttempted(false);
  };

  const handleResetForm = () => {
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
    setSavedSuccess(false);
    setSubmitAttempted(false);
  };

  const hasFormErrors = Object.keys(errors).length > 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button and page title */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tracker</span>
        </button>

        <span className="text-xs text-slate-400 font-medium">New Job Entry</span>
      </div>

      {/* Global Error Banner */}
      {submitAttempted && hasFormErrors && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 flex items-start gap-3 text-rose-800 dark:text-rose-300 animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold block mb-1">Please correct the highlighted fields:</span>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-700 dark:text-rose-400">
              {errors.company && <li>{errors.company}</li>}
              {errors.role && <li>{errors.role}</li>}
              {errors.location && <li>{errors.location}</li>}
              {errors.appliedDate && <li>{errors.appliedDate}</li>}
              {errors.jobLink && <li>{errors.jobLink}</li>}
            </ul>
          </div>
        </div>
      )}

      {/* Global Success Banner */}
      {savedSuccess && (
        <div className="p-5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-emerald-800 dark:text-emerald-300 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Application Saved Successfully!
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                The job application was logged and synchronized with your dashboard pipeline.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetForm}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Add Another
            </button>
            <button
              type="button"
              onClick={() => navigate('/applications')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <span>View in Applications</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Form Container */}
      <div className="p-5 sm:p-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Add New Job Application
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Fill in the details below to log and track this job opportunity in your dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Core Job Details */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span>01. Opportunity Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Company Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Company Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. Google, Stripe, Apple"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className={`w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/70 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white placeholder-slate-400 ${
                      errors.company
                        ? 'border-rose-400 dark:border-rose-700'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                </div>
                {errors.company && (
                  <p className="mt-1 text-xs text-rose-500 font-medium">{errors.company}</p>
                )}
              </div>

              {/* Job Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Job Title <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. Software Engineer, React Developer"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className={`w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/70 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white placeholder-slate-400 ${
                      errors.role
                        ? 'border-rose-400 dark:border-rose-700'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                </div>
                {errors.role && (
                  <p className="mt-1 text-xs text-rose-500 font-medium">{errors.role}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {/* Job Location */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Job Location <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400">Quick preset:</span>
                </div>

                {/* Preset Chips */}
                <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                  {[
                    { label: 'Remote', val: 'Remote' },
                    { label: 'Hybrid', val: 'Hybrid' },
                    { label: 'On-site / Office', val: 'Office (On-site)' },
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
                        setErrors((prev) => ({ ...prev, location: undefined }));
                      }}
                      className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                    >
                      + {preset.label}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. Remote, San Francisco, CA or Hybrid"
                    value={formData.location}
                    onChange={(e) => {
                      setFormData({ ...formData, location: e.target.value });
                      if (errors.location) setErrors({ ...errors, location: undefined });
                    }}
                    className={`w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/70 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white placeholder-slate-400 ${
                      errors.location
                        ? 'border-rose-400 dark:border-rose-700'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                </div>
                {errors.location && (
                  <p className="mt-1 text-xs text-rose-500 font-medium">{errors.location}</p>
                )}
              </div>

              {/* Job Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Job Type
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 pt-0.5 sm:pt-6">
                  {jobTypeOptions.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, jobType: type })}
                      className={`py-1.5 px-2 text-[11px] font-medium rounded-lg border transition-all text-center cursor-pointer ${
                        formData.jobType === type
                          ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-400 text-indigo-700 dark:text-indigo-300 font-semibold'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Timeline & Status */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              02. Timeline & Status
            </h3>

            {/* Application Status Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mb-4">
              {statusOptions.map((opt) => {
                const isSelected = formData.status === opt.value;
                return (
                  <div
                    key={opt.value}
                    onClick={() => setFormData({ ...formData, status: opt.value })}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500/30'
                        : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {opt.label}
                      </span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      {opt.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Application Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Application Date <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    value={formData.appliedDate}
                    onChange={(e) => setFormData({ ...formData, appliedDate: e.target.value })}
                    className={`w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/70 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white ${
                      errors.appliedDate
                        ? 'border-rose-400 dark:border-rose-700'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                </div>
                {errors.appliedDate && (
                  <p className="mt-1 text-xs text-rose-500 font-medium">{errors.appliedDate}</p>
                )}
              </div>

              {/* Salary Range */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Salary Range (optional)
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. $130,000 - $150,000"
                    value={formData.salaryRange}
                    onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Interview Date (optional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Interview Date (optional)
                </label>
                <input
                  type="date"
                  value={formData.interviewDate}
                  onChange={(e) => setFormData({ ...formData, interviewDate: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Links, Contacts & Notes */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              03. Additional Information & Notes
            </h3>

            {/* Job Link */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Job Posting Link / URL (optional)
              </label>
              <div className="relative">
                <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  placeholder="https://careers.company.com/job/12345"
                  value={formData.jobLink}
                  onChange={(e) => setFormData({ ...formData, jobLink: e.target.value })}
                  className={`w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/70 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white placeholder-slate-400 ${
                    errors.jobLink
                      ? 'border-rose-400 dark:border-rose-700'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
              </div>
              {errors.jobLink && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.jobLink}</p>
              )}
            </div>

            {/* Recruiter / Contact info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Recruiter / Contact Name (optional)
                </label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. Alex Johnson (Talent Partner)"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white placeholder-slate-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Recruiter Email (optional)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="alex.j@company.com"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white placeholder-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Application Notes (optional)
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <textarea
                  rows={4}
                  placeholder="Record referral sources, interview feedback, required technical stack, preparation links, or follow-up schedule..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white placeholder-slate-400 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/applications')}
              className="px-5 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-600/30 transition-all cursor-pointer hover:shadow-md"
            >
              Save Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
