// User roles enum matching backend
export enum UserRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  ADMIN = 'admin'
}

export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  blood_group?: string;
  aadhar?: string;
  allergies?: string;
  doctor_name?: string;
  visit_date?: string;
  totp_enabled?: boolean;
  role: UserRole;
  created_at: string;
  updated_at: string;
  // Doctor-specific fields
  specialization?: string;
  medical_license_number?: string;
  hospital_affiliation?: string;
  years_of_experience?: number;
  resume_verification_status?: boolean;
  resume_verification_confidence?: number;
  // Patient-specific fields
  doctor_id?: number;
}

// Alias for backward compatibility with dashboard
export interface PatientData extends User {}

export interface Record {
  id: string;
  filename: string;
  content?: string; // Make optional since list responses might not include content
  file_type: string;
  file_size: number;
  file_url?: string;
  created_at: string;
  updated_at: string;
  collection_id?: string;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  records?: Record[];
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  isFirstLaunch: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string; requireTotp?: boolean; userId?: number }>;
  verifyTotp: (userId: number, totpCode: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: UserData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  logoutAndResetLaunch: () => Promise<void>;
  markLaunchComplete: () => Promise<void>;
  getToken: () => Promise<string | null>;
  getValidToken: () => Promise<string>;
  refreshAccessToken: () => Promise<string>;
  // Role-based access helpers
  isPatient: () => boolean;
  isDoctor: () => boolean;
  isAdmin: () => boolean;
  hasRole: (role: UserRole) => boolean;
  getUserRole: () => UserRole | null;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  date_of_birth?: string;
  address?: string;
  emergency_contact?: string;
  medical_history?: string;
}

// User registration data
export interface UserData {
  email: string;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  blood_group: string; // Required field
  aadhar?: string;
  allergies?: string;
  doctor_name?: string;
  visit_date?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface Stats {
  collections: number;
  records: number;
  unorganized: number;
}

// Role-based interfaces
export interface DoctorInfo {
  id: number;
  first_name: string;
  last_name: string;
  specialization?: string;
  medical_license_number?: string;
  hospital_affiliation?: string;
  years_of_experience?: number;
  resume_verification_status?: boolean;
}

export interface PatientInfo {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  blood_group?: string;
  allergies?: string;
  doctor_name?: string;
  visit_date?: string;
}

export interface AdminStats {
  total_users: number;
  total_patients: number;
  total_doctors: number;
  total_collections: number;
  total_records: number;
  recent_registrations: number;
}

export interface DoctorDashboard {
  patients_count: number;
  total_records: number;
  recent_uploads: number;
  verification_status: boolean;
}

// Token payload interface
export interface TokenPayload {
  user_id: number;
  role: UserRole;
  exp: number;
  iat: number;
}
