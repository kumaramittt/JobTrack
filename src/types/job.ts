export type JobStatus = 'Applied' | 'Interview' | 'Selected' | 'Rejected';

export type JobType = 'Full-time' | 'Internship' | 'Part-time' | 'Remote' | 'Contract';

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  location: string;
  jobType: JobType;
  appliedDate: string; // YYYY-MM-DD
  status: JobStatus;
  jobLink?: string;
  salaryRange?: string;
  notes?: string;
  contactPerson?: string;
  contactEmail?: string;
  interviewDate?: string;
  interviewTime?: string; // HH:mm (e.g. '14:30' or '10:00 AM')
  interviewType?: 'Online' | 'Offline';
  interviewLink?: string;
  interviewStatus?: 'Scheduled' | 'Completed' | 'Rescheduled' | 'Cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  name: string;
  email: string;
  targetRole: string;
  location?: string;
  avatarUrl?: string;
  timezone?: string;
  isDemoAccount?: boolean;
}

export interface ApplicationMetrics {
  total: number;
  applied: number;
  interviewStage: number;
  selected: number;
  rejected: number;
  interviewInvitations: number;
  scheduledRounds: number;
  interviewRate: number;
  interviewToOfferRate: number;
  offerRate: number;
  activePipelines: number;
  avgDaysToInterview: number | null;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'info' | 'interview' | 'status' | 'alert';
  read: boolean;
  jobId?: string;
}

export type ThemeMode = 'light' | 'dark';
