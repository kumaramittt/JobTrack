import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
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
  Download,
  Filter,
  HelpCircle,
  BarChart3,
  Building2,
  Info,
  Zap,
  Target,
  ArrowUpRight,
  ChevronRight,
  Check,
} from 'lucide-react';
import { useJobContext } from '../context/JobContext';
import { EmptyState } from '../components/EmptyState';
import { CompanyAvatar } from '../components/CompanyAvatar';
import { getTodayDate, parseDateString } from '../utils/date';
import { calculateApplicationMetrics } from '../utils/metrics';

type TimeRangeFilter = '7d' | '30d' | '90d' | '12m' | 'all';

const STATUS_COLORS: Record<string, string> = {
  Applied: '#3b82f6', // blue
  Interview: '#f59e0b', // amber
  Selected: '#10b981', // emerald
  Rejected: '#ef4444', // rose
};

const JOB_TYPE_COLORS = ['#6366f1', '#06b6d4', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6'];
const COMPANY_BAR_COLORS = ['#6366f1', '#4f46e5', '#4338ca', '#3730a3', '#312e81', '#1e1b4b'];

export const AnalyticsPage: React.FC = () => {
  const { applications, theme, resetDemoData, showToast } = useJobContext();
  const navigate = useNavigate();

  const isDarkMode = theme === 'dark';

  // Filters & View States
  const [filterRange, setFilterRange] = useState<TimeRangeFilter>('all');
  const [showMethodology, setShowMethodology] = useState<boolean>(false);

  // Reference Date for Relative Filtering using dynamic IST date
  const refDate = useMemo(() => {
    return getTodayDate();
  }, []);

  // 1. Filtered Applications based on Time Range
  const filteredApplications = useMemo(() => {
    if (filterRange === 'all') return applications;

    const refMs = refDate.getTime();
    let days = 30;
    if (filterRange === '7d') days = 7;
    else if (filterRange === '30d') days = 30;
    else if (filterRange === '90d') days = 90;
    else if (filterRange === '12m') days = 365;

    const cutoff = refMs - days * 24 * 60 * 60 * 1000;

    return applications.filter((app) => {
      const appTime = parseDateString(app.appliedDate).getTime();
      if (isNaN(appTime)) return true;
      return appTime >= cutoff;
    });
  }, [applications, filterRange, refDate]);

  // 2. Summary Cards Metrics (Actual records, synchronized via centralized calculateApplicationMetrics)
  const summaryMetrics = useMemo(() => {
    const calculated = calculateApplicationMetrics(filteredApplications);
    if (calculated.total === 0) {
      return {
        total: 0,
        interviewInvitations: 0,
        successfulOffers: 0,
        rejectedApplications: 0,
        interviewConversionRate: '0.0',
        offerConversionRate: '0.0',
        underReview: 0,
      };
    }

    const interviewConversionRate = ((calculated.interviewInvitations / calculated.total) * 100).toFixed(1);
    const offerConversionRate = ((calculated.selected / calculated.total) * 100).toFixed(1);

    return {
      total: calculated.total,
      interviewInvitations: calculated.interviewInvitations,
      successfulOffers: calculated.selected,
      rejectedApplications: calculated.rejected,
      interviewConversionRate,
      offerConversionRate,
      underReview: calculated.applied,
    };
  }, [filteredApplications]);

  // 3. Job Search Performance Ratios (Standardized formulas, zero-division safe)
  const performanceMetrics = useMemo(() => {
    const calculated = calculateApplicationMetrics(filteredApplications);
    const total = calculated.total;
    if (total === 0) {
      return {
        appToInterviewRate: '0.0',
        interviewToOfferRate: '0.0',
        overallSuccessRate: '0.0',
        avgDaysToInterview: null as number | null,
        scheduledInterviewsCount: 0,
      };
    }

    const invites = calculated.interviewInvitations;
    const offers = calculated.selected;

    // Application to Interview Conversion Rate: (Interview + Selected) / Total
    const appToInterviewRate = ((invites / total) * 100).toFixed(1);

    // Interview to Offer Conversion Rate: Offers / (Interviews + Offers)
    const interviewToOfferRate = invites > 0 ? ((offers / invites) * 100).toFixed(1) : '0.0';

    // Overall Success Rate: Offers / Total
    const overallSuccessRate = ((offers / total) * 100).toFixed(1);

    return {
      appToInterviewRate,
      interviewToOfferRate,
      overallSuccessRate,
      avgDaysToInterview: calculated.avgDaysToInterview,
      scheduledInterviewsCount: calculated.scheduledRounds,
    };
  }, [filteredApplications]);

  // 4. Monthly Trend Data (AreaChart)
  const monthlyTrendData = useMemo(() => {
    if (filteredApplications.length === 0) return [];
    const monthMap: Record<string, { month: string; rawDate: Date; applications: number; interviews: number; offers: number }> = {};

    filteredApplications.forEach((app) => {
      const d = new Date(app.appliedDate);
      if (isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });

      if (!monthMap[key]) {
        monthMap[key] = {
          month: label,
          rawDate: new Date(d.getFullYear(), d.getMonth(), 1),
          applications: 0,
          interviews: 0,
          offers: 0,
        };
      }
      monthMap[key].applications += 1;
      if (app.status === 'Interview' || app.status === 'Selected' || Boolean(app.interviewDate)) {
        monthMap[key].interviews += 1;
      }
      if (app.status === 'Selected') {
        monthMap[key].offers += 1;
      }
    });

    const sorted = Object.values(monthMap).sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime());
    // If only one data point, provide baseline for visual curves
    if (sorted.length === 1) {
      const priorDate = new Date(sorted[0].rawDate);
      priorDate.setMonth(priorDate.getMonth() - 1);
      return [
        {
          month: priorDate.toLocaleString('en-US', { month: 'short', year: '2-digit' }),
          rawDate: priorDate,
          applications: 0,
          interviews: 0,
          offers: 0,
        },
        sorted[0],
      ];
    }
    return sorted;
  }, [filteredApplications]);

  // 5. Weekly Trend Data (LineChart)
  const weeklyTrendData = useMemo(() => {
    if (filteredApplications.length === 0) return [];
    const weekMap: Record<string, { week: string; rawDate: Date; applications: number; interviews: number }> = {};

    filteredApplications.forEach((app) => {
      const d = new Date(app.appliedDate);
      if (isNaN(d.getTime())) return;

      // Calculate beginning of the week (Sunday)
      const day = d.getDay();
      const startOfWeek = new Date(d);
      startOfWeek.setDate(d.getDate() - day);
      startOfWeek.setHours(0, 0, 0, 0);

      const key = startOfWeek.toISOString().slice(0, 10);
      const label = `Wk ${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

      if (!weekMap[key]) {
        weekMap[key] = {
          week: label,
          rawDate: startOfWeek,
          applications: 0,
          interviews: 0,
        };
      }
      weekMap[key].applications += 1;
      if (app.status === 'Interview' || app.status === 'Selected' || Boolean(app.interviewDate)) {
        weekMap[key].interviews += 1;
      }
    });

    const sorted = Object.values(weekMap).sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime());
    return sorted;
  }, [filteredApplications]);

  // 6. Applications by Status (PieChart)
  const statusPieData = useMemo(() => {
    if (filteredApplications.length === 0) return [];
    const counts: Record<string, number> = {
      Applied: 0,
      Interview: 0,
      Selected: 0,
      Rejected: 0,
    };

    filteredApplications.forEach((a) => {
      counts[a.status] = (counts[a.status] || 0) + 1;
    });

    return Object.entries(counts)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({
        name: name === 'Selected' ? 'Selected / Offer' : name,
        rawName: name,
        value,
        percentage: ((value / filteredApplications.length) * 100).toFixed(1),
      }));
  }, [filteredApplications]);

  // 7. Applications by Job Type (BarChart)
  const jobTypeData = useMemo(() => {
    if (filteredApplications.length === 0) return [];
    const counts: Record<string, number> = {};

    filteredApplications.forEach((a) => {
      const type = a.jobType || 'Full-time';
      counts[type] = (counts[type] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([type, count]) => ({
        type,
        count,
        percentage: ((count / filteredApplications.length) * 100).toFixed(1),
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredApplications]);

  // 8. Company Analytics: Top Companies & Progress Breakdown
  const companyAnalytics = useMemo(() => {
    if (filteredApplications.length === 0) return { topCompaniesChart: [], tableData: [] };

    const compMap: Record<
      string,
      {
        company: string;
        total: number;
        applied: number;
        interview: number;
        selected: number;
        rejected: number;
        latestStatus: string;
        interviewProgress: string;
        roles: string[];
      }
    > = {};

    filteredApplications.forEach((app) => {
      const cName = (app.company || 'Unknown').trim();
      if (!compMap[cName]) {
        compMap[cName] = {
          company: cName,
          total: 0,
          applied: 0,
          interview: 0,
          selected: 0,
          rejected: 0,
          latestStatus: app.status,
          interviewProgress: 'None',
          roles: [],
        };
      }
      compMap[cName].total += 1;
      compMap[cName].roles.push(app.role);

      if (app.status === 'Applied') compMap[cName].applied += 1;
      else if (app.status === 'Interview') compMap[cName].interview += 1;
      else if (app.status === 'Selected') compMap[cName].selected += 1;
      else if (app.status === 'Rejected') compMap[cName].rejected += 1;

      // Determine interview progress
      if (app.status === 'Selected') {
        compMap[cName].interviewProgress = 'Offer Extended';
      } else if (app.status === 'Interview' || Boolean(app.interviewDate)) {
        if (compMap[cName].interviewProgress !== 'Offer Extended') {
          compMap[cName].interviewProgress = app.interviewDate ? 'Interview Scheduled' : 'Interview Round';
        }
      } else if (compMap[cName].interviewProgress === 'None') {
        compMap[cName].interviewProgress = app.status === 'Rejected' ? 'Concluded' : 'Under Review';
      }
    });

    const allCompanies = Object.values(compMap).sort((a, b) => b.total - a.total);

    // Top 5-6 companies for bar chart visualization
    const topCompaniesChart = allCompanies.slice(0, 6).map((c) => ({
      company: c.company,
      applications: c.total,
      interviews: c.interview + c.selected,
      offers: c.selected,
    }));

    return {
      topCompaniesChart,
      tableData: allCompanies,
    };
  }, [filteredApplications]);

  // 9. Export Analytics CSV Report
  const handleExportCSV = () => {
    if (filteredApplications.length === 0) {
      showToast('No applications found for the selected time filter', 'error');
      return;
    }

    const rows: string[] = [];

    // Header Metadata
    rows.push('JOBTRACK ADVANCED ANALYTICS REPORT');
    rows.push(`Export Generated,${new Date().toISOString()}`);
    rows.push(`Active Time Filter,${filterRange.toUpperCase()}`);
    rows.push(`Total Records Analyzed,${filteredApplications.length}`);
    rows.push('');

    // Executive Summary
    rows.push('EXECUTIVE SUMMARY METRICS');
    rows.push('Metric,Value,Calculation Methodology');
    rows.push(`Total Applications,${summaryMetrics.total},Total application records within selected timeframe`);
    rows.push(`Interview Invitations,${summaryMetrics.interviewInvitations},Applications in Interview or Offer stages`);
    rows.push(`Successful Offers,${summaryMetrics.successfulOffers},Applications with Selected status`);
    rows.push(`Rejected Applications,${summaryMetrics.rejectedApplications},Applications with Rejected status`);
    rows.push(`Interview Conversion Rate,${summaryMetrics.interviewConversionRate}%,(Interviews / Total Applications) * 100`);
    rows.push(`Offer Conversion Rate,${summaryMetrics.offerConversionRate}%,(Offers / Total Applications) * 100`);
    rows.push(`Interview to Offer Rate,${performanceMetrics.interviewToOfferRate}%,(Offers / Interviews) * 100`);
    rows.push(`Overall Success Rate,${performanceMetrics.overallSuccessRate}%,(Offers / Total Applications) * 100`);
    rows.push(
      `Average Time to Interview,${
        performanceMetrics.avgDaysToInterview !== null ? `${performanceMetrics.avgDaysToInterview} days` : 'N/A'
      },Average calendar days from application date to interview date`
    );
    rows.push('');

    // Status Breakdown
    rows.push('APPLICATIONS BY STATUS');
    rows.push('Status,Count,Percentage');
    statusPieData.forEach((s) => {
      rows.push(`"${s.name}",${s.value},${s.percentage}%`);
    });
    rows.push('');

    // Job Type Breakdown
    rows.push('APPLICATIONS BY JOB TYPE');
    rows.push('Job Type,Count,Percentage');
    jobTypeData.forEach((j) => {
      rows.push(`"${j.type}",${j.count},${j.percentage}%`);
    });
    rows.push('');

    // Company Progress
    rows.push('COMPANY-WISE ANALYTICS & INTERVIEW PROGRESS');
    rows.push('Company,Total Applications,Applied,Interviews,Offers,Rejected,Recruitment Progress');
    companyAnalytics.tableData.forEach((c) => {
      rows.push(
        `"${c.company.replace(/"/g, '""')}",${c.total},${c.applied},${c.interview},${c.selected},${c.rejected},"${c.interviewProgress}"`
      );
    });
    rows.push('');

    // Detailed Application Records
    rows.push('DETAILED APPLICATION RECORDS');
    rows.push('Company,Role,Location,Job Type,Applied Date,Status,Salary,Interview Date,Notes');
    filteredApplications.forEach((app) => {
      rows.push(
        [
          `"${app.company.replace(/"/g, '""')}"`,
          `"${app.role.replace(/"/g, '""')}"`,
          `"${app.location.replace(/"/g, '""')}"`,
          `"${app.jobType}"`,
          app.appliedDate,
          app.status,
          `"${(app.salaryRange || 'N/A').replace(/"/g, '""')}"`,
          app.interviewDate || 'N/A',
          `"${(app.notes || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
        ].join(',')
      );
    });

    const csvContent = rows.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `jobtrack-analytics-report-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('Analytics CSV report exported successfully', 'success');
  };

  // Zero-State: When the user has zero applications in the whole database
  if (applications.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Advanced Analytics Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time pipeline metrics, conversion rates, and recruitment trends.
          </p>
        </div>
        <div className="p-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <EmptyState
            title="No Application Data to Analyze"
            description="Add your job applications or load demo data to unlock real-time pipeline charts, conversion ratios, and company progress insights."
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
      {/* 1. TOP HEADER & FILTER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Advanced Analytics Dashboard
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 font-semibold">
              Live Data
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Recruitment pipeline health calculated from {filteredApplications.length} of {applications.length} saved applications.
          </p>
        </div>

        {/* Filter Controls & Export CSV */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Time Filter Pills */}
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80">
            {(
              [
                { id: '7d', label: '7D' },
                { id: '30d', label: '30D' },
                { id: '90d', label: '90D' },
                { id: '12m', label: '12M' },
                { id: 'all', label: 'All Time' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilterRange(item.id)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  filterRange === item.id
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Export Report CSV Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-xl shadow-2xs transition-all cursor-pointer"
            title="Download complete analytics dataset as CSV"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Zero Filter Result Alert (if selected time range has 0 apps) */}
      {filteredApplications.length === 0 && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-200">
            <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              No applications were submitted within this specific timeframe. Switch to <strong>All Time</strong> or a broader filter to view your historical records.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setFilterRange('all')}
            className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold cursor-pointer shrink-0"
          >
            Show All Time
          </button>
        </div>
      )}

      {/* 2. SUMMARY CARDS (6 Key Metrics Required by Spec) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Card 1: Total Applications */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 truncate">
              Total Applications
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {summaryMetrics.total}
          </div>
          <p className="mt-1.5 text-[10px] text-slate-500 dark:text-slate-400 truncate">
            {summaryMetrics.underReview} pending review
          </p>
        </div>

        {/* Card 2: Interview Invitations */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 truncate">
              Interview Invites
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
            {summaryMetrics.interviewInvitations}
          </div>
          <p className="mt-1.5 text-[10px] text-slate-500 dark:text-slate-400 truncate">
            Screening & tech rounds
          </p>
        </div>

        {/* Card 3: Successful Offers */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 truncate">
              Successful Offers
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {summaryMetrics.successfulOffers}
          </div>
          <p className="mt-1.5 text-[10px] text-slate-500 dark:text-slate-400 truncate">
            Selected placements
          </p>
        </div>

        {/* Card 4: Rejected Applications */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 truncate">
              Rejected
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <XCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
            {summaryMetrics.rejectedApplications}
          </div>
          <p className="mt-1.5 text-[10px] text-slate-500 dark:text-slate-400 truncate">
            Archived outcomes
          </p>
        </div>

        {/* Card 5: Interview Conversion Rate */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 truncate">
              Interview Rate
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
            {summaryMetrics.interviewConversionRate}%
          </div>
          <p className="mt-1.5 text-[10px] text-slate-500 dark:text-slate-400 truncate">
            Invites ÷ Total Apps
          </p>
        </div>

        {/* Card 6: Offer Conversion Rate */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 truncate">
              Offer Rate
            </span>
            <div className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-violet-600 dark:text-violet-400">
            {summaryMetrics.offerConversionRate}%
          </div>
          <p className="mt-1.5 text-[10px] text-slate-500 dark:text-slate-400 truncate">
            Offers ÷ Total Apps
          </p>
        </div>
      </div>

      {/* 3. JOB SEARCH PERFORMANCE & RECRUITMENT FUNNEL */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-500" />
              Job Search Performance & Ratios
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Efficiency milestones from initial application submission to final placement offer.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowMethodology(!showMethodology)}
            className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{showMethodology ? 'Hide Formulas' : 'How Are These Calculated?'}</span>
          </button>
        </div>

        {/* Optional Collapsible Formula Explanation Banner */}
        {showMethodology && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs space-y-2 animate-in fade-in duration-150">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-indigo-500" />
              Recruitment Conversion Calculation Methodology
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-0.5">App-to-Interview</span>
                <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  (Interview + Selected) ÷ Total Applications × 100
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-0.5">Interview-to-Offer</span>
                <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  Offers ÷ (Interview + Selected) × 100
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-0.5">Overall Success</span>
                <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  Offers Extended ÷ Total Applications × 100
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-0.5">Avg Time to Interview</span>
                <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  Mean calendar days from Applied Date to Interview Date
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 4 Performance Metric Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Application to Interview */}
          <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              Application to Interview
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
                {performanceMetrics.appToInterviewRate}%
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                ({summaryMetrics.interviewInvitations}/{summaryMetrics.total})
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div
                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Number(performanceMetrics.appToInterviewRate))}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Benchmark: ~10% to 20% in tech
            </span>
          </div>

          {/* 2. Interview to Offer */}
          <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              Interview to Offer
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
                {performanceMetrics.interviewToOfferRate}%
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                ({summaryMetrics.successfulOffers}/{summaryMetrics.interviewInvitations || 0})
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div
                className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Number(performanceMetrics.interviewToOfferRate))}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Interview conversion effectiveness
            </span>
          </div>

          {/* 3. Overall Success Rate */}
          <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              Overall Placement Rate
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {performanceMetrics.overallSuccessRate}%
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                ({summaryMetrics.successfulOffers}/{summaryMetrics.total})
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Number(performanceMetrics.overallSuccessRate))}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Net offer closing velocity
            </span>
          </div>

          {/* 4. Avg Time to Interview */}
          <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              Avg Time to Interview
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                {performanceMetrics.avgDaysToInterview !== null
                  ? `${performanceMetrics.avgDaysToInterview}d`
                  : 'N/A'}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {performanceMetrics.scheduledInterviewsCount > 0
                  ? `from ${performanceMetrics.scheduledInterviewsCount} round(s)`
                  : 'Need scheduled dates'}
              </span>
            </div>
            <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
              <Calendar className="w-3 h-3 text-indigo-500 shrink-0" />
              <span>Response turnaround time</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Days from submission to invite
            </span>
          </div>
        </div>

        {/* Visual 3-Stage Progression Funnel */}
        <div className="pt-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* Stage 1 */}
            <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 block">
                  Stage 1: Outbound
                </span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {summaryMetrics.total} Submitted
                </span>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                100%
              </span>
            </div>

            {/* Stage 2 */}
            <div className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 block">
                  Stage 2: Screening
                </span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {summaryMetrics.interviewInvitations} Reached Interviews
                </span>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
                {summaryMetrics.interviewConversionRate}%
              </span>
            </div>

            {/* Stage 3 */}
            <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">
                  Stage 3: Placement
                </span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {summaryMetrics.successfulOffers} Offers Extended
                </span>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                {summaryMetrics.offerConversionRate}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. APPLICATION TRENDS: MONTHLY (AREA CHART) & WEEKLY (LINE CHART) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Applications by Month (Area Chart) */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                  Applications by Month
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Monthly submission cadence, interview progression & offers
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                Area Chart
              </span>
            </div>

            <div className="h-64 w-full">
              {monthlyTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorMonthlyApps" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorMonthlyInterviews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorMonthlyOffers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
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
                        borderRadius: '10px',
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
                    <Area
                      type="monotone"
                      dataKey="applications"
                      name="Submissions"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorMonthlyApps)"
                    />
                    <Area
                      type="monotone"
                      dataKey="interviews"
                      name="Interviews"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorMonthlyInterviews)"
                    />
                    <Area
                      type="monotone"
                      dataKey="offers"
                      name="Offers"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorMonthlyOffers)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No monthly data available for this timeframe.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chart 2: Applications by Week (Line Chart) */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                  Applications by Week
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Weekly outbound application velocity & interview pacing
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                Line Chart
              </span>
            </div>

            <div className="h-64 w-full">
              {weeklyTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={isDarkMode ? '#334155' : '#f1f5f9'}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="week"
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
                        borderRadius: '10px',
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
                    <Line
                      type="monotone"
                      dataKey="applications"
                      name="Weekly Submissions"
                      stroke="#6366f1"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#6366f1' }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="interviews"
                      name="Weekly Invites"
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#f59e0b' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No weekly records found for this period.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 5. CHARTS ROW: APPLICATIONS BY STATUS (PIE CHART) & JOB TYPE (BAR CHART) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Applications by Status (Pie / Donut Chart) */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Applications by Status
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Proportional share across review and decision stages
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {statusPieData.length} stages
              </span>
            </div>

            <div className="h-64 w-full relative">
              {statusPieData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
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
                  {/* Center Donut Label */}
                  <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white block">
                      {summaryMetrics.total}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Total</span>
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No status records found.
                </div>
              )}
            </div>
          </div>

          {/* Status Breakdown Legend Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            {statusPieData.map((s) => (
              <div key={s.rawName} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="text-[10px] text-slate-400 block truncate">{s.name}</span>
                <div className="flex items-center justify-between font-mono mt-0.5">
                  <span className="font-bold text-slate-900 dark:text-white">{s.value}</span>
                  <span className="text-[11px] text-slate-500">{s.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Applications by Job Type (Bar Chart) */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Applications by Job Type
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Targeted contract types, internships, and remote roles
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {jobTypeData.length} types
              </span>
            </div>

            <div className="h-64 w-full">
              {jobTypeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={jobTypeData}
                    margin={{ top: 10, right: 20, left: 25, bottom: 0 }}
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
                      formatter={(val: any) => [`${val} applications`, 'Applications']}
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                        borderColor: isDarkMode ? '#1e293b' : '#e2e8f0',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="count" name="Applications" fill="#6366f1" radius={[0, 4, 4, 0]}>
                      {jobTypeData.map((_, index) => (
                        <Cell
                          key={`cell-jobtype-${index}`}
                          fill={JOB_TYPE_COLORS[index % JOB_TYPE_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No job type distribution data available.
                </div>
              )}
            </div>
          </div>

          {/* Job Type Summary Quick Pills */}
          <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            {jobTypeData.map((j) => (
              <span
                key={j.type}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px]"
              >
                {j.type}: <strong>{j.count}</strong> ({j.percentage}%)
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 6. COMPANY ANALYTICS: TOP COMPANIES & RECRUITMENT PROGRESS */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-500" />
              Company Analytics & Progress
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Breakdown of top organizations targeted and interview progress per company.
            </p>
          </div>

          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
            {companyAnalytics.tableData.length} Companies Tracked
          </span>
        </div>

        {/* Company Chart & Summary View */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Companies Bar Chart */}
          <div className="lg:col-span-1 p-4 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                Top Companies by Volume
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                Organizations with multiple active or historical submissions
              </p>

              <div className="h-56 w-full">
                {companyAnalytics.topCompaniesChart.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={companyAnalytics.topCompaniesChart}
                      margin={{ top: 5, right: 5, left: -20, bottom: 20 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={isDarkMode ? '#334155' : '#f1f5f9'}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="company"
                        stroke={isDarkMode ? '#94a3b8' : '#64748b'}
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        angle={-25}
                        textAnchor="end"
                      />
                      <YAxis
                        stroke={isDarkMode ? '#94a3b8' : '#64748b'}
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                          borderColor: isDarkMode ? '#1e293b' : '#e2e8f0',
                          borderRadius: '8px',
                          fontSize: '11px',
                        }}
                      />
                      <Bar dataKey="applications" name="Applications" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    No company volume data.
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-200 dark:border-slate-700/60">
              Showing top {companyAnalytics.topCompaniesChart.length} organizations
            </div>
          </div>

          {/* Company-Wise Interview Progress Table */}
          <div className="lg:col-span-2 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[11px]">
                  <th className="pb-3 font-semibold">Company</th>
                  <th className="pb-3 font-semibold text-center">Applications</th>
                  <th className="pb-3 font-semibold text-center">Stage Distribution</th>
                  <th className="pb-3 font-semibold text-right">Interview Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {companyAnalytics.tableData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400">
                      No companies found.
                    </td>
                  </tr>
                ) : (
                  companyAnalytics.tableData.map((item) => (
                    <tr
                      key={item.company}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Company Name + Avatar */}
                      <td className="py-3">
                        <div className="flex items-center gap-2.5">
                          <CompanyAvatar name={item.company} size="sm" />
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {item.company}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate max-w-[180px] block">
                              {item.roles.join(', ')}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Total Count */}
                      <td className="py-3 text-center font-mono font-bold text-slate-900 dark:text-white">
                        {item.total}
                      </td>

                      {/* Stage Pills */}
                      <td className="py-3">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {item.applied > 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                              {item.applied} Review
                            </span>
                          )}
                          {item.interview > 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                              {item.interview} Interview
                            </span>
                          )}
                          {item.selected > 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                              {item.selected} Offer
                            </span>
                          )}
                          {item.rejected > 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-medium bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                              {item.rejected} Rejected
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Progress Badge */}
                      <td className="py-3 text-right">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                            item.interviewProgress === 'Offer Extended'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : item.interviewProgress.includes('Interview')
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                              : item.interviewProgress === 'Under Review'
                              ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {item.interviewProgress === 'Offer Extended' && (
                            <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          )}
                          {item.interviewProgress.includes('Interview') && (
                            <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          )}
                          <span>{item.interviewProgress}</span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
