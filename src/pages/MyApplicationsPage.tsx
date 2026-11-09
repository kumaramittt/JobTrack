import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Eye,
  Kanban,
} from 'lucide-react';
import { useJobContext } from '../context/JobContext';
import { JobApplication, JobStatus, JobType } from '../types/job';
import { StatusBadge } from '../components/StatusBadge';
import { JobTypeBadge } from '../components/JobTypeBadge';
import { CompanyAvatar } from '../components/CompanyAvatar';
import { EmptyState } from '../components/EmptyState';
import { ApplicationModal } from '../components/ApplicationModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { ApplicationDetailsModal } from '../components/ApplicationDetailsModal';
import { formatDisplayDate } from '../utils/date';

type SortOption = 'date-desc' | 'date-asc' | 'company-asc' | 'company-desc';

export const MyApplicationsPage: React.FC = () => {
  const navigate = useNavigate();
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

  const [activeViewJob, setActiveViewJob] = useState<JobApplication | null>(null);
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

            {/* View Mode Switcher (Table vs Cards vs Kanban) */}
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
              <button
                type="button"
                onClick={() => navigate('/kanban')}
                className="p-1.5 rounded-md text-xs transition-colors cursor-pointer text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                title="Switch to Kanban Board"
              >
                <Kanban className="w-4 h-4" />
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
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[880px] text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-5 w-[22%]">Company</th>
                  <th className="py-3 px-4 w-[28%]">Role & Description</th>
                  <th className="py-3 px-4 w-[11%]">Type</th>
                  <th className="py-3 px-4 w-[13%] whitespace-nowrap">Applied Date</th>
                  <th className="py-3 px-4 w-[12%]">Status</th>
                  <th className="py-3 px-4 w-[14%] whitespace-nowrap">Salary</th>
                  <th className="py-3 px-5 text-right w-[10%] whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {filteredApplications.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    {/* Company */}
                    <td className="py-3.5 px-5 align-middle">
                      <div className="flex items-center gap-3">
                        <CompanyAvatar name={app.company} size="sm" />
                        <div className="min-w-0">
                          <span
                            onClick={() => setActiveViewJob(app)}
                            className="font-semibold text-slate-900 dark:text-white block truncate hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
                          >
                            {app.company}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{app.location}</span>
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Role & Notes Preview */}
                    <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200 align-middle">
                      <div>
                        <span
                          onClick={() => setActiveViewJob(app)}
                          className="font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors block"
                        >
                          {app.role}
                        </span>
                        {app.notes ? (
                          <p
                            onClick={() => setActiveViewJob(app)}
                            className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 max-w-sm cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5"
                            title="Click to read full description and notes"
                          >
                            <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{app.notes}</span>
                          </p>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">No description notes</span>
                        )}
                      </div>
                    </td>

                    {/* Type */}
                    <td className="py-3.5 px-4 align-middle">
                      <JobTypeBadge type={app.jobType} />
                    </td>

                    {/* Date (single-line) */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-mono text-[11px] whitespace-nowrap align-middle">
                      {formatDisplayDate(app.appliedDate)}
                    </td>

                    {/* Status (interactive quick update) */}
                    <td className="py-3.5 px-4 align-middle">
                      <StatusBadge
                        status={app.status}
                        interactive={true}
                        onStatusChange={(newStatus) =>
                          updateApplication(app.id, { status: newStatus })
                        }
                      />
                    </td>

                    {/* Salary (never wraps awkwardly) */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700 dark:text-slate-300 whitespace-nowrap align-middle">
                      {app.salaryRange ? (
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 whitespace-nowrap font-medium text-[11px]">
                          {app.salaryRange}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-right align-middle whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1 opacity-90 group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => setActiveViewJob(app)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                          title="View complete details and notes"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {app.jobLink && (
                          <a
                            href={app.jobLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                            title="Visit job posting"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => setActiveEditJob(app)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                          title="Edit application"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setJobToDelete(app)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md transition-colors cursor-pointer"
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
          {/* Mobile swipe helper */}
          <div className="sm:hidden px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-[11px] text-slate-400 text-center">
            Scroll horizontally to view all columns
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
                  <div className="flex items-center gap-3 min-w-0">
                    <CompanyAvatar name={app.company} size="md" />
                    <div className="min-w-0">
                      <h3
                        onClick={() => setActiveViewJob(app)}
                        className="text-sm font-bold text-slate-900 dark:text-white truncate cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        {app.company}
                      </h3>
                      <p
                        onClick={() => setActiveViewJob(app)}
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 truncate cursor-pointer hover:underline"
                      >
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
                    <span className="font-mono text-[11px] whitespace-nowrap">
                      Applied {formatDisplayDate(app.appliedDate)}
                    </span>
                  </div>
                  {app.salaryRange && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 whitespace-nowrap">
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
                  <div className="mb-4">
                    <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80 line-clamp-3 text-left leading-relaxed">
                      {app.notes}
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveViewJob(app)}
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline mt-1 font-medium inline-block cursor-pointer"
                    >
                      Read full description & notes →
                    </button>
                  </div>
                )}
              </div>

              {/* Card Footer: JobType + Action buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <JobTypeBadge type={app.jobType} />
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setActiveViewJob(app)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                    title="View details"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  {app.jobLink && (
                    <a
                      href={app.jobLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                      title="Visit job post"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveEditJob(app)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setJobToDelete(app)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md transition-colors cursor-pointer"
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

      {/* Details View Modal */}
      {activeViewJob && (
        <ApplicationDetailsModal
          isOpen={Boolean(activeViewJob)}
          application={activeViewJob}
          onClose={() => setActiveViewJob(null)}
          onEdit={(app) => {
            setActiveViewJob(null);
            setActiveEditJob(app);
          }}
          onDelete={(app) => {
            setActiveViewJob(null);
            setJobToDelete(app);
          }}
          onStatusChange={(newStatus) => {
            if (activeViewJob) {
              updateApplication(activeViewJob.id, { status: newStatus });
              setActiveViewJob({ ...activeViewJob, status: newStatus });
            }
          }}
        />
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
