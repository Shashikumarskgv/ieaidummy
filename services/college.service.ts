import api from "./api";

export interface CollegeCreateFormData {
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  adminDesignation?: string;
  collegeName: string;
  collegeCode: string;
  website?: string;
  domains?: string[];
  streetAddress?: string;
  city?: string;
  district?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  coordinates?: string;
  selectedInstTypes?: string[];
  academicProfile?: unknown;
  capacity?: string;
  logoName?: string | null;
  coverName?: string | null;
}

export interface CollegeCreatePayload {
  collegeName: string;
  collegeCode: string;
  website?: string;
  adminName: string;
  adminEmail: string;
  adminMobile: string;
  adminPhone?: string;
  adminDesignation?: string;
  domains?: string[];
  selectedInstTypes?: string[];
  streetAddress?: string;
  city?: string;
  district?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  coordinates?: string;
  academicProfile?: unknown;
  capacity?: number;
  logoName?: string | null;
  coverName?: string | null;
}

export interface AcademicCatalogItem {
  id: string;
  name: string;
  levels: AcademicCatalogLevel[];
}

export interface AcademicCatalogLevel {
  id: string;
  name: string;
  desc?: string;
  degrees: AcademicCatalogDegree[];
}

export interface AcademicCatalogDegree {
  id: string;
  name: string;
  departments?: string[];
}



export function normalizeAcademicCatalog(catalog: any[]): AcademicCatalogItem[] {
  if (!Array.isArray(catalog)) {
    return [];
  }

  return catalog.map((item) => ({
    id: String(item?.id || item?.name || ""),
    name: item?.name || item?.label || item?.id || "",
    levels: Array.isArray(item?.levels)
      ? item.levels.map((level: any) => ({
          id: String(level?.id || level?.name || ""),
          name: level?.name || level?.label || level?.id || "",
          desc: level?.desc || level?.description || undefined,
          degrees: Array.isArray(level?.degrees)
            ? level.degrees.map((degree: any) => ({
                id: String(degree?.id || degree?.name || ""),
                name: degree?.name || degree?.label || degree?.id || "",
                departments: Array.isArray(degree?.departments) ? degree.departments : []
              }))
            : []
        }))
      : []
  })).filter((item) => item.id && item.name);
}

export function buildCollegePayload(formData: CollegeCreateFormData): CollegeCreatePayload {
  return {
    collegeName: formData.collegeName.trim(),
    collegeCode: formData.collegeCode.trim().toUpperCase(),
    website: formData.website?.trim() || undefined,
    adminName: formData.adminName.trim(),
    adminEmail: formData.adminEmail.trim(),
    adminMobile: formData.adminPhone.trim(),
    adminPhone: formData.adminPhone.trim(),
    adminDesignation: formData.adminDesignation?.trim() || undefined,
    domains: formData.domains?.map((domain) => domain.trim().toLowerCase()) || [],
    selectedInstTypes: formData.selectedInstTypes?.map(String) || [],
    streetAddress: formData.streetAddress?.trim() || undefined,
    city: formData.city?.trim() || undefined,
    district: formData.district?.trim() || undefined,
    state: formData.state?.trim() || undefined,
    postalCode: formData.postalCode?.trim() || undefined,
    country: formData.country?.trim() || undefined,
    coordinates: formData.coordinates?.trim() || undefined,
    academicProfile: formData.academicProfile,
    capacity: Number(formData.capacity) || undefined,
    logoName: formData.logoName || undefined,
    coverName: formData.coverName || undefined
  };
}

export async function createCollege(formData: CollegeCreateFormData) {
  const payload = buildCollegePayload(formData);
  const response = await api.post("/super-admin/colleges", payload);
  return response.data;
}

export async function fetchAcademicCatalog() {
  try {
    const response = await api.get("/super-admin/colleges/academic-catalog");
    const normalized = normalizeAcademicCatalog(response?.data?.data || response?.data || []);
    if (normalized.length > 0) return normalized;
  } catch {}

  return normalizeAcademicCatalog([
    {
      id: "eng_tech",
      name: "Engineering & Technology",
      levels: [
        {
          id: "UG",
          name: "Undergraduate (UG)",
          degrees: [
            {
              id: "btech",
              name: "Bachelor of Technology (B.Tech)",
              departments: [
                "Computer Science & Engineering",
                "Information Technology",
                "Electronics & Communication Engineering",
                "Artificial Intelligence & Data Science"
              ]
            }
          ]
        },
        {
          id: "PG",
          name: "Postgraduate (PG)",
          degrees: [
            {
              id: "mtech",
              name: "Master of Technology (M.Tech)",
              departments: [
                "Computer Science & Engineering",
                "VLSI Design & Embedded Systems",
                "Data Science"
              ]
            }
          ]
        }
      ]
    }
  ]);
}

export async function fetchColleges() {
  const response = await api.get("/super-admin/colleges");
  const list = response.data?.data || response.data || [];
  return list.map((c: any) => ({
    ...c,
    status: c.status === "Verified" ? "Active" : c.status
  }));
}

export async function updateCollege(id: string, formData: CollegeCreateFormData) {
  const payload = buildCollegePayload(formData);
  const response = await api.put(`/super-admin/colleges/${id}`, payload);
  return response.data;
}

export async function updateCollegeStatus(id: string, status: string) {
  const response = await api.patch(`/super-admin/colleges/${id}/status`, { status });
  return response.data;
}

export async function deleteCollege(id: string) {
  const response = await api.delete(`/super-admin/colleges/${id}`);
  return response.data;
}

export async function fetchCollegeById(id: string) {
  const response = await api.get(`/super-admin/colleges/${id}`);
  const col = response.data?.data || response.data;
  if (col) {
    return {
      ...col,
      status: col.status === "Verified" ? "Active" : col.status
    };
  }
  return col;
}

export async function verifyOnboardingToken(token: string) {
  const response = await api.get(`/super-admin/colleges/onboarding/verify?token=${encodeURIComponent(token)}`);
  return response.data;
}

export async function setupOnboardingPassword(token: string, password: string) {
  const response = await api.post(`/super-admin/colleges/onboarding/setup-password`, { token, password });
  return response.data;
}

export async function resendCollegeInvitation(id: string) {
  const response = await api.post(`/super-admin/colleges/${id}/resend-invitation`);
  return response.data;
}

export async function getCollegeInvitationLink(id: string) {
  const response = await api.get(`/super-admin/colleges/${id}/invitation-link`);
  return response.data;
}

