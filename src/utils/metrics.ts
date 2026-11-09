import { JobApplication, ApplicationMetrics } from '../types/job';
import { parseDateString } from './date';

/**
 * Standardized metrics calculation shared across Dashboard, Analytics, Kanban, and Sidebar.
 * Prevents statistical discrepancies across different application pages.
 */
export function calculateApplicationMetrics(applications: JobApplication[]): ApplicationMetrics {
  const total = applications.length;

  if (total === 0) {
    return {
      total: 0,
      applied: 0,
      interviewStage: 0,
      selected: 0,
      rejected: 0,
      interviewInvitations: 0,
      scheduledRounds: 0,
      interviewRate: 0,
      interviewToOfferRate: 0,
      offerRate: 0,
      activePipelines: 0,
      avgDaysToInterview: null,
    };
  }

  // 1. Applications currently in each stage
  const applied = applications.filter((a) => a.status === 'Applied').length;
  const interviewStage = applications.filter((a) => a.status === 'Interview').length;
  const selected = applications.filter((a) => a.status === 'Selected').length;
  const rejected = applications.filter((a) => a.status === 'Rejected').length;

  // 2. Distinct interview counts:
  // - Current in interview stage: interviewStage (apps currently actively interviewing)
  // - Total interview invitations received: apps that reached interview, or are selected (progressed through interview), or have scheduled dates
  const interviewInvitations = applications.filter(
    (a) => a.status === 'Interview' || a.status === 'Selected' || Boolean(a.interviewDate)
  ).length;

  // - Total interview rounds scheduled: applications with interviewDate set
  const scheduledRounds = applications.filter((a) => Boolean(a.interviewDate)).length;

  // 3. Clear formula rates
  // Interview Rate = (interviewInvitations / total) * 100
  const interviewRate = Math.round((interviewInvitations / total) * 100);

  // Interview to Offer Rate = (selected / interviewInvitations) * 100
  const interviewToOfferRate =
    interviewInvitations > 0 ? Math.round((selected / interviewInvitations) * 100) : 0;

  // Overall Offer Rate = (selected / total) * 100
  const offerRate = Math.round((selected / total) * 100);

  // Active pipelines = Applied + Interview
  const activePipelines = applied + interviewStage;

  // 4. Average days between application and interview
  let totalDays = 0;
  let validPairs = 0;

  applications.forEach((app) => {
    if (app.appliedDate && app.interviewDate) {
      const d1 = parseDateString(app.appliedDate).getTime();
      const d2 = parseDateString(app.interviewDate).getTime();
      if (!isNaN(d1) && !isNaN(d2)) {
        const diff = Math.max(0, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
        totalDays += diff;
        validPairs += 1;
      }
    }
  });

  const avgDaysToInterview = validPairs > 0 ? Math.round((totalDays / validPairs) * 10) / 10 : null;

  return {
    total,
    applied,
    interviewStage,
    selected,
    rejected,
    interviewInvitations,
    scheduledRounds,
    interviewRate,
    interviewToOfferRate,
    offerRate,
    activePipelines,
    avgDaysToInterview,
  };
}
