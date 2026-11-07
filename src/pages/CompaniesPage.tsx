import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Search,
  Briefcase,
  ExternalLink,
  Plus,
  ArrowRight,
  MapPin,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useJobContext } from '../context/JobContext';
import { CompanyAvatar } from '../components/CompanyAvatar';
import { EmptyState } from '../components/EmptyState';
import { JobTypeBadge } from '../components/JobTypeBadge';

interface CompanyGroup {
  name: string;
  count: number;
  locations: string[];
  roles: string[];
  jobTypes: string[];
  statuses: {
    applied: number;
    interview: number;
    selected: number;
    rejected: number;
  };
  latestDate: string;
  hasJobLink?: string;
}

export const CompaniesPage: React.FC = () => {
  const { applications, setSearchQuery, resetDemoData } = useJobContext();
  const navigate = useNavigate();

  const [companySearch, setCompanySearch] = useState('');

  // Group applications by company
  const companyGroups: CompanyGroup[] = useMemo(() => {
    const map: Record<string, CompanyGroup> = {};

    applications.forEach((app) => {
      const companyKey = app.company.trim();
      if (!map[companyKey]) {
        map[companyKey] = {
          name: companyKey,
          count: 0,
          locations: [],
          roles: [],
          jobTypes: [],
          statuses: { applied: 0, interview: 0, selected: 0, rejected: 0 },
          latestDate: app.appliedDate,
          hasJobLink: app.jobLink,
        };
      }

      const group = map[companyKey];
      group.count += 1;
      if (!group.roles.includes(app.role)) {
        group.roles.push(app.role);
      }
      if (app.location && !group.locations.includes(app.location)) {
        group.locations.push(app.location);
      }
      if (app.jobType && !group.jobTypes.includes(app.jobType)) {
        group.jobTypes.push(app.jobType);
      }
      if (app.status === 'Applied') group.statuses.applied += 1;
      else if (app.status === 'Interview') group.statuses.interview += 1;
      else if (app.status === 'Selected') group.statuses.selected += 1;
      else if (app.status === 'Rejected') group.statuses.rejected += 1;

      if (new Date(app.appliedDate) > new Date(group.latestDate)) {
        group.latestDate = app.appliedDate;
      }
    });

    return Object.values(map).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [applications]);

  const filteredCompanies = useMemo(() => {
    if (!companySearch.trim()) return companyGroups;
    const q = companySearch.toLowerCase();
    return companyGroups.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.roles.some((r) => r.toLowerCase().includes(q)) ||
        c.locations.some((l) => l.toLowerCase().includes(q))
    );
  }, [companyGroups, companySearch]);

  const handleCompanyClick = (companyName: string) => {
    setSearchQuery(companyName);
    navigate('/applications');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Companies Directory
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Overview of all target employers, active pipelines, and positions applied to.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/add')}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-600/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Application</span>
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search companies, job roles, or locations..."
            value={companySearch}
            onChange={(e) => setCompanySearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white placeholder-slate-400"
          />
          {companySearch && (
            <button
              type="button"
              onClick={() => setCompanySearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Grid of Company Cards */}
      {filteredCompanies.length === 0 ? (
        <div className="p-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <EmptyState
            title={companySearch ? 'No companies matched your query' : 'No companies recorded yet'}
            description={
              companySearch
                ? `No company matches "${companySearch}". Try a different keyword.`
                : 'Companies will be automatically cataloged as you add job applications.'
            }
            onAddClick={() => navigate('/add')}
            onResetDemoClick={resetDemoData}
            actionText="Add Application"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCompanies.map((c) => (
            <div
              key={c.name}
              className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header: Avatar, Name, Count */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <CompanyAvatar name={c.name} size="lg" />
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {c.name}
                      </h3>
                      {c.locations.length > 0 && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{c.locations.join(', ')}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 font-mono">
                    {c.count} app{c.count > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Job Roles applied for */}
                <div className="mb-4">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Roles Applied ({c.roles.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {c.roles.map((role) => (
                      <span
                        key={role}
                        className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Status Breakdown Mini Bars */}
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 mb-4">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    Application Stages
                  </span>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-white dark:bg-slate-800 p-1.5 rounded border border-slate-100 dark:border-slate-700">
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold block">
                        Applied
                      </span>
                      <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                        {c.statuses.applied}
                      </span>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-1.5 rounded border border-slate-100 dark:border-slate-700">
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block">
                        Interview
                      </span>
                      <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                        {c.statuses.interview}
                      </span>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-1.5 rounded border border-slate-100 dark:border-slate-700">
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                        Offer
                      </span>
                      <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                        {c.statuses.selected}
                      </span>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-1.5 rounded border border-slate-100 dark:border-slate-700">
                      <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold block">
                        Rejected
                      </span>
                      <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                        {c.statuses.rejected}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action: view filtered applications */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">
                  Latest: {c.latestDate}
                </span>

                <button
                  type="button"
                  onClick={() => handleCompanyClick(c.name)}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-all cursor-pointer"
                >
                  <span>View Applications</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
