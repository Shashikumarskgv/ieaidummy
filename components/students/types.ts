export type WorkingType = "Remote" | "Onsite" | "Hybrid" | "Part-Time" | "Internship" | "Freelance";

export interface AcademicDetail {
  id: string;
  type: string; // e.g. "School" | "Intermediate" | "Diploma" | "Graduation" | "Post-Graduation"
  institution: string;
  course: string;
  score: string;
  start_year: string;
  end_year: string;
  roll_number?: string;
}

export interface StudentProfileData {
  id: number;
  roll_number: string | null;
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  official_email?: string | null;
  mobile: string | null;
  contact_number: string;
  department?: string | null;
  section?: string | null;
  dob?: string | null;
  gender?: string | null;
  address?: string | null;
  profile_photo?: string | null;
  description?: string | null;
  designation?: string | null;
  company?: string | null;
  linkedin_url?: string | null;
  github_url?: string | null;
  portfolio_url?: string | null;
  placement_status?: string;
  interview_status?: string;
  earned_points?: number;
  target_role?: string | null;
  experience?: number;
  working_type?: WorkingType;
  preferred_location?: string | null;
  resume_url?: string | null;
  skills?: string[];
  languages?: string[];
  weak_areas?: string | null;
  joined_course?: string | null;
  joining_date?: string | null;
  college?: string | null;
  year_of_study?: string | null;
  batch_code?: string | null;
  created_at?: string;
  projects?: any[];
  achievements?: any[];
  academic_details?: AcademicDetail[];
  profile_completion?: number;
  current_semester?: number | string | null;
}
