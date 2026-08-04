import Papa from 'papaparse';
import QRCode from 'qrcode';
import { isSupabaseConfigured, upsertAllRegistrationsToSupabase, upsertProblemStatementToSupabase, upsertAnnouncementToSupabase } from './supabaseClient';

export interface TeamMember {
  name: string;
  email: string;
  phone: string;
  college?: string;
  department?: string;
  yearOfStudy?: string;
  rollNumber?: string;
  role: 'Leader' | 'Member';
}

export interface Team {
  teamId: string;
  teamName: string;
  teamSize?: number;
  leaderName: string;
  leaderEmail: string;
  leaderPhone: string;
  gender?: string;
  college: string;
  department: string;
  yearOfStudy?: string;
  rollNumber?: string;
  members: TeamMember[];
  accommodationRequired?: boolean;
  selectedThemeId?: string;
  attendanceStatus: 'Checked In' | 'Not Checked In';
  checkInTime?: string;
  checkedInBy?: string;
  qrCodeUrl?: string;
  password?: string;
  upiTransactionId?: string;
  paymentProofUrl?: string;
  paymentAmount?: number;
  paymentStatus?: 'Pending Verification' | 'Verified' | 'Rejected';
  registrationStatus: 'Verified' | 'Pending' | 'Pending Payment Verification';
  emailStatus: 'Sent' | 'Pending' | 'Failed';
}

export interface Theme {
  id: string;
  title: string;
  description: string;
  domain: string;
}

export interface ProblemStatement {
  id: string;
  psCode: string;
  title: string;
  description: string;
  themeId: string;
  pdfUrl?: string;
  status: 'Draft' | 'Published' | 'Unpublished';
  isPublished: boolean;
  rules?: string[];
  resources?: string[];
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  category: 'Urgent' | 'General' | 'Update';
  isPublished?: boolean;
}

export interface PortalState {
  themeSelectionEnabled: boolean;
  teams: Team[];
  themes: Theme[];
  problemStatements: ProblemStatement[];
  announcements: Announcement[];
}

const STORAGE_KEY = 'infinix26_portal_state_v3';

const INITIAL_STATE: PortalState = {
  themeSelectionEnabled: false,
  teams: [
    {
      teamId: 'INF-2026-001',
      teamName: 'Cyber Voyagers',
      leaderName: 'Arun Kumar',
      leaderEmail: 'arunkumar@ritrjpm.ac.in',
      leaderPhone: '+91 98765 43210',
      college: 'Ramco Institute of Technology',
      department: 'Computer Science & Engineering',
      attendanceStatus: 'Not Checked In',
      registrationStatus: 'Verified',
      emailStatus: 'Sent',
      password: 'hackathon2026',
      qrCodeUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      members: [
        { name: 'Arun Kumar', email: 'arunkumar@ritrjpm.ac.in', phone: '+91 98765 43210', role: 'Leader' },
        { name: 'Priya Sharma', email: 'priya.s@gmail.com', phone: '+91 98765 43211', role: 'Member' },
        { name: 'Karthik Raja', email: 'karthik.r@gmail.com', phone: '+91 98765 43212', role: 'Member' },
      ],
    },
    {
      teamId: 'INF-2026-002',
      teamName: 'Quantum Hackers',
      leaderName: 'Meena Sundaram',
      leaderEmail: 'meena.s@gmail.com',
      leaderPhone: '+91 94433 12345',
      college: 'College of Engineering Guindy (CEG), Anna University',
      department: 'Information Technology',
      attendanceStatus: 'Not Checked In',
      registrationStatus: 'Verified',
      emailStatus: 'Sent',
      password: 'hackathon2026',
      members: [
        { name: 'Meena Sundaram', email: 'meena.s@gmail.com', phone: '+91 94433 12345', role: 'Leader' },
        { name: 'Venkatesh Prasad', email: 'venkat.p@gmail.com', phone: '+91 94433 12346', role: 'Member' },
        { name: 'Divya Nair', email: 'divya.n@gmail.com', phone: '+91 94433 12347', role: 'Member' },
        { name: 'Sanjay Dutt', email: 'sanjay.d@gmail.com', phone: '+91 94433 12348', role: 'Member' },
      ],
    },
    {
      teamId: 'INF-2026-003',
      teamName: 'Oceanic AI Labs',
      leaderName: 'Rajesh Kannan',
      leaderEmail: 'rajesh.kannan@gmail.com',
      leaderPhone: '+91 91234 56789',
      college: 'PSG College of Technology, Coimbatore',
      department: 'Artificial Intelligence & Data Science',
      attendanceStatus: 'Checked In',
      checkInTime: 'Today, 09:15 AM',
      checkedInBy: 'Admin (RIT Team)',
      registrationStatus: 'Verified',
      emailStatus: 'Sent',
      password: 'hackathon2026',
      members: [
        { name: 'Rajesh Kannan', email: 'rajesh.kannan@gmail.com', phone: '+91 91234 56789', role: 'Leader' },
        { name: 'Ananya Roy', email: 'ananya.roy@gmail.com', phone: '+91 91234 56790', role: 'Member' },
      ],
    },
  ],
  themes: [
    {
      id: 'thm-1',
      title: 'Smart Intelligence',
      description: 'Build intelligent solutions using AI, ML, Computer Vision, and Generative AI.',
      domain: 'AI / ML',
    },
    {
      id: 'thm-2',
      title: 'Secure Computing',
      description: 'Develop secure digital systems focusing on cyber defense, privacy, and threat detection.',
      domain: 'Cybersecurity',
    },
    {
      id: 'thm-3',
      title: 'Healthcare & MedTech',
      description: 'Create innovative medical devices, diagnostics, and digital health tools.',
      domain: 'MedTech',
    },
    {
      id: 'thm-4',
      title: 'Cloud & DevOps',
      description: 'Build scalable cloud-native apps with automation, containers, and CI/CD pipelines.',
      domain: 'Cloud Infrastructure',
    },
    {
      id: 'thm-5',
      title: 'FinTech',
      description: 'Design smart financial tools for banking, fraud detection, and digital payments.',
      domain: 'FinTech',
    },
    {
      id: 'thm-6',
      title: 'Smart Automation',
      description: 'Intelligent engineering solutions using Robotics, IoT, BIM, Drones, and Smart Infrastructure.',
      domain: 'Mechanical & Civil',
    },
    {
      id: 'thm-7',
      title: 'Energy Innovation & Smart Grid',
      description: 'Innovative solutions for Smart Grids, Renewable Energy, Electric Mobility, and Power Electronics.',
      domain: 'EEE & ECE',
    },
  ],
  problemStatements: [
    {
      id: 'ps-1',
      psCode: 'PS-AI-01',
      title: 'Real-Time Deep-Sea Sonar Anomaly Detector',
      description: 'Develop a high-precision computer vision or signal processing pipeline that analyzes multi-spectral hydroacoustic signals to detect anomalies in underwater fiber pipelines.',
      themeId: 'thm-1',
      pdfUrl: '/sample-ps-ai-01.pdf',
      status: 'Published',
      isPublished: true,
      rules: [
        'Model must run under 100ms latency per hydroacoustic frame.',
        'Zero external cloud reliance during evaluation.',
        'Use open-source synthetic dataset or provided acoustic telemetry samples.',
      ],
      resources: [
        'Hydroacoustic Signal Spec Sheet (PDF)',
        'Sample Sonar Telemetry Dataset (CSV)',
        'Baseline Python Model Starter Code',
      ],
    },
    {
      id: 'ps-2',
      psCode: 'PS-W3-02',
      title: 'Transparent Maritime Carbon Credit Exchange',
      description: 'Build a decentralized protocol allowing port authorities to mint, trade, and audit verified blue carbon offsets with automated zero-knowledge proofs.',
      themeId: 'thm-2',
      pdfUrl: '/sample-ps-w3-02.pdf',
      status: 'Draft',
      isPublished: false,
      rules: [
        'Smart contracts must be deployed on Ethereum Sepolia Testnet.',
        'Frontend must integrate Wagmi / Ethers.js wallet authentication.',
      ],
      resources: ['EVM Blue Carbon Token Standard Draft', 'Port Logistics Mock API Docs'],
    },
    {
      id: 'ps-3',
      psCode: 'PS-IOT-03',
      title: 'Low-Latency Acoustic Mesh Communication Node',
      description: 'Design an acoustic telemetry simulation system that minimizes packet drop in turbulent thermal ocean layers.',
      themeId: 'thm-3',
      pdfUrl: '/sample-ps-iot-03.pdf',
      status: 'Unpublished',
      isPublished: false,
      rules: ['Mesh node simulation must support up to 50 concurrent nodes.'],
      resources: ['Acoustic Propagation Simulator Python Starter Kit'],
    },
  ],
  announcements: [
    {
      id: 'ann-1',
      title: "Welcome Hacking Teams to INFINIX'26!",
      message: 'All registered team leaders must verify their member contact info. Theme selection will open soon once Admin enables it.',
      timestamp: 'Today, 10:00 AM',
      category: 'General',
      isPublished: true,
    },
    {
      id: 'ann-2',
      title: 'Important: Hackathon Check-in Instructions',
      message: 'Bring your official College ID Card, laptops, extension boards, and Unstop registration ticket.',
      timestamp: 'Today, 11:30 AM',
      category: 'Urgent',
      isPublished: true,
    },
  ],
};

export function getPortalState(): PortalState {
  if (typeof window === 'undefined') return INITIAL_STATE;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading portal state from localStorage:', e);
  }
  return INITIAL_STATE;
}

export function savePortalState(state: PortalState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

    if (isSupabaseConfigured) {
      upsertAllRegistrationsToSupabase(state.teams);
      state.problemStatements.forEach((ps) => upsertProblemStatementToSupabase(ps));
      state.announcements.forEach((ann) => upsertAnnouncementToSupabase(ann));
    }
  } catch (e) {
    console.error('Error saving portal state:', e);
  }
}

// Generate QR Code Data URL helper
export async function generateTeamQRCode(teamId: string): Promise<string> {
  try {
    const qrData = teamId.trim();
    return await QRCode.toDataURL(qrData, {
      margin: 2,
      width: 300,
      color: { dark: '#000000', light: '#ffffff' },
    });
  } catch (e) {
    console.error('Error generating QR Code:', e);
    return '';
  }
}

// Generate Secure Random Password Helper
export function generateRandomPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let pass = '';
  for (let i = 0; i < 8; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

export interface CSVImportResult {
  updatedState: PortalState;
  importedCount: number;
  skippedCount: number;
  failedCount: number;
  validationErrors: string[];
}

// PapaParse Unstop CSV Parser
export function parseUnstopCSV(csvText: string, currentState: PortalState): CSVImportResult {
  const validationErrors: string[] = [];
  let importedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
  if (!parsed.data || parsed.data.length === 0) {
    validationErrors.push('CSV file contains no valid rows or empty data.');
    return { updatedState: currentState, importedCount: 0, skippedCount: 0, failedCount: 1, validationErrors };
  }

  const existingTeamIds = new Set(currentState.teams.map((t) => t.teamId.toUpperCase()));
  const newTeams: Team[] = [];

  const rows = parsed.data as Record<string, string>[];

  rows.forEach((row, rowIdx) => {
    // Find column values dynamically
    const getVal = (...keys: string[]) => {
      for (const k of keys) {
        const foundKey = Object.keys(row).find((rk) => rk.toLowerCase().includes(k.toLowerCase()));
        if (foundKey && row[foundKey]) return row[foundKey].trim();
      }
      return '';
    };

    const teamId = getVal('team id', 'team_id', 'id') || `INF-2026-${String(currentState.teams.length + newTeams.length + 1).padStart(3, '0')}`;
    const teamName = getVal('team name', 'team_name', 'name') || `Team ${teamId}`;
    const leaderName = getVal('leader name', 'leader_name', 'leader') || 'Team Leader';
    const leaderEmail = getVal('leader email', 'email') || `${teamId.toLowerCase()}@infinix.edu`;
    const leaderPhone = getVal('leader phone', 'phone', 'mobile', 'contact') || '+91 98765 43210';
    const college = getVal('college', 'organization', 'institute', 'school') || 'Participant College';
    const department = getVal('department', 'dept', 'branch') || 'Computer Science';

    if (existingTeamIds.has(teamId.toUpperCase())) {
      skippedCount++;
      return;
    }

    // Members parsing: check Member 1, Member 2, Member 3, Member 4 columns or single Members text
    const membersRaw = getVal('members', 'member details', 'team member');
    const parsedMembers: TeamMember[] = [];

    // Check individual member columns
    ['member 1', 'member 2', 'member 3', 'member 4'].forEach((mKey, idx) => {
      const mVal = getVal(mKey);
      if (mVal) {
        const match = mVal.match(/(.*?)\((.*?)\)/);
        const name = match ? match[1].trim() : mVal;
        const email = match ? match[2].trim() : `${name.toLowerCase().replace(/\s+/g, '')}@example.com`;
        parsedMembers.push({
          name: name || `Member ${idx + 1}`,
          email,
          phone: idx === 0 ? leaderPhone : '+91 90000 00000',
          role: idx === 0 ? 'Leader' : 'Member',
        });
      }
    });

    if (parsedMembers.length === 0 && membersRaw) {
      const memberEntries = membersRaw.split(';').map((m) => m.trim()).filter(Boolean);
      memberEntries.forEach((mStr, idx) => {
        const match = mStr.match(/(.*?)\((.*?)\)/);
        const name = match ? match[1].trim() : mStr;
        const email = match ? match[2].trim() : `${name.toLowerCase().replace(/\s+/g, '')}@example.com`;
        parsedMembers.push({
          name: name || `Member ${idx + 1}`,
          email,
          phone: idx === 0 ? leaderPhone : '+91 90000 00000',
          role: idx === 0 ? 'Leader' : 'Member',
        });
      });
    }

    if (parsedMembers.length === 0) {
      parsedMembers.push({ name: leaderName, email: leaderEmail, phone: leaderPhone, role: 'Leader' });
    }

    const generatedPassword = generateRandomPassword();

    const newTeam: Team = {
      teamId,
      teamName,
      leaderName,
      leaderEmail,
      leaderPhone,
      college,
      department,
      members: parsedMembers,
      attendanceStatus: 'Not Checked In',
      registrationStatus: 'Verified',
      emailStatus: 'Pending',
      password: generatedPassword,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
        JSON.stringify({ teamId, teamName, leaderName })
      )}`,
    };

    existingTeamIds.add(teamId.toUpperCase());
    newTeams.push(newTeam);
    importedCount++;
  });

  const updatedState: PortalState = {
    ...currentState,
    teams: [...currentState.teams, ...newTeams],
  };

  savePortalState(updatedState);
  return { updatedState, importedCount, skippedCount, failedCount, validationErrors };
}

// Export CSV Helper
export function exportToCSV(filename: string, rows: Record<string, any>[]): void {
  if (typeof window === 'undefined' || !rows || rows.length === 0) return;
  const csvStr = Papa.unparse(rows);
  const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
