import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  ArrowRight,
  Calendar,
  ExternalLink,
  MoreVertical,
  Edit2,
  Trash2,
  Sparkles,
  Building2,
  TrendingUp,
  Eye,
  Kanban,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useJobContext } from '../context/JobContext';
import { JobApplication, JobStatus } from '../types/job';
import { StatusBadge } from '../components/StatusBadge';
import { JobTypeBadge } from '../components/JobTypeBadge';
import { CompanyAvatar } from '../components/CompanyAvatar';
import { EmptyState } from '../components/EmptyState';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { ApplicationModal } from '../components/ApplicationModal';
import { ApplicationDetailsModal } from '../components/ApplicationDetailsModal';

export const DashboardPage: React.FC = () => {
  const {
    applications,
    updateApplication,
    deleteApplication,
    addApplication,
    resetDemoData,
    theme,
  } = useJobContext();

  const navigate = useNavigate();

  const [activeEditJob, setActiveEditJob] = useState<JobApplication | null>(null);
  const [activeViewJob, setActiveViewJob] = useState<JobApplication | null>(null);
  const [jobToDelete, setJobToDelete] = useState<JobApplication | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Computed metrics
  const totalCount = applications.length;
  const appliedCount = applications.filter((a) => a.status === 'Applied').length;
  const interviewCount = applications.filter((a) => a.status === 'Interview').length;
  const selectedCount = applications.filter((a) => a.status === 'Selected').length;
  const rejectedCount = applications.filter((a) => a.status === 'Rejected').length;

  // Next upcoming interview if any
  const upcomingInterview = applications.find(
    (a) => a.status === 'Interview' && a.interviewDate
  );

  // Prepare monthly activity chart data from real applications
  const chartData = React.useMemo(() => {
    if (applications.length === 0) return [];

    // Group applications by month
    const monthMap: Record<string, { month: string; applications: number; interviews: number }> = {};

    // Sort apps by date
    const sorted = [...applications].sort(
      (a, b) => new Date(a.appliedDate).getTime() - new Date(b.appliedDate).getTime()
    );

    sorted.forEach((app) => {
      const d = new Date(app.appliedDate);
      if (isNaN(d.getTime())) return;
      const key = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
      if (!monthMap[key]) {
        monthMap[key] = { month: key, applications: 0, interviews: 0 };
      }
      monthMap[key].applications += 1;
      if (app.status === 'Interview' || app.status === 'Selected') {
        monthMap[key].interviews += 1;
      }
    });

    const entries = Object.values(monthMap);
    // If only 1 month, provide at least 2 points for visual chart
    if (entries.length === 1) {
      return [
        { month: 'Prior', applications: 0, interviews: 0 },
        entries[0],
      ];
    }
    return entries;
  }, [applications]);

  // Recent applications (up to 5)
  const recentApplications = [...applications]
    .sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime())
    .slice(0, 5);

  const isDarkMode = theme === 'dark';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner / Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Application Overview
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track your job hunt progress, pipeline conversion, and upcoming milestones.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => navigate('/kanban')}
            className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Kanban className="w-3.5 h-3.5 text-indigo-500" />
            <span>Kanban Board</span>
          </button>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Application</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/applications')}
            className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total Applications */}
        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Applications</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white">
            {totalCount}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            All tracked opportunities
          </div>
        </div>

        {/* Applied */}
        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Under Review</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-blue-600 dark:text-blue-400">
            {appliedCount}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            {totalCount > 0 ? `${Math.round((appliedCount / totalCount) * 100)}% of total` : '0%'}
          </div>
        </div>

        {/* Interviews */}
        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Interviews</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-amber-600 dark:text-amber-400">
            {interviewCount}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            Active interview rounds
          </div>
        </div>

        {/* Offers Received (Selected) */}
        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Offers</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {selectedCount}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            Selected / Job offers
          </div>
        </div>

        {/* Rejected */}
        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-xs transition-shadow col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Rejected</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-rose-600 dark:text-rose-400">
            {rejectedCount}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            Archive & feedback noted
          </div>
        </div>
      </div>

      {/* Chart Section & Quick Next Milestone */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Application Overview Chart */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Application Overview
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Submission trends and interview stage progression
              </p>
            </div>
            <button
              onClick={() => navigate('/analytics')}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
            >
              Detailed Analytics
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorInterviews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDarkMode ? '#334155' : '#f1f5f9'}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    stroke={isDarkMode ? '#94a3b8' : '#64748b'}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke={isDarkMode ? '#94a3b8' : '#64748b'}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                      borderColor: isDarkMode ? '#1e293b' : '#e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="applications"
                    name="Applications"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorApps)"
                  />
                  <Area
                    type="monotone"
                    dataKey="interviews"
                    name="Interviews / Offers"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorInterviews)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No activity data yet. Add an application to generate trends.
              </div>
            )}
          </div>
        </div>

        {/* Milestone / Upcoming Focus Card */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Upcoming Milestones
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                Action Items
              </span>
            </div>

            {upcomingInterview ? (
              <div className="mt-4 p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/60">
                <div className="flex items-center gap-2.5 mb-2">
                  <CompanyAvatar name={upcomingInterview.company} size="sm" />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {upcomingInterview.company}
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
                      {upcomingInterview.role}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300 font-medium">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>Interview Date: {upcomingInterview.interviewDate}</span>
                </div>

                {upcomingInterview.notes && (
                  <p className="mt-2 text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 italic">
                    "{upcomingInterview.notes}"
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-6 text-center py-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-2 text-slate-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  No upcoming interviews scheduled
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                  When you update an application to "Interview" with a date, reminders will appear here.
                </p>
              </div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-2">
              <span>Goal: 5 Weekly Submissions</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-white">
                {Math.min(applications.length, 5)} / 5
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min((applications.length / 5) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. RECENT APPLICATIONS TABLE */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Recent Applications
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Latest job applications added to your tracker
            </p>
          </div>
          <button
            onClick={() => navigate('/applications')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>See all {applications.length} applications</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentApplications.length === 0 ? (
          <EmptyState
            title="No applications tracked yet"
            description="Start adding your job applications to track companies, interviews, and offers in one organized dashboard."
            onAddClick={() => setIsAddModalOpen(true)}
            onResetDemoClick={resetDemoData}
            actionText="Add First Application"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-5">Company</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {recentApplications.map((app) => (
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
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            {app.location}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                      <div>
                        <span
                          onClick={() => setActiveViewJob(app)}
                          className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
                        >
                          {app.role}
                        </span>
                        {app.salaryRange && (
                          <span className="block text-[11px] font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {app.salaryRange}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {app.appliedDate}
                    </td>

                    {/* Type */}
                    <td className="py-3.5 px-4">
                      <JobTypeBadge type={app.jobType} />
                    </td>

                    {/* Status (Interactive) */}
                    <td className="py-3.5 px-4">
                      <StatusBadge
                        status={app.status}
                        interactive={true}
                        onStatusChange={(newStatus) =>
                          updateApplication(app.id, { status: newStatus })
                        }
                      />
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-right">
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
        )}
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
        onClose={() => setIsAddModalOpen(false)}
        onSave={(data) => {
          addApplication(data);
          setIsAddModalOpen(false);
        }}
      />
    </div>
  );
};
