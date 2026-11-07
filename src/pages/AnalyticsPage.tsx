import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Award,
  Clock,
  Briefcase,
  CheckCircle2,
  XCircle,
  Percent,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useJobContext } from '../context/JobContext';
import { EmptyState } from '../components/EmptyState';

const STATUS_COLORS: Record<string, string> = {
  Applied: '#3b82f6', // blue
  Interview: '#f59e0b', // amber
  Selected: '#10b981', // emerald
  Rejected: '#ef4444', // rose
};

const JOB_TYPE_COLORS = ['#6366f1', '#06b6d4', '#8b5cf6', '#ec4899', '#f97316'];

export const AnalyticsPage: React.FC = () => {
  const { applications, theme, resetDemoData } = useJobContext();
  const navigate = useNavigate();

  const isDarkMode = theme === 'dark';

  // 1. Core Conversion Metrics (Calculated exclusively from saved data)
  const stats = useMemo(() => {
    const total = applications.length;
    if (total === 0) {
      return {
        total: 0,
        applied: 0,
        interview: 0,
        selected: 0,
        rejected: 0,
        interviewRate: 0,
        offerRate: 0,
        activePipelines: 0,
      };
    }

    const applied = applications.filter((a) => a.status === 'Applied').length;
    const interview = applications.filter((a) => a.status === 'Interview').length;
    const selected = applications.filter((a) => a.status === 'Selected').length;
    const rejected = applications.filter((a) => a.status === 'Rejected').length;

    // Interview rate = (Interview + Selected) / Total
    const interviewRate = Math.round(((interview + selected) / total) * 100);
    // Offer rate = Selected / Total
    const offerRate = Math.round((selected / total) * 100);
    // Active pipelines = Applied + Interview
    const activePipelines = applied + interview;

    return {
      total,
      applied,
      interview,
      selected,
      rejected,
      interviewRate,
      offerRate,
      activePipelines,
    };
  }, [applications]);

  // 2. Applications by Status (Pie Chart Data)
  const statusPieData = useMemo(() => {
    if (applications.length === 0) return [];
    const counts: Record<string, number> = {
      Applied: 0,
      Interview: 0,
      Selected: 0,
      Rejected: 0,
    };

    applications.forEach((a) => {
      counts[a.status] = (counts[a.status] || 0) + 1;
    });

    return Object.entries(counts)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({
        name: name === 'Selected' ? 'Selected / Offer' : name,
        rawName: name,
        value,
      }));
  }, [applications]);

  // 3. Applications Over Time (Bar Chart Data)
  const timeBarData = useMemo(() => {
    if (applications.length === 0) return [];
    const monthMap: Record<string, { month: string; total: number; interviews: number }> = {};

    const sorted = [...applications].sort(
      (a, b) => new Date(a.appliedDate).getTime() - new Date(b.appliedDate).getTime()
    );

    sorted.forEach((app) => {
      const d = new Date(app.appliedDate);
      if (isNaN(d.getTime())) return;
      const key = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      if (!monthMap[key]) {
        monthMap[key] = { month: key, total: 0, interviews: 0 };
      }
      monthMap[key].total += 1;
      if (app.status === 'Interview' || app.status === 'Selected') {
        monthMap[key].interviews += 1;
      }
    });

    return Object.values(monthMap);
  }, [applications]);

  // 4. Job Type Distribution
  const jobTypeData = useMemo(() => {
    if (applications.length === 0) return [];
    const counts: Record<string, number> = {};

    applications.forEach((a) => {
      const type = a.jobType || 'Full-time';
      counts[type] = (counts[type] || 0) + 1;
    });

    return Object.entries(counts).map(([type, count]) => ({
      type,
      count,
    }));
  }, [applications]);

  // 5. Funnel Steps
  const funnelSteps = useMemo(() => {
    if (stats.total === 0) return [];
    const step1 = stats.total;
    const step2 = stats.interview + stats.selected;
    const step3 = stats.selected;

    return [
      {
        stage: 'Applications Sent',
        count: step1,
        percentage: 100,
        subtext: 'Initial outreach submissions',
        color: 'bg-blue-500',
      },
      {
        stage: 'Interviews Reached',
        count: step2,
        percentage: Math.round((step2 / step1) * 100),
        subtext: `${Math.round((step2 / step1) * 100)}% progressed to screening`,
        color: 'bg-amber-500',
      },
      {
        stage: 'Offers Extended',
        count: step3,
        percentage: Math.round((step3 / step1) * 100),
        subtext: `${Math.round((step3 / Math.max(step2, 1)) * 100)}% of interviews converted`,
        color: 'bg-emerald-500',
      },
    ];
  }, [stats]);

  if (applications.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Analytics & Performance
        </h2>
        <div className="p-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <EmptyState
            title="No Application Data to Analyze"
            description="Add your job applications or load demo data to unlock real-time pipeline charts, conversion ratios, and distribution insights."
            onAddClick={() => navigate('/add')}
            onResetDemoClick={resetDemoData}
            actionText="Add Job Application"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Application Analytics
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Data-driven metrics computed directly from your {stats.total} saved application
          {stats.total === 1 ? '' : 's'}.
        </p>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Interview Rate */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Interview Rate
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-amber-600 dark:text-amber-400">
            {stats.interviewRate}%
          </div>
          <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            {stats.interview + stats.selected} of {stats.total} progressed
          </p>
        </div>

        {/* Offer Rate */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Offer Conversion
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {stats.offerRate}%
          </div>
          <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            {stats.selected} successful offer{stats.selected === 1 ? '' : 's'} secured
          </p>
        </div>

        {/* Active Pipelines */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Active Pipelines
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white">
            {stats.activePipelines}
          </div>
          <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            In review or interview stages
          </p>
        </div>

        {/* Rejection Rate */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Rejection Rate
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-rose-600 dark:text-rose-400">
            {Math.round((stats.rejected / stats.total) * 100)}%
          </div>
          <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            {stats.rejected} rejected applications
          </p>
        </div>
      </div>

      {/* Charts Grid Row 1: Applications by Status & Applications Over Time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Applications by Status */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Applications by Status
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Breakdown of opportunities across review stages
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusPieData.map((entry) => (
                    <Cell
                      key={`cell-${entry.rawName}`}
                      fill={STATUS_COLORS[entry.rawName] || '#6366f1'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => [`${value} applications`, name]}
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                    borderColor: isDarkMode ? '#1e293b' : '#e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => (
                    <span className="text-xs text-slate-700 dark:text-slate-300 mr-2">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Applications Over Time */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Applications Over Time
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Monthly submission cadence and interview milestones
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => (
                    <span className="text-xs text-slate-700 dark:text-slate-300 mr-2">{value}</span>
                  )}
                />
                <Bar dataKey="total" name="Total Applications" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="interviews" name="Interviews/Offers" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Grid Row 2: Job Type Distribution & Conversion Pipeline Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 3: Job Type Distribution */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Job Type Distribution
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Targeted employment models (Full-time, Internship, Remote, etc.)
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={jobTypeData}
                margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDarkMode ? '#334155' : '#f1f5f9'}
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  stroke={isDarkMode ? '#94a3b8' : '#64748b'}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="type"
                  stroke={isDarkMode ? '#94a3b8' : '#64748b'}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(val: any) => [`${val} applications`, 'Count']}
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                    borderColor: isDarkMode ? '#1e293b' : '#e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]}>
                  {jobTypeData.map((_, index) => (
                    <Cell
                      key={`cell-jobtype-${index}`}
                      fill={JOB_TYPE_COLORS[index % JOB_TYPE_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Interview Conversion Statistics / Funnel */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Interview Conversion Funnel
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Conversion drop-off across application pipeline stages
              </p>
            </div>

            <div className="space-y-4">
              {funnelSteps.map((step, idx) => (
                <div key={step.stage} className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] flex items-center justify-center font-mono">
                        {idx + 1}
                      </span>
                      {step.stage}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                        {step.count}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        ({step.percentage}%)
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-200/70 dark:bg-slate-700 rounded-full h-2 overflow-hidden mb-1">
                    <div
                      className={`${step.color} h-2 rounded-full transition-all`}
                      style={{ width: `${step.percentage}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {step.subtext}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Overall Success Ratio</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
              {stats.selected} Offer{stats.selected === 1 ? '' : 's'} / {stats.total} Total
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
