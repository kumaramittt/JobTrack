import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  LayoutGrid,
  List,
  ArrowUpDown,
  Calendar,
  MapPin,
  DollarSign,
  ExternalLink,
  Edit2,
  Trash2,
  FileText,
  UserCheck,
  RotateCcw,
} from 'lucide-react';
import { useJobContext } from '../context/JobContext';
import { JobApplication, JobStatus, JobType } from '../types/job';
import { StatusBadge } from '../components/StatusBadge';
import { JobTypeBadge } from '../components/JobTypeBadge';
import { CompanyAvatar } from '../components/CompanyAvatar';
import { EmptyState } from '../components/EmptyState';
import { ApplicationModal } from '../components/ApplicationModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';

type SortOption = 'date-desc' | 'date-asc' | 'company-asc' | 'company-desc';

export const MyApplicationsPage: React.FC = () => {
  const {
    applications,
    searchQuery,
    setSearchQuery,
    updateApplication,
    deleteApplication,
    addApplication,
    resetDemoData,
  } = useJobContext();

  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedJobType, setSelectedJobType] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');

  const [activeEditJob, setActiveEditJob] = useState<JobApplication | null>(null);
  const [jobToDelete, setJobToDelete] = useState<JobApplication | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Status counts for filter tabs
  const statusCounts = useMemo(() => {
    return {
      All: applications.length,
      Applied: applications.filter((a) => a.status === 'Applied').length,
      Interview: applications.filter((a) => a.status === 'Interview').length,
      Selected: applications.filter((a) => a.status === 'Selected').length,
      Rejected: applications.filter((a) => a.status === 'Rejected').length,
    };
  }, [applications]);

  // Filter and sort applications
  const filteredApplications = useMemo(() => {
    return applications
      .filter((app) => {
        // Search filter (company, role, location, notes)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchCompany = app.company.toLowerCase().includes(q);
          const matchRole = app.role.toLowerCase().includes(q);
          const matchLocation = app.location.toLowerCase().includes(q);
          const matchNotes = app.notes?.toLowerCase().includes(q);
          if (!matchCompany && !matchRole && !matchLocation && !matchNotes) {
            return false;
          }
        }

        // Status filter
        if (selectedStatus !== 'All' && app.status !== selectedStatus) {
          return false;
        }

        // Job type filter
        if (selectedJobType !== 'All' && app.jobType !== selectedJobType) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') {
          return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime();
        }
        if (sortBy === 'date-asc') {
          return new Date(a.appliedDate).getTime() - new Date(b.appliedDate).getTime();
        }
        if (sortBy === 'company-asc') {
          return a.company.localeCompare(b.company);
        }
        if (sortBy === 'company-desc') {
          return b.company.localeCompare(a.company);
        }
        return 0;
      });
  }, [applications, searchQuery, selectedStatus, selectedJobType, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedStatus('All');
    setSelectedJobType('All');
    setSortBy('date-desc');
  };

  const hasActiveFilters =
    Boolean(searchQuery.trim()) || selectedStatus !== 'All' || selectedJobType !== 'All';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            My Applications
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage and organize all your job submissions, interviews, and offers in one place.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-600/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Application</span>
        </button>
      </div>

      {/* Filter and Search Bar Section */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3.5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by company or job title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white placeholder-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ×
              </button>
            )}
          </div>

          {/* Job Type Dropdown & Sort */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Job Type */}
            <select
              value={selectedJobType}
              onChange={(e) => setSelectedJobType(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <option value="All">All Job Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Internship">Internship</option>
              <option value="Remote">Remote</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <option value="date-desc">Newest Date</option>
              <option value="date-asc">Oldest Date</option>
              <option value="company-asc">Company (A-Z)</option>
              <option value="company-desc">Company (Z-A)</option>
            </select>

            {/* View Mode Switcher (Table vs Cards) */}
            <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-medium'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Table view"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-medium'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Cards view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Status Filter Segmented Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 scrollbar-none text-xs">
          {(['All', 'Applied', 'Interview', 'Selected', 'Rejected'] as const).map((status) => {
            const isSelected = selectedStatus === status;
            const count = statusCounts[status] || 0;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{status === 'Selected' ? 'Selected / Offer' : status}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected
                      ? 'bg-indigo-700 text-white'
                      : 'bg-slate-200/70 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="ml-auto text-xs text-rose-500 hover:text-rose-600 dark:text-rose-400 font-medium whitespace-nowrap hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Count & Current Active View */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <span>
          Showing <strong className="text-slate-900 dark:text-white">{filteredApplications.length}</strong> of{' '}
          {applications.length} applications
        </span>
      </div>

      {/* EMPTY STATE */}
      {filteredApplications.length === 0 ? (
        <div className="p-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <EmptyState
            title={hasActiveFilters ? 'No matching job applications' : 'No job applications recorded'}
            description={
              hasActiveFilters
                ? 'Try adjusting your search query, status, or job type filters to find what you are looking for.'
                : 'Get started by adding your first job application or restore demo records.'
            }
            onAddClick={() => setIsAddModalOpen(true)}
            onResetDemoClick={resetDemoData}
            actionText="Add Application"
          />
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-5">Company</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Salary</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {filteredApplications.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    {/* Company */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <CompanyAvatar name={app.company} size="sm" />
                        <div>
                          <span className="font-semibold text-slate-900 dark:text-white block">
                            {app.company}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {app.location}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                      <div>
                        <span>{app.role}</span>
                        {app.notes && (
                          <span className="block text-[11px] text-slate-400 truncate max-w-xs">
                            {app.notes}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Type */}
                    <td className="py-3.5 px-4">
                      <JobTypeBadge type={app.jobType} />
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                      {app.appliedDate}
                    </td>

                    {/* Status (interactive quick update) */}
                    <td className="py-3.5 px-4">
                      <StatusBadge
                        status={app.status}
                        interactive={true}
                        onStatusChange={(newStatus) =>
                          updateApplication(app.id, { status: newStatus })
                        }
                      />
                    </td>

                    {/* Salary */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                      {app.salaryRange || '—'}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100">
                        {app.jobLink && (
                          <a
                            href={app.jobLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md transition-colors"
                            title="Visit job posting"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => setActiveEditJob(app)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md transition-colors cursor-pointer"
                          title="Edit application"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setJobToDelete(app)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md transition-colors cursor-pointer"
                          title="Delete application"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredApplications.map((app) => (
            <div
              key={app.id}
              className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Card Top: Avatar, Company, Status */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <CompanyAvatar name={app.company} size="md" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {app.company}
                      </h3>
                      <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        {app.role}
                      </p>
                    </div>
                  </div>
                  <StatusBadge
                    status={app.status}
                    size="sm"
                    interactive={true}
                    onStatusChange={(newStatus) =>
                      updateApplication(app.id, { status: newStatus })
                    }
                  />
                </div>

                {/* Details & Tags */}
                <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4 pt-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{app.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono text-[11px]">Applied {app.appliedDate}</span>
                  </div>
                  {app.salaryRange && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                        {app.salaryRange}
                      </span>
                    </div>
                  )}
                  {app.contactPerson && (
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">Contact: {app.contactPerson}</span>
                    </div>
                  )}
                </div>

                {/* Notes if any */}
                {app.notes && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80 mb-4 line-clamp-3 text-left">
                    {app.notes}
                  </p>
                )}
              </div>

              {/* Card Footer: JobType + Action buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <JobTypeBadge type={app.jobType} />
                <div className="flex items-center gap-1.5">
                  {app.jobLink && (
                    <a
                      href={app.jobLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md transition-colors"
                      title="Visit job post"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveEditJob(app)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setJobToDelete(app)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {activeEditJob && (
        <ApplicationModal
          isOpen={Boolean(activeEditJob)}
          application={activeEditJob}
          onClose={() => setActiveEditJob(null)}
          onDelete={(app) => {
            setActiveEditJob(null);
            setJobToDelete(app);
          }}
          onSave={(data) => {
            updateApplication(activeEditJob.id, data);
            setActiveEditJob(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(jobToDelete)}
        application={jobToDelete}
        onClose={() => setJobToDelete(null)}
        onConfirm={(appToDelete) => {
          if (appToDelete && appToDelete.id) {
            deleteApplication(appToDelete.id);
          }
          setJobToDelete(null);
        }}
      />

      {/* Add Modal */}
      <ApplicationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={(data) => {
          addApplication(data);
          setIsAddModalOpen(false);
        }}
      />
    </div>
  );
};
