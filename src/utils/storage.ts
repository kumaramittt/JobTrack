import { JobApplication, UserProfile, NotificationItem, ThemeMode } from '../types/job';

const STORAGE_KEYS = {
  APPLICATIONS: 'jobtrack_applications_v1',
  PROFILE: 'jobtrack_profile_v1',
  THEME: 'jobtrack_theme_v1',
  NOTIFICATIONS: 'jobtrack_notifications_v1',
  INITIALIZED: 'jobtrack_initialized_v1',
  IS_DEMO: 'jobtrack_is_demo_v1',
  AUTH_SESSION: 'jobtrack_auth_session_v1',
};

export const INITIAL_DEMO_APPLICATIONS: JobApplication[] = [
  {
    id: 'demo-1',
    company: 'Google',
    role: 'Frontend Developer',
    location: 'Mountain View, CA (Hybrid)',
    jobType: 'Full-time',
    appliedDate: '2026-11-01',
    status: 'Applied',
    jobLink: 'https://careers.google.com/jobs/results/123456',
    salaryRange: '$140,000 - $175,000',
    notes: 'Submitted resume highlighting React 19, TypeScript, and modern web perf projects. Waiting for recruiter review.',
    contactPerson: 'Sarah Jenkins',
    contactEmail: 's.jenkins@google.com',
    createdAt: '2026-11-01T10:00:00.000Z',
    updatedAt: '2026-11-01T10:00:00.000Z',
  },
  {
    id: 'demo-2',
    company: 'Microsoft',
    role: 'Software Engineer',
    location: 'Redmond, WA (Remote)',
    jobType: 'Full-time',
    appliedDate: '2026-10-25',
    status: 'Interview',
    jobLink: 'https://careers.microsoft.com/us/en/job/789101',
    salaryRange: '$135,000 - $165,000',
    notes: 'Technical screen passed with flying colors! Round 2 System Design & Coding interview scheduled for this Thursday.',
    contactPerson: 'David Miller',
    contactEmail: 'david.m@microsoft.com',
    interviewDate: '2026-11-12',
    interviewTime: '14:00',
    interviewType: 'Online',
    interviewStatus: 'Scheduled',
    interviewLink: 'https://teams.microsoft.com/l/meetup-join/19%3ameeting_mock123',
    createdAt: '2026-10-25T14:30:00.000Z',
    updatedAt: '2026-11-04T09:15:00.000Z',
  },
  {
    id: 'demo-3',
    company: 'Amazon',
    role: 'Web Developer Intern',
    location: 'Seattle, WA',
    jobType: 'Internship',
    appliedDate: '2026-10-18',
    status: 'Rejected',
    jobLink: 'https://amazon.jobs/en/jobs/234567',
    salaryRange: '$55 / hour',
    notes: 'Received automated feedback after assessment round. Good learning experience with Amazon Leadership Principles.',
    contactPerson: 'University Recruiting Team',
    contactEmail: 'aws-interns@amazon.com',
    createdAt: '2026-10-18T16:00:00.000Z',
    updatedAt: '2026-10-29T11:20:00.000Z',
  },
  {
    id: 'demo-4',
    company: 'Infosys',
    role: 'React Developer',
    location: 'Bangalore, India',
    jobType: 'Full-time',
    appliedDate: '2026-11-03',
    status: 'Applied',
    jobLink: 'https://career.infosys.com/jobdesc?id=567890',
    salaryRange: '₹8,00,000 - ₹12,00,000',
    notes: 'Referral through college senior. Application acknowledged; initial technical screening expected next week.',
    contactPerson: 'Priya Sharma',
    contactEmail: 'priya.s@infosys.com',
    createdAt: '2026-11-03T11:00:00.000Z',
    updatedAt: '2026-11-03T11:00:00.000Z',
  },
  {
    id: 'demo-5',
    company: 'TCS',
    role: 'Graduate Trainee',
    location: 'Mumbai, India',
    jobType: 'Full-time',
    appliedDate: '2026-10-12',
    status: 'Selected',
    jobLink: 'https://ibegin.tcs.com/candidate/job/345678',
    salaryRange: '₹5,00,000 - ₹7,00,000',
    notes: 'Offer letter received! Verification documents submitted. Joining date expected in early 2027.',
    contactPerson: 'Amitabh Verma',
    contactEmail: 'hr.campus@tcs.com',
    createdAt: '2026-10-12T09:00:00.000Z',
    updatedAt: '2026-11-02T15:45:00.000Z',
  },
];

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Ankit Sharma',
  email: 'ankitsharma@gmail.com',
  targetRole: 'Full Stack / Frontend Developer',
  location: 'Bangalore, India',
  timezone: 'Asia/Kolkata',
  isDemoAccount: false,
};

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Upcoming Interview',
    message: 'Microsoft Round 2 technical interview is coming up on Thursday, Nov 12.',
    date: '2026-11-05',
    type: 'interview',
    read: false,
    jobId: 'demo-2',
  },
  {
    id: 'notif-2',
    title: 'Offer Letter Confirmed',
    message: 'TCS Graduate Trainee selection offer has been marked as Selected. Congrats!',
    date: '2026-11-02',
    type: 'status',
    read: true,
    jobId: 'demo-5',
  },
  {
    id: 'notif-3',
    title: 'Application Follow-up',
    message: 'It has been 6 days since your application to Google. Consider checking your portal.',
    date: '2026-11-07',
    type: 'info',
    read: false,
    jobId: 'demo-1',
  },
];

export function getStoredIsDemo(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.IS_DEMO) === 'true';
  } catch {
    return false;
  }
}

export function saveStoredIsDemo(isDemo: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEYS.IS_DEMO, String(isDemo));
  } catch (err) {
    console.error('Error saving isDemo state', err);
  }
}

export function getStoredApplications(): JobApplication[] {
  try {
    const initialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    const data = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);

    // Initial first-run seed
    if (!initialized && data === null) {
      localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(INITIAL_DEMO_APPLICATIONS));
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
      localStorage.setItem(STORAGE_KEYS.IS_DEMO, 'true');
      return INITIAL_DEMO_APPLICATIONS;
    }

    if (data !== null) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }

    return [];
  } catch (err) {
    console.error('Error loading applications from localStorage', err);
    return [];
  }
}

export function saveStoredApplications(apps: JobApplication[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  } catch (err) {
    console.error('Error saving applications to localStorage', err);
  }
}

export function getStoredProfile(): UserProfile {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!data) return DEFAULT_USER_PROFILE;
    const parsed = JSON.parse(data);

    // If previously migrated to another user's email/name, update to requested user
    if (
      parsed.email === 'sharmashubham23@gmail.com' ||
      parsed.email === 'amitkumar678793@gmail.com' ||
      parsed.name === 'Amit Kumar' ||
      parsed.name === 'Shubham Sharma'
    ) {
      parsed.name = 'Ankit Sharma';
      parsed.email = 'ankitsharma@gmail.com';
      saveStoredProfile(parsed);
    }

    return { ...DEFAULT_USER_PROFILE, ...parsed };
  } catch {
    return DEFAULT_USER_PROFILE;
  }
}

export function saveStoredProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (err) {
    console.error('Error saving profile', err);
  }
}

export function clearStoredProfile(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
  } catch (err) {
    console.error('Error clearing profile', err);
  }
}

export function getStoredAuthSession(): { isAuthenticated: boolean; provider: 'google' | 'email' | 'guest' } {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
    if (!data) return { isAuthenticated: true, provider: 'email' };
    const parsed = JSON.parse(data);
    return {
      isAuthenticated: Boolean(parsed.isAuthenticated),
      provider: parsed.provider || 'email',
    };
  } catch {
    return { isAuthenticated: true, provider: 'email' };
  }
}

export function saveStoredAuthSession(session: { isAuthenticated: boolean; provider: 'google' | 'email' | 'guest' }): void {
  try {
    localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
  } catch (err) {
    console.error('Error saving auth session', err);
  }
}

export function getStoredTheme(): ThemeMode {
  try {
    const theme = localStorage.getItem(STORAGE_KEYS.THEME) as ThemeMode;
    if (theme === 'dark' || theme === 'light') return theme;
    return 'light';
  } catch {
    return 'light';
  }
}

export function saveStoredTheme(theme: ThemeMode): void {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch (err) {
    console.error('Error saving theme', err);
  }
}

export function getStoredNotifications(): NotificationItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!data) return INITIAL_NOTIFICATIONS;
    return JSON.parse(data);
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
}

export function saveStoredNotifications(notifs: NotificationItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  } catch (err) {
    console.error('Error saving notifications', err);
  }
}

// CSV Export Utility
export function exportApplicationsToCSV(applications: JobApplication[]): void {
  const headers = [
    'ID',
    'Company',
    'Role',
    'Location',
    'Job Type',
    'Status',
    'Application Date',
    'Salary Range',
    'Job Link',
    'Contact Person',
    'Contact Email',
    'Notes',
  ];

  const escapeCSV = (val: string | undefined): string => {
    if (!val) return '""';
    const clean = val.replace(/"/g, '""');
    return `"${clean}"`;
  };

  const rows = applications.map((app) => [
    escapeCSV(app.id),
    escapeCSV(app.company),
    escapeCSV(app.role),
    escapeCSV(app.location),
    escapeCSV(app.jobType),
    escapeCSV(app.status),
    escapeCSV(app.appliedDate),
    escapeCSV(app.salaryRange),
    escapeCSV(app.jobLink),
    escapeCSV(app.contactPerson),
    escapeCSV(app.contactEmail),
    escapeCSV(app.notes),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `jobtrack_applications_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// CSV Import Utility
export function parseApplicationsCSV(csvText: string): { applications: JobApplication[]; error?: string } {
  try {
    const lines = csvText.trim().split(/\r\n|\n/);
    if (lines.length < 2) {
      return { applications: [], error: 'CSV file is empty or missing headers.' };
    }

    // Split CSV line taking quotes into account
    const parseCSVLine = (text: string): string[] => {
      const result: string[] = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (c === '"') {
          if (inQuotes && text[i + 1] === '"') {
            cur += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (c === ',' && !inQuotes) {
          result.push(cur.trim());
          cur = '';
        } else {
          cur += c;
        }
      }
      result.push(cur.trim());
      return result;
    };

    const headerRow = parseCSVLine(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z]/g, ''));
    
    // Find column indexes
    const colMap: Record<string, number> = {
      company: headerRow.findIndex((h) => h.includes('company')),
      role: headerRow.findIndex((h) => h.includes('role') || h.includes('title') || h.includes('jobtitle')),
      location: headerRow.findIndex((h) => h.includes('location')),
      jobtype: headerRow.findIndex((h) => h.includes('jobtype') || h.includes('type')),
      status: headerRow.findIndex((h) => h.includes('status')),
      date: headerRow.findIndex((h) => h.includes('date') || h.includes('applied')),
      salary: headerRow.findIndex((h) => h.includes('salary')),
      link: headerRow.findIndex((h) => h.includes('link') || h.includes('url')),
      notes: headerRow.findIndex((h) => h.includes('notes') || h.includes('desc')),
    };

    if (colMap.company === -1 || colMap.role === -1) {
      return { applications: [], error: 'Missing required columns: "Company" and "Role / Job Title".' };
    }

    const imported: JobApplication[] = [];
    const validStatuses = ['Applied', 'Interview', 'Selected', 'Rejected'];
    const validJobTypes = ['Full-time', 'Internship', 'Part-time', 'Remote', 'Contract'];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const cols = parseCSVLine(lines[i]);
      const company = cols[colMap.company]?.trim();
      const role = cols[colMap.role]?.trim();

      if (!company || !role) continue;

      let status = (colMap.status !== -1 ? cols[colMap.status]?.trim() : 'Applied') as any;
      if (!validStatuses.includes(status)) {
        if (/offer|select|accept/i.test(status)) status = 'Selected';
        else if (/interview/i.test(status)) status = 'Interview';
        else if (/reject|declined/i.test(status)) status = 'Rejected';
        else status = 'Applied';
      }

      let jobType = (colMap.jobtype !== -1 ? cols[colMap.jobtype]?.trim() : 'Full-time') as any;
      if (!validJobTypes.includes(jobType)) {
        if (/intern/i.test(jobType)) jobType = 'Internship';
        else if (/remote/i.test(jobType)) jobType = 'Remote';
        else if (/part/i.test(jobType)) jobType = 'Part-time';
        else if (/contract/i.test(jobType)) jobType = 'Contract';
        else jobType = 'Full-time';
      }

      const appliedDate = (colMap.date !== -1 && cols[colMap.date]?.trim()) 
        ? cols[colMap.date].trim().slice(0, 10) 
        : new Date().toISOString().slice(0, 10);

      const app: JobApplication = {
        id: `import-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        company,
        role,
        location: (colMap.location !== -1 && cols[colMap.location]?.trim()) || 'Remote',
        jobType,
        appliedDate,
        status,
        salaryRange: colMap.salary !== -1 ? cols[colMap.salary]?.trim() : undefined,
        jobLink: colMap.link !== -1 ? cols[colMap.link]?.trim() : undefined,
        notes: colMap.notes !== -1 ? cols[colMap.notes]?.trim() : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      imported.push(app);
    }

    if (imported.length === 0) {
      return { applications: [], error: 'No valid job application records found in CSV.' };
    }

    return { applications: imported };
  } catch (err: any) {
    return { applications: [], error: `Failed to parse CSV: ${err.message || 'Unknown error'}` };
  }
}
