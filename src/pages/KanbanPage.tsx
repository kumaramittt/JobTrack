import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Calendar,
  MapPin,
  DollarSign,
  ExternalLink,
  Edit2,
  Trash2,
  Eye,
  GripVertical,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  MoreHorizontal,
  ArrowRight,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { useJobContext } from '../context/JobContext';
import { JobApplication, JobStatus, JobType } from '../types/job';
import { CompanyAvatar } from '../components/CompanyAvatar';
import { JobTypeBadge } from '../components/JobTypeBadge';
import { ApplicationDetailsModal } from '../components/ApplicationDetailsModal';
import { ApplicationModal } from '../components/ApplicationModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { formatDisplayDate, getTodayDateString } from '../utils/date';

interface KanbanColumnConfig {
  id: JobStatus;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  badgeBg: string;
  badgeText: string;
  columnBorder: string;
  dropHighlight: string;
}

const COLUMNS: KanbanColumnConfig[] = [
  {
    id: 'Applied',
    title: 'Applied',
    subtitle: 'Under recruiter review',
    icon: Send,
    badgeBg: 'bg-blue-100 dark:bg-blue-950/60',
    badgeText: 'text-blue-700 dark:text-blue-300',
    columnBorder: 'border-blue-200 dark:border-blue-900/60',
    dropHighlight: 'bg-blue-50/70 dark:bg-blue-950/30 ring-2 ring-blue-500/40',
  },
  {
    id: 'Interview',
    title: 'Interview',
    subtitle: 'Active rounds & screens',
    icon: Clock,
    badgeBg: 'bg-amber-100 dark:bg-amber-950/60',
    badgeText: 'text-amber-700 dark:text-amber-300',
    columnBorder: 'border-amber-200 dark:border-amber-900/60',
    dropHighlight: 'bg-amber-50/70 dark:bg-amber-950/30 ring-2 ring-amber-500/40',
  },
  {
    id: 'Selected',
    title: 'Selected / Offer',
    subtitle: 'Offer extended & accepted',
    icon: CheckCircle2,
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/60',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    columnBorder: 'border-emerald-200 dark:border-emerald-900/60',
    dropHighlight: 'bg-emerald-50/70 dark:bg-emerald-950/30 ring-2 ring-emerald-500/40',
  },
  {
    id: 'Rejected',
    title: 'Rejected',
    subtitle: 'Archived opportunities',
    icon: XCircle,
    badgeBg: 'bg-rose-100 dark:bg-rose-950/60',
    badgeText: 'text-rose-700 dark:text-rose-300',
    columnBorder: 'border-rose-200 dark:border-rose-900/60',
    dropHighlight: 'bg-rose-50/70 dark:bg-rose-950/30 ring-2 ring-rose-500/40',
  },
];

export const KanbanPage: React.FC = () => {
  const {
    applications,
    updateApplication,
    deleteApplication,
    addApplication,
    showToast,
  } = useJobContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJobType, setSelectedJobType] = useState<string>('All');

  // Drag and drop state
  const [draggedJobId, setDraggedJobId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<JobStatus | null>(null);

  // Modals state
  const [activeViewJob, setActiveViewJob] = useState<JobApplication | null>(null);
  const [activeEditJob, setActiveEditJob] = useState<JobApplication | null>(null);
  const [jobToDelete, setJobToDelete] = useState<JobApplication | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addInitialStatus, setAddInitialStatus] = useState<JobStatus>('Applied');

  // Mobile quick move menu open card ID
  const [openMoveMenuId, setOpenMoveMenuId] = useState<string | null>(null);

  // Filter applications by search query and job type
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
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
      if (selectedJobType !== 'All' && app.jobType !== selectedJobType) {
        return false;
      }
      return true;
    });
  }, [applications, searchQuery, selectedJobType]);

  // Group applications by status
  const columnsData = useMemo(() => {
    const map: Record<JobStatus, JobApplication[]> = {
      Applied: [],
      Interview: [],
      Selected: [],
      Rejected: [],
    };

    filteredApplications.forEach((app) => {
      if (map[app.status]) {
        map[app.status].push(app);
      } else {
        map['Applied'].push(app);
      }
    });

    // Sort cards by date descending
    Object.keys(map).forEach((key) => {
      map[key as JobStatus].sort(
        (a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime()
      );
    });

    return map;
  }, [filteredApplications]);

  // Handle Drag & Drop move
  const handleMoveJob = (jobId: string, newStatus: JobStatus) => {
    const job = applications.find((a) => a.id === jobId);
    if (!job) return;

    if (job.status === newStatus) return; // No change

    updateApplication(jobId, { status: newStatus });
    showToast(`Moved "${job.role}" at ${job.company} to ${newStatus}.`, 'success');
  };

  // Drag start
  const handleDragStart = (e: React.DragEvent, jobId: string) => {
    e.dataTransfer.setData('text/plain', jobId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedJobId(jobId);
  };

  // Drag over column
  const handleDragOverColumn = (e: React.DragEvent, status: JobStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== status) {
      setDragOverColumn(status);
    }
  };

  // Drag leave column
  const handleDragLeaveColumn = (e: React.DragEvent) => {
    // Only clear if leaving the column element itself
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverColumn(null);
    }
  };

  // Drop on column
  const handleDropOnColumn = (e: React.DragEvent, status: JobStatus) => {
    e.preventDefault();
    const jobId = e.dataTransfer.getData('text/plain') || draggedJobId;
    if (jobId) {
      handleMoveJob(jobId, status);
    }
    setDragOverColumn(null);
    setDraggedJobId(null);
  };

  const hasActiveFilters = Boolean(searchQuery.trim()) || selectedJobType !== 'All';

  return (
    <div className="space-y-6 max-w-7xl mx-auto flex flex-col h-full">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Kanban Board
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Visualize your application workflow. Drag and drop cards between stages to update status in real-time.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setAddInitialStatus('Applied');
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-600/20 transition-all cursor-pointer self-start sm:self-auto hover:shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add Application</span>
        </button>
      </div>

      {/* Filter and Search Bar Section */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by company, role, location or notes..."
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

          {/* Job Type Dropdown */}
          <div className="flex items-center gap-2">
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

            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedJobType('All');
                }}
                className="px-3 py-2 text-xs text-rose-500 hover:text-rose-600 dark:text-rose-400 font-medium hover:underline cursor-pointer whitespace-nowrap"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Column Quick Statistics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px]">
          {COLUMNS.map((col) => {
            const count = columnsData[col.id]?.length || 0;
            return (
              <div
                key={col.id}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300"
              >
                <span className="font-medium truncate">{col.title}</span>
                <span className={`px-2 py-0.2 rounded-full font-mono font-bold ${col.badgeBg} ${col.badgeText}`}>
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* KANBAN BOARD COLUMNS CONTAINER */}
      <div className="flex-1 pb-4">
        {/* Horizontal scrollable track on small/tablet devices, grid on XL screens */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {COLUMNS.map((col) => {
            const columnApps = columnsData[col.id] || [];
            const isDragTarget = dragOverColumn === col.id;
            const Icon = col.icon;

            return (
              <div
                key={col.id}
                onDragOver={(e) => handleDragOverColumn(e, col.id)}
                onDragLeave={handleDragLeaveColumn}
                onDrop={(e) => handleDropOnColumn(e, col.id)}
                className={`flex flex-col rounded-2xl bg-slate-100/70 dark:bg-slate-900/50 border transition-all duration-200 min-h-[520px] ${
                  isDragTarget
                    ? `${col.dropHighlight} ${col.columnBorder}`
                    : 'border-slate-200/80 dark:border-slate-800'
                }`}
              >
                {/* Column Header */}
                <div className="p-3.5 border-b border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between bg-white/70 dark:bg-slate-900/80 rounded-t-2xl">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${col.badgeBg} ${col.badgeText}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {col.title}
                        </h3>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${col.badgeBg} ${col.badgeText}`}
                        >
                          {columnApps.length}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">{col.subtitle}</p>
                    </div>
                  </div>

                  {/* Quick Add To Column Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setAddInitialStatus(col.id);
                      setIsAddModalOpen(true);
                    }}
                    className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                    title={`Add new application to ${col.title}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Cards Container */}
                <div className="p-2.5 space-y-2.5 flex-1 overflow-y-auto max-h-[75vh]">
                  {columnApps.length === 0 ? (
                    /* Column Empty State */
                    <div
                      className={`h-48 border border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center transition-colors ${
                        isDragTarget
                          ? 'border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20'
                          : 'border-slate-300 dark:border-slate-800 bg-white/40 dark:bg-slate-900/30'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-200/60 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-2">
                        <Icon className="w-4 h-4" />
                      </div>
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        No applications in {col.title}
                      </p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 max-w-[180px]">
                        Drag cards here or click + to add an opportunity
                      </p>
                    </div>
                  ) : (
                    columnApps.map((app) => {
                      const isBeingDragged = draggedJobId === app.id;
                      const isMoveMenuOpen = openMoveMenuId === app.id;

                      return (
                        <div
                          key={app.id}
                          draggable={true}
                          onDragStart={(e) => handleDragStart(e, app.id)}
                          onDragEnd={() => setDraggedJobId(null)}
                          className={`group relative p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${
                            isBeingDragged ? 'opacity-40 scale-95 border-indigo-400' : ''
                          }`}
                        >
                          {/* Card Top: Avatar, Company, Move button */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <CompanyAvatar name={app.company} size="sm" />
                              <div className="min-w-0">
                                <h4
                                  onClick={() => setActiveViewJob(app)}
                                  className="text-xs font-bold text-slate-900 dark:text-white truncate hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
                                >
                                  {app.company}
                                </h4>
                                <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 block truncate">
                                  {app.role}
                                </span>
                              </div>
                            </div>

                            {/* Drag Indicator & Quick Move Dropdown Trigger */}
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenMoveMenuId(isMoveMenuOpen ? null : app.id)
                                }
                                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                                title="Move to another column"
                              >
                                <MoreHorizontal className="w-3.5 h-3.5" />
                              </button>
                              <div className="text-slate-300 dark:text-slate-600 p-0.5 cursor-grab">
                                <GripVertical className="w-3.5 h-3.5" />
                              </div>
                            </div>
                          </div>

                          {/* Mobile/Quick Move Popup Menu */}
                          {isMoveMenuOpen && (
                            <div className="absolute right-3 top-10 z-30 w-44 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-1.5 animate-in fade-in zoom-in-95 duration-100">
                              <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                Move status to:
                              </div>
                              {COLUMNS.map((targetCol) => {
                                const isCurrent = app.status === targetCol.id;
                                return (
                                  <button
                                    key={targetCol.id}
                                    type="button"
                                    disabled={isCurrent}
                                    onClick={() => {
                                      handleMoveJob(app.id, targetCol.id);
                                      setOpenMoveMenuId(null);
                                    }}
                                    className={`w-full text-left px-2 py-1.5 text-xs rounded-lg flex items-center justify-between transition-colors ${
                                      isCurrent
                                        ? 'opacity-40 cursor-default bg-slate-50 dark:bg-slate-800'
                                        : 'hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 cursor-pointer'
                                    }`}
                                  >
                                    <span>{targetCol.title}</span>
                                    {isCurrent && <span className="text-[10px] text-slate-400">Current</span>}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {/* Card Details: Location, Date, Salary */}
                          <div className="space-y-1 my-2 text-[11px] text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-1.5 truncate">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{app.location}</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="font-mono whitespace-nowrap">
                                Applied {formatDisplayDate(app.appliedDate)}
                              </span>
                            </div>

                            {app.salaryRange && (
                              <div className="flex items-center gap-1.5">
                                <DollarSign className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap font-medium">
                                  {app.salaryRange}
                                </span>
                              </div>
                            )}

                            {app.interviewDate && app.status === 'Interview' && (
                              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                                <Clock className="w-3 h-3 shrink-0" />
                                <span className="font-mono whitespace-nowrap">
                                  Interview: {formatDisplayDate(app.interviewDate)}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Notes Preview if available */}
                          {app.notes && (
                            <p
                              onClick={() => setActiveViewJob(app)}
                              className="text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800/80 mb-2 line-clamp-2 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 leading-snug"
                              title="Click to view full notes"
                            >
                              {app.notes}
                            </p>
                          )}

                          {/* Card Footer: JobTypeBadge + Action Buttons */}
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <JobTypeBadge type={app.jobType} />

                            <div className="flex items-center gap-0.5 opacity-90 group-hover:opacity-100">
                              {/* Open Details Button */}
                              <button
                                type="button"
                                onClick={() => setActiveViewJob(app)}
                                className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                                title="View complete application details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* Job Posting Link */}
                              {app.jobLink && (
                                <a
                                  href={app.jobLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                                  title="Visit job posting"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}

                              {/* Edit Button */}
                              <button
                                type="button"
                                onClick={() => setActiveEditJob(app)}
                                className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                                title="Edit application"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Button */}
                              <button
                                type="button"
                                onClick={() => setJobToDelete(app)}
                                className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors cursor-pointer"
                                title="Delete application"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

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
        application={{
          id: '',
          company: '',
          role: '',
          location: '',
          jobType: 'Full-time',
          appliedDate: getTodayDateString(),
          status: addInitialStatus,
          createdAt: '',
          updatedAt: '',
        }}
        onClose={() => setIsAddModalOpen(false)}
        onSave={(data) => {
          addApplication(data);
          setIsAddModalOpen(false);
        }}
      />
    </div>
  );
};
