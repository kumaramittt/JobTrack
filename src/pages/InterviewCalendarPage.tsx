import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Video,
  MapPin,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Edit2,
  Trash2,
  Eye,
  Sparkles,
  Building2,
  ArrowRight,
  UserCheck,
  CalendarDays,
  ListFilter,
  Check,
} from 'lucide-react';
import { useJobContext } from '../context/JobContext';
import { JobApplication, JobStatus } from '../types/job';
import { CompanyAvatar } from '../components/CompanyAvatar';
import { ApplicationDetailsModal } from '../components/ApplicationDetailsModal';
import { InterviewScheduleModal } from '../components/InterviewScheduleModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import {
  getTodayDate,
  getTodayDateString,
  getInterviewCountdownInfo,
  formatDisplayDate,
  formatDateKey,
} from '../utils/date';

type CalendarViewMode = 'month' | 'week' | 'day';

export const InterviewCalendarPage: React.FC = () => {
  const { applications, updateApplication, deleteApplication, showToast } = useJobContext();
  const navigate = useNavigate();

  // Active view mode
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');

  // Currently focused date (dynamic today in Asia/Kolkata default timezone)
  const [currentDate, setCurrentDate] = useState<Date>(() => getTodayDate());
  const today = useMemo(() => getTodayDate(), []);
  const todayKey = useMemo(() => getTodayDateString(), []);

  // Search and format filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Online' | 'Offline'>('All');

  // Modal states
  const [selectedAppForDetails, setSelectedAppForDetails] = useState<JobApplication | null>(null);
  const [scheduleModalApp, setScheduleModalApp] = useState<JobApplication | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [clickedDateForSchedule, setClickedDateForSchedule] = useState<string | undefined>(undefined);
  const [jobToDelete, setJobToDelete] = useState<JobApplication | null>(null);

  // All applications that have an interview date
  const interviewApplications = useMemo(() => {
    return applications.filter((app) => Boolean(app.interviewDate));
  }, [applications]);

  // Filtered interview applications based on search & format
  const filteredInterviews = useMemo(() => {
    return interviewApplications.filter((app) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCompany = app.company.toLowerCase().includes(q);
        const matchRole = app.role.toLowerCase().includes(q);
        const matchLocation = app.location.toLowerCase().includes(q);
        if (!matchCompany && !matchRole && !matchLocation) return false;
      }

      if (filterType !== 'All') {
        const type = app.interviewType || 'Online';
        if (type !== filterType) return false;
      }

      return true;
    });
  }, [interviewApplications, searchQuery, filterType]);

  // Group filtered interviews by Date Key (YYYY-MM-DD)
  const interviewsByDate = useMemo(() => {
    const map: Record<string, JobApplication[]> = {};
    filteredInterviews.forEach((app) => {
      if (!app.interviewDate) return;
      const key = app.interviewDate.slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(app);
    });
    return map;
  }, [filteredInterviews]);

  // Chronologically sorted upcoming interviews (on or after today)
  const upcomingInterviews = useMemo(() => {
    return interviewApplications
      .filter((app) => {
        if (!app.interviewDate) return false;
        // Include from today onwards or Scheduled
        return app.interviewDate >= todayKey || app.interviewStatus === 'Scheduled';
      })
      .sort((a, b) => (a.interviewDate || '').localeCompare(b.interviewDate || ''));
  }, [interviewApplications, todayKey]);

  // Next upcoming interview for Countdown calculation
  const nextInterview = useMemo(() => {
    return upcomingInterviews.find((app) => (app.interviewDate || '') >= todayKey) || upcomingInterviews[0];
  }, [upcomingInterviews, todayKey]);

  // Accurate countdown calculations using centralized date & timezone logic
  const countdownText = useMemo(() => {
    if (!nextInterview || !nextInterview.interviewDate) return null;
    return getInterviewCountdownInfo(nextInterview.interviewDate, nextInterview.interviewTime);
  }, [nextInterview]);

  // Navigation handlers
  const handlePrev = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (viewMode === 'month') {
        d.setMonth(d.getMonth() - 1);
      } else if (viewMode === 'week') {
        d.setDate(d.getDate() - 7);
      } else {
        d.setDate(d.getDate() - 1);
      }
      return d;
    });
  };

  const handleNext = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (viewMode === 'month') {
        d.setMonth(d.getMonth() + 1);
      } else if (viewMode === 'week') {
        d.setDate(d.getDate() + 7);
      } else {
        d.setDate(d.getDate() + 1);
      }
      return d;
    });
  };

  const handleGoToday = () => {
    setCurrentDate(new Date(today));
  };

  // Schedule or Edit Interview
  const handleSaveInterviewSchedule = (
    applicationId: string,
    details: {
      interviewDate: string;
      interviewTime?: string;
      interviewType?: 'Online' | 'Offline';
      interviewLink?: string;
      interviewStatus?: 'Scheduled' | 'Completed' | 'Rescheduled' | 'Cancelled';
    }
  ) => {
    updateApplication(applicationId, {
      ...details,
      status: 'Interview', // Auto-promote status to Interview if not already
    });
    showToast('Interview schedule updated successfully!', 'success');
  };

  // Remove Interview schedule
  const handleRemoveInterviewSchedule = (applicationId: string) => {
    updateApplication(applicationId, {
      interviewDate: undefined,
      interviewTime: undefined,
      interviewType: undefined,
      interviewLink: undefined,
      interviewStatus: undefined,
    });
    showToast('Interview schedule removed.', 'info');
  };

  // Generate Month Grid Days
  const monthGridDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startDayIndex = firstDayOfMonth.getDay(); // 0 is Sunday
    const daysInMonth = lastDayOfMonth.getDate();

    const days: { date: Date; isCurrentMonth: boolean; dateKey: string }[] = [];

    // Previous month padding days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({ date: d, isCurrentMonth: false, dateKey: formatDateKey(d) });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      days.push({ date: d, isCurrentMonth: true, dateKey: formatDateKey(d) });
    }

    // Next month padding days to complete 35 or 42 grid cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({ date: d, isCurrentMonth: false, dateKey: formatDateKey(d) });
    }

    return days;
  }, [currentDate]);

  // Generate Week Grid Days
  const weekGridDays = useMemo(() => {
    const d = new Date(currentDate);
    const dayOfWeek = d.getDay();
    const startOfWeek = new Date(d);
    startOfWeek.setDate(d.getDate() - dayOfWeek);

    const days: { date: Date; dateKey: string }[] = [];
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + i);
      days.push({ date: dayDate, dateKey: formatDateKey(dayDate) });
    }
    return days;
  }, [currentDate]);

  // Title for Header
  const getHeaderTitle = () => {
    if (viewMode === 'month') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    if (viewMode === 'week') {
      const start = weekGridDays[0].date;
      const end = weekGridDays[6].date;
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    return currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto flex flex-col h-full">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>Interview Calendar</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              {interviewApplications.length} Scheduled
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Coordinate, prepare and track upcoming technical screens, panel discussions, and HR rounds.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setScheduleModalApp(null);
            setClickedDateForSchedule(todayKey);
            setIsScheduleModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-600/20 transition-all cursor-pointer self-start sm:self-auto hover:shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Interview</span>
        </button>
      </div>

      {/* Countdown & Highlights Banner (Requirement 8 & 9) */}
      {nextInterview && countdownText && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-md border border-indigo-700/50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-200">
                  Upcoming Milestone
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${countdownText.badgeClass}`}>
                  {countdownText.label}
                </span>
                <span className="text-[11px] text-indigo-300 font-mono">
                  {nextInterview.interviewDate} {nextInterview.interviewTime ? `at ${nextInterview.interviewTime}` : ''}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                {nextInterview.company} – {nextInterview.role}
              </h3>
              <p className="text-xs text-indigo-200 mt-0.5 flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1">
                  {nextInterview.interviewType === 'Offline' ? (
                    <Building2 className="w-3.5 h-3.5" />
                  ) : (
                    <Video className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  {nextInterview.interviewType || 'Online'} Interview
                </span>
                {nextInterview.contactPerson && (
                  <span>• Recruiter: {nextInterview.contactPerson}</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
            {nextInterview.interviewLink && (
              <a
                href={nextInterview.interviewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-colors"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Join Meeting</span>
              </a>
            )}
            <button
              type="button"
              onClick={() => setSelectedAppForDetails(nextInterview)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
            >
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Control Bar: Month Navigation, Today, View Switcher & Filters */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-0.5">
              <button
                type="button"
                onClick={handlePrev}
                className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
                aria-label="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleGoToday}
                className="px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
              >
                Today
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
                aria-label="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white pl-2">
              {getHeaderTitle()}
            </h3>
          </div>

          {/* Right Side: View Mode Tabs & Format Filter */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* View Mode Switcher (Month, Week, Day) */}
            <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200/60 dark:border-slate-700/60 text-xs">
              {(['month', 'week', 'day'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 rounded-md font-semibold capitalize transition-all cursor-pointer ${
                    viewMode === mode
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Format Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <option value="All">All Formats</option>
              <option value="Online">Online Video</option>
              <option value="Offline">In-Person</option>
            </select>
          </div>
        </div>

        {/* Search Input Filter */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search interview by company or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white"
            />
          </div>

          <div className="text-[11px] text-slate-400 hidden sm:block">
            Tip: Click on any date cell to schedule an interview for that day.
          </div>
        </div>
      </div>

      {/* Main Grid: Calendar Interface + Upcoming Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* CALENDAR VIEW CONTAINER (Left 3 columns) */}
        <div className="lg:col-span-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden">
          {/* 1. MONTHLY VIEW */}
          {viewMode === 'month' && (
            <div className="w-full overflow-x-auto">
              <div className="min-w-[700px]">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-center text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider py-2.5">
                  <div>Sun</div>
                  <div>Mon</div>
                  <div>Tue</div>
                  <div>Wed</div>
                  <div>Thu</div>
                  <div>Fri</div>
                  <div>Sat</div>
                </div>

                {/* Day Grid */}
                <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800/80">
                  {monthGridDays.map((dayItem, index) => {
                    const isToday = dayItem.dateKey === todayKey;
                    const dayInterviews = interviewsByDate[dayItem.dateKey] || [];

                    return (
                      <div
                        key={index}
                        onClick={() => {
                          setClickedDateForSchedule(dayItem.dateKey);
                          setScheduleModalApp(null);
                          setIsScheduleModalOpen(true);
                        }}
                        className={`min-h-[110px] p-2 transition-colors cursor-pointer group flex flex-col justify-between ${
                          !dayItem.isCurrentMonth
                            ? 'bg-slate-50/40 dark:bg-slate-950/20 text-slate-400 dark:text-slate-600'
                            : 'bg-white dark:bg-slate-900 hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                        } ${isToday ? 'ring-2 ring-inset ring-indigo-500/50 bg-indigo-50/20 dark:bg-indigo-950/10' : ''}`}
                      >
                        {/* Day Cell Header */}
                        <div className="flex items-center justify-between">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                              isToday
                                ? 'bg-indigo-600 text-white font-bold shadow-xs'
                                : dayItem.isCurrentMonth
                                ? 'text-slate-800 dark:text-slate-200'
                                : 'text-slate-400 dark:text-slate-600'
                            }`}
                          >
                            {dayItem.date.getDate()}
                          </span>

                          {isToday && (
                            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                              Today
                            </span>
                          )}
                        </div>

                        {/* Interview Events in Day Cell */}
                        <div className="space-y-1 my-1.5 flex-1">
                          {dayInterviews.map((app) => (
                            <div
                              key={app.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAppForDetails(app);
                              }}
                              className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/60 hover:border-amber-400 dark:hover:border-amber-600 transition-all shadow-2xs group/item"
                              title={`${app.company} – ${app.role} (${app.interviewTime || 'Time not specified'})`}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-bold text-[11px] text-slate-900 dark:text-white truncate">
                                  {app.company}
                                </span>
                                {app.interviewTime && (
                                  <span className="text-[10px] font-mono text-amber-700 dark:text-amber-300 font-semibold shrink-0">
                                    {app.interviewTime}
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
                                {app.interviewType === 'Offline' ? (
                                  <Building2 className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                ) : (
                                  <Video className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                                )}
                                <span className="truncate">{app.role}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Cell Footer Quick Add Trigger */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-right">
                          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
                            + Schedule
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 2. WEEKLY VIEW */}
          {viewMode === 'week' && (
            <div className="p-4 sm:p-6 overflow-x-auto">
              <div className="grid grid-cols-1 sm:grid-cols-7 gap-3 min-w-[700px]">
                {weekGridDays.map((dayItem) => {
                  const isToday = dayItem.dateKey === todayKey;
                  const dayInterviews = interviewsByDate[dayItem.dateKey] || [];

                  return (
                    <div
                      key={dayItem.dateKey}
                      className={`p-3 rounded-xl border flex flex-col min-h-[360px] ${
                        isToday
                          ? 'border-indigo-400 dark:border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/20'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40'
                      }`}
                    >
                      {/* Day Column Header */}
                      <div className="text-center pb-2 border-b border-slate-200/80 dark:border-slate-800">
                        <span className="text-[11px] font-semibold uppercase text-slate-400 block">
                          {dayItem.date.toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                        <div className="flex items-center justify-center gap-1.5 mt-0.5">
                          <span
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                              isToday ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            {dayItem.date.getDate()}
                          </span>
                          {isToday && (
                            <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                              Today
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Day Events List */}
                      <div className="py-2 space-y-2 flex-1">
                        {dayInterviews.length === 0 ? (
                          <div className="h-full flex items-center justify-center text-center text-[11px] text-slate-400 py-6 italic">
                            No interviews
                          </div>
                        ) : (
                          dayInterviews.map((app) => (
                            <div
                              key={app.id}
                              onClick={() => setSelectedAppForDetails(app)}
                              className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs hover:shadow-xs cursor-pointer transition-all"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <CompanyAvatar name={app.company} size="sm" />
                                <div className="min-w-0">
                                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                    {app.company}
                                  </h4>
                                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                    {app.role}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-[10px] font-mono text-slate-600 dark:text-slate-300 mt-2 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                                <span className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                                  <Clock className="w-2.5 h-2.5" />
                                  {app.interviewTime || 'TBD'}
                                </span>
                                <span>{app.interviewType || 'Online'}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Day Schedule Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setClickedDateForSchedule(dayItem.dateKey);
                          setScheduleModalApp(null);
                          setIsScheduleModalOpen(true);
                        }}
                        className="w-full py-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg border border-dashed border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                      >
                        + Add Schedule
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. DAILY VIEW */}
          {viewMode === 'day' && (
            <div className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Day Schedule: {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {(interviewsByDate[formatDateKey(currentDate)] || []).length} interview session(s) scheduled for this date.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setClickedDateForSchedule(formatDateKey(currentDate));
                    setScheduleModalApp(null);
                    setIsScheduleModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Interview</span>
                </button>
              </div>

              {(interviewsByDate[formatDateKey(currentDate)] || []).length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
                    <CalendarDays className="w-6 h-6 text-slate-400" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    No interviews scheduled for this day
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                    Enjoy your prep time or schedule a screening round for one of your active job applications.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(interviewsByDate[formatDateKey(currentDate)] || []).map((app) => (
                    <div
                      key={app.id}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5">
                        <CompanyAvatar name={app.company} size="md" />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {app.company}
                            </span>
                            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                              {app.role}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                              {app.interviewStatus || 'Scheduled'}
                            </span>
                          </div>

                          <div className="mt-1 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                            <span className="flex items-center gap-1 font-mono font-semibold text-slate-700 dark:text-slate-300">
                              <Clock className="w-3.5 h-3.5 text-amber-500" />
                              {app.interviewTime || 'Time not specified'}
                            </span>
                            <span className="flex items-center gap-1">
                              {app.interviewType === 'Offline' ? (
                                <Building2 className="w-3.5 h-3.5" />
                              ) : (
                                <Video className="w-3.5 h-3.5 text-emerald-500" />
                              )}
                              {app.interviewType || 'Online'}
                            </span>
                            {app.contactPerson && (
                              <span>• Contact: {app.contactPerson}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {app.interviewLink && (
                          <a
                            href={app.interviewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-colors"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Meeting Link</span>
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setScheduleModalApp(app);
                            setIsScheduleModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                          title="Edit interview schedule"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedAppForDetails(app)}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* UPCOMING INTERVIEWS SIDEBAR (Requirement 8 & 10) */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Upcoming Interviews</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Timeline order of scheduled rounds
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {upcomingInterviews.length}
            </span>
          </div>

          {upcomingInterviews.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              <CalendarIcon className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <p className="font-semibold text-slate-600 dark:text-slate-400">
                No upcoming interviews
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                When you schedule an interview date on an application, it will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
              {upcomingInterviews.map((app) => {
                const isNext = nextInterview?.id === app.id;
                return (
                  <div
                    key={app.id}
                    onClick={() => setSelectedAppForDetails(app)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer group ${
                      isNext
                        ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800 shadow-xs'
                        : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <CompanyAvatar name={app.company} size="sm" />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {app.company}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {app.role}
                          </p>
                        </div>
                      </div>

                      {isNext && (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500 text-white shrink-0">
                          Next
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-semibold text-slate-900 dark:text-white">
                          {app.interviewDate}
                        </span>
                        {app.interviewTime && (
                          <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
                            {app.interviewTime}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>{app.interviewType || 'Online'}</span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold group-hover:underline">
                          View details →
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Schedule button in sidebar */}
          <button
            type="button"
            onClick={() => {
              setScheduleModalApp(null);
              setClickedDateForSchedule(todayKey);
              setIsScheduleModalOpen(true);
            }}
            className="w-full py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
          >
            + Schedule an Interview
          </button>
        </div>
      </div>

      {/* Complete Application Details Modal */}
      {selectedAppForDetails && (
        <ApplicationDetailsModal
          isOpen={Boolean(selectedAppForDetails)}
          application={selectedAppForDetails}
          onClose={() => setSelectedAppForDetails(null)}
          onEdit={(app) => {
            setSelectedAppForDetails(null);
            setScheduleModalApp(app);
            setIsScheduleModalOpen(true);
          }}
          onDelete={(app) => {
            setSelectedAppForDetails(null);
            setJobToDelete(app);
          }}
          onStatusChange={(newStatus) => {
            if (selectedAppForDetails) {
              updateApplication(selectedAppForDetails.id, { status: newStatus });
              setSelectedAppForDetails({ ...selectedAppForDetails, status: newStatus });
            }
          }}
        />
      )}

      {/* Schedule / Edit Interview Modal */}
      {isScheduleModalOpen && (
        <InterviewScheduleModal
          isOpen={isScheduleModalOpen}
          application={scheduleModalApp}
          availableApplications={applications}
          initialDate={clickedDateForSchedule}
          onClose={() => {
            setIsScheduleModalOpen(false);
            setScheduleModalApp(null);
            setClickedDateForSchedule(undefined);
          }}
          onSave={handleSaveInterviewSchedule}
          onRemove={handleRemoveInterviewSchedule}
        />
      )}

      {/* Confirmation Modal before permanent deletion */}
      <DeleteConfirmModal
        isOpen={Boolean(jobToDelete)}
        application={jobToDelete}
        onClose={() => setJobToDelete(null)}
        onConfirm={() => {
          if (jobToDelete) {
            deleteApplication(jobToDelete.id);
            setJobToDelete(null);
          }
        }}
      />
    </div>
  );
};
