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
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  name: string;
  email: string;
  targetRole: string;
  location?: string;
  avatarUrl?: string;
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
