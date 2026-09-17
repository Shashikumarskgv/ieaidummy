"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  User,
  Shield,
  Compass,
  Book,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  CloudUpload,
  Search,
  ChevronRight,
  BookOpen,
  Briefcase,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { fetchCollegeById, updateCollege, fetchColleges, fetchAcademicCatalog } from "@/services/college.service";

type AcademicCatalogLevel = {
  id: string;
  name: string;
  desc?: string;
  degrees: AcademicCatalogDegree[];
};

type AcademicCatalogDegree = {
  id: string;
  name: string;
  departments?: string[];
};

type AcademicCatalogType = {
  id: string;
  name: string;
  levels: AcademicCatalogLevel[];
};

const DESIGNATIONS = ["Principal", "Director", "Dean", "Chairman"];

export default function EditCollegePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const collegeId = searchParams.get("id");

  const [currentStep, setCurrentStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [collegesList, setCollegesList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form Fields State
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [adminDesignation, setAdminDesignation] = useState("TPO");

  const [collegeName, setCollegeName] = useState("");
  const [collegeCode, setCollegeCode] = useState("");
  const [website, setWebsite] = useState("");
  const [domains, setDomains] = useState<string[]>([]);
  const [newDomain, setNewDomain] = useState("");

  // Detailed Location Fields
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("India");
  const [coordinates, setCoordinates] = useState("");

  // Dynamic Academic Catalog & Stepper Selection States for Step 4
  const [academicCatalog, setAcademicCatalog] = useState<AcademicCatalogType[]>([]);
  const [selectedInstTypes, setSelectedInstTypes] = useState<string[]>([]);
  
  // Selection State: { [instType]: { [level]: { [degree]: [departments] } } }
  const [academicProfile, setAcademicProfile] = useState<any>({});

  // Current selections in step 4 selector panel
  const [activeTab, setActiveTab] = useState("");
  const [activeLevel, setActiveLevel] = useState("");
  const [activeDegree, setActiveDegree] = useState("");

  // Search filter query states for Panel 2 and Panel 3
  const [degreeSearch, setDegreeSearch] = useState("");
  const [deptSearch, setDeptSearch] = useState("");

  const [capacity, setCapacity] = useState("");

  // Logo / Cover preview state
  const [logoName, setLogoName] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverName, setCoverName] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  useEffect(() => {
    const loadCollegeData = async () => {
      if (!collegeId) {
        toast.error("Invalid college reference");
        router.push("/dq-admin/college");
        return;
      }
      try {
        setIsLoading(true);
        const [list, catalog, col] = await Promise.all([
          fetchColleges(),
          fetchAcademicCatalog(),
          fetchCollegeById(collegeId)
        ]);
        setCollegesList(list);
        setAcademicCatalog(catalog);

        if (col) {
          setAdminName(col.adminName || col.admin_name || "");
          setAdminEmail(col.adminEmail || col.admin_email || "");
          setAdminPhone(col.adminPhone || col.admin_phone || col.adminMobile || "");
          setAdminDesignation(col.adminDesignation || col.admin_designation || "TPO");
          setCollegeName(col.collegeName || col.name || "");
          setCollegeCode(col.collegeCode || col.code || "");
          setWebsite(col.website || "");
          setDomains(col.domains || []);
          
          setStreetAddress(col.streetAddress || col.street_address || "");
          setCity(col.city || "");
          setDistrict(col.district || "");
          setState(col.state || "");
          setPostalCode(col.postalCode || col.postal_code || "");
          setCountry(col.country || "India");
          setCoordinates(col.coordinates || "");
          
          setCapacity((col.capacity || "").toString());

          // Match saved institution types with dynamic catalog
          const rawTypes: string[] = col.selectedInstTypes || col.selected_inst_types || col.types || [];
          const matchedTypes = rawTypes.map((t: string) => {
            const match = catalog.find(item => item.name === t || item.id === t);
            return match ? match.id : t;
          }).filter(Boolean);

          const finalTypes = matchedTypes.length > 0 ? matchedTypes : (catalog.length > 0 ? [catalog[0].id] : []);
          setSelectedInstTypes(finalTypes);

          const profileData = col.academicProfile || col.academic_profile || {};
          const parsedProfile = typeof profileData === "string" ? JSON.parse(profileData) : profileData;
          setAcademicProfile(parsedProfile || {});

          if (finalTypes.length > 0) {
            const initialTab = finalTypes[0];
            setActiveTab(initialTab);
            const activeTypeConfig = catalog.find(t => t.id === initialTab);
            if (activeTypeConfig && activeTypeConfig.levels.length > 0) {
              const firstLvl = activeTypeConfig.levels[0];
              setActiveLevel(firstLvl.id);
              if (firstLvl.degrees.length > 0) {
                setActiveDegree(firstLvl.degrees[0].id);
              }
            }
          }
          
          if (col.logoUrl || col.logo_url || col.logoName) {
            const logo = col.logoUrl || col.logo_url || col.logoName;
            setLogoName(logo);
            setLogoPreview(logo);
          }
          if (col.coverUrl || col.cover_url || col.coverName) {
            const cover = col.coverUrl || col.cover_url || col.coverName;
            setCoverName(cover);
            setCoverPreview(cover);
          }
        } else {
          toast.error("College profile not found");
          router.push("/dq-admin/college");
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to load college details.");
        router.push("/dq-admin/college");
      } finally {
        setIsLoading(false);
      }
    };
    loadCollegeData();
  }, [collegeId]);

  // Update active tab when selected types change
  useEffect(() => {
    if (selectedInstTypes.length > 0) {
      if (!selectedInstTypes.includes(activeTab)) {
        setActiveTab(selectedInstTypes[0]);
      }
    }
  }, [selectedInstTypes]);

  useEffect(() => {
    const activeTypeConfig = academicCatalog.find(t => t.id === activeTab);
    if (activeTypeConfig) {
      if (!activeTypeConfig.levels.some(l => l.id === activeLevel)) {
        if (activeTypeConfig.levels.length > 0) {
          setActiveLevel(activeTypeConfig.levels[0].id);
        }
      }
    }
  }, [activeTab, academicCatalog]);

  useEffect(() => {
    const activeTypeConfig = academicCatalog.find(t => t.id === activeTab);
    if (activeTypeConfig) {
      const activeLevelConfig = activeTypeConfig.levels.find(l => l.id === activeLevel);
      if (activeLevelConfig && activeLevelConfig.degrees.length > 0) {
        if (!activeLevelConfig.degrees.some(d => d.id === activeDegree)) {
          setActiveDegree(activeLevelConfig.degrees[0].id);
        }
      }
    }
  }, [activeLevel, activeTab, academicCatalog]);

  // Duplicate checks excluding current editing college
  const isEmailDuplicate = collegesList.some(
    c => String(c.id) !== String(collegeId) && (c.adminEmail || c.admin_email || "").toLowerCase() === adminEmail.trim().toLowerCase()
  );
  const isEmailValidFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail);
  const isEmailOk = adminEmail ? (!isEmailDuplicate && isEmailValidFormat) : false;

  const isCodeDuplicate = collegesList.some(
    c => String(c.id) !== String(collegeId) && (c.code || c.college_code || c.collegeCode || "").toUpperCase() === collegeCode.trim().toUpperCase()
  );
  const isCodeOk = collegeCode ? !isCodeDuplicate : false;

  const handleAddDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;
    const cleanDomain = newDomain.trim().toLowerCase();
    if (domains.includes(cleanDomain)) {
      toast.error("Domain already registered");
      return;
    }
    setDomains([...domains, cleanDomain]);
    setNewDomain("");
  };

  const handleRemoveDomain = (dom: string) => {
    setDomains(domains.filter(d => d !== dom));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Logo must be less than 2MB");
        return;
      }
      setLogoName(file.name);
      setLogoPreview(URL.createObjectURL(file));
      toast.success("Logo updated");
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Cover banner must be less than 5MB");
        return;
      }
      setCoverName(file.name);
      setCoverPreview(URL.createObjectURL(file));
      toast.success("Cover banner updated");
    }
  };

  // Academic Profile handlers
  const handleTypeToggle = (typeId: string) => {
    if (selectedInstTypes.includes(typeId)) {
      if (selectedInstTypes.length === 1) {
        toast.warning("At least one institution type must be selected");
        return;
      }
      setSelectedInstTypes(selectedInstTypes.filter(id => id !== typeId));
      if (errors.selectedInstTypes) setErrors(prev => ({ ...prev, selectedInstTypes: "" }));
      const updatedProfile = { ...academicProfile };
      delete updatedProfile[typeId];
      setAcademicProfile(updatedProfile);
    } else {
      setSelectedInstTypes([...selectedInstTypes, typeId]);
      if (errors.selectedInstTypes) setErrors(prev => ({ ...prev, selectedInstTypes: "" }));
      setAcademicProfile({
        ...academicProfile,
        [typeId]: {}
      });
      setActiveTab(typeId);
    }
  };

  const handleDegreeToggle = (degreeId: string) => {
    const typeState = academicProfile[activeTab] || {};
    const levelState = typeState[activeLevel] || {};
    const hasDegree = !!levelState[degreeId];

    const updatedProfile = { ...academicProfile };
    if (!updatedProfile[activeTab]) updatedProfile[activeTab] = {};
    if (!updatedProfile[activeTab][activeLevel]) updatedProfile[activeTab][activeLevel] = {};

    if (hasDegree) {
      delete updatedProfile[activeTab][activeLevel][degreeId];
    } else {
      updatedProfile[activeTab][activeLevel][degreeId] = [];
    }
    setAcademicProfile(updatedProfile);
    setActiveDegree(degreeId);
  };

  const handleDeptToggle = (deptName: string) => {
    const typeState = academicProfile[activeTab] || {};
    const levelState = typeState[activeLevel] || {};
    const selectedDepts = levelState[activeDegree] || [];

    const updatedProfile = { ...academicProfile };
    if (!updatedProfile[activeTab]) updatedProfile[activeTab] = {};
    if (!updatedProfile[activeTab][activeLevel]) updatedProfile[activeTab][activeLevel] = {};
    if (!updatedProfile[activeTab][activeLevel][activeDegree]) updatedProfile[activeTab][activeLevel][activeDegree] = [];

    if (selectedDepts.includes(deptName)) {
      updatedProfile[activeTab][activeLevel][activeDegree] = selectedDepts.filter((d: string) => d !== deptName);
      if (errors.academicProfile) setErrors(prev => ({ ...prev, academicProfile: "" }));
    } else {
      updatedProfile[activeTab][activeLevel][activeDegree] = [...selectedDepts, deptName];
      if (errors.academicProfile) setErrors(prev => ({ ...prev, academicProfile: "" }));
    }
    setAcademicProfile(updatedProfile);
  };

  const handleSelectAllDepts = (depts: string[], isAllChecked: boolean) => {
    const updatedProfile = { ...academicProfile };
    if (!updatedProfile[activeTab]) updatedProfile[activeTab] = {};
    if (!updatedProfile[activeTab][activeLevel]) updatedProfile[activeTab][activeLevel] = {};

    if (isAllChecked) {
      updatedProfile[activeTab][activeLevel][activeDegree] = [];
    } else {
      updatedProfile[activeTab][activeLevel][activeDegree] = depts;
    }
    setAcademicProfile(updatedProfile);
  };

  // Summary counts
  const summaryDetails = useMemo(() => {
    let totalPrograms = 0;
    let totalDepartments = 0;
    const structure: any[] = [];

    selectedInstTypes.forEach(typeId => {
      const typeConfig = academicCatalog.find(t => t.id === typeId);
      if (!typeConfig) return;

      const typeProfile = academicProfile[typeId] || {};
      const typeItem: any = {
        id: typeId,
        name: typeConfig.name,
        degrees: []
      };

      typeConfig.levels.forEach(lvl => {
        const lvlProfile = typeProfile[lvl.id] || {};
        lvl.degrees.forEach(deg => {
          const depts = lvlProfile[deg.id] || [];
          if (depts.length > 0) {
            totalPrograms += 1;
            totalDepartments += depts.length;
            typeItem.degrees.push({
              id: deg.id,
              name: deg.name,
              levelName: lvl.name,
              depts: depts
            });
          }
        });
      });

      if (typeItem.degrees.length > 0) {
        structure.push(typeItem);
      }
    });

    return { totalPrograms, totalDepartments, structure };
  }, [selectedInstTypes, academicProfile, academicCatalog]);

  const validateStep = (stepNum: number) => {
    const tempErrors: Record<string, string> = {};

    if (stepNum === 1) {
      if (!adminName.trim()) {
        tempErrors.adminName = "Admin Full Name is required";
      }
      if (!adminEmail.trim()) {
        tempErrors.adminEmail = "Official Email Address is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) {
        tempErrors.adminEmail = "Invalid email format (e.g. admin@college.edu)";
      } else if (collegesList.some(c => String(c.id) !== String(collegeId) && (c.adminEmail || c.admin_email || "").toLowerCase() === adminEmail.trim().toLowerCase())) {
        tempErrors.adminEmail = "This admin email is already registered";
      }
      if (!adminPhone.trim()) {
        tempErrors.adminPhone = "Phone Contact is required";
      } else if (!/^\+?[0-9\s\-]{8,15}$/.test(adminPhone.trim())) {
        tempErrors.adminPhone = "Please enter a valid phone number (8-15 digits)";
      }
    } else if (stepNum === 2) {
      if (!collegeName.trim()) {
        tempErrors.collegeName = "Official College Name is required";
      }
      if (!collegeCode.trim()) {
        tempErrors.collegeCode = "College Code is required";
      } else if (collegesList.some(c => String(c.id) !== String(collegeId) && (c.code || c.college_code || c.collegeCode || "").toUpperCase() === collegeCode.trim().toUpperCase())) {
        tempErrors.collegeCode = "This College Code already exists";
      }
      if (domains.length === 0) {
        tempErrors.domains = "At least one approved email domain is required";
      }
    } else if (stepNum === 3) {
      if (!streetAddress.trim()) {
        tempErrors.streetAddress = "Street Address / Landmark is required";
      }
      if (!city.trim()) {
        tempErrors.city = "City is required";
      }
      if (!district.trim()) {
        tempErrors.district = "District is required";
      }
      if (!state.trim()) {
        tempErrors.state = "State is required";
      }
      if (!postalCode.trim()) {
        tempErrors.postalCode = "Postal Code / Pincode is required";
      } else if (!/^\d{6}$/.test(postalCode.trim())) {
        tempErrors.postalCode = "Postal code must be a 6-digit number";
      }
    } else if (stepNum === 4) {
      if (selectedInstTypes.length === 0) {
        tempErrors.selectedInstTypes = "At least one Institution Type must be selected";
      }
      if (summaryDetails.totalDepartments === 0) {
        tempErrors.academicProfile = "At least one Program & Department must be selected";
      }
      if (!capacity.trim()) {
        tempErrors.capacity = "Student Intake Capacity is required";
      } else if (Number(capacity) <= 0 || isNaN(Number(capacity))) {
        tempErrors.capacity = "Intake Capacity must be a number greater than 0";
      }
    }

    setErrors(tempErrors);

    const isValid = Object.keys(tempErrors).length === 0;
    if (!isValid) {
      toast.error("Please fill in all required fields correctly.");
    }
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSaveChanges = async () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4)) {
      return;
    }

    try {
      setIsSaving(true);
      await updateCollege(collegeId!, {
        adminName: adminName.trim(),
        adminEmail: adminEmail.trim(),
        adminPhone: adminPhone.trim(),
        adminDesignation,
        collegeName: collegeName.trim(),
        collegeCode: collegeCode.trim(),
        website: website.trim(),
        domains,
        streetAddress: streetAddress.trim(),
        city: city.trim(),
        district: district.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
        country: country.trim(),
        coordinates: coordinates.trim() || undefined,
        selectedInstTypes,
        academicProfile,
        capacity,
        logoName,
        coverName
      });

      setIsSuccess(true);
      toast.success("College profile updated successfully!");

      setTimeout(() => {
        router.push("/dq-admin/college");
      }, 2000);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to save college details.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-muted-foreground gap-2 animate-in fade-in duration-200">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-sm font-semibold">Loading college profile...</span>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 animate-bounce">
          <Check className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight">College Profile Updated!</h2>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Changes saved successfully for <span className="text-foreground font-semibold">{collegeName}</span>. Returning to Colleges portal...
          </p>
        </div>
      </div>
    );
  }

  const steps = [
    { num: 1, label: "Admin", icon: User },
    { num: 2, label: "Institution", icon: Shield },
    { num: 3, label: "Location", icon: Compass },
    { num: 4, label: "Academic", icon: Book },
    { num: 5, label: "Branding", icon: ImageIcon }
  ];

  const activeTypeConfig = academicCatalog.find(t => t.id === activeTab);
  const activeLevelConfig = activeTypeConfig?.levels.find(l => l.id === activeLevel);
  const activeDegreeConfig = activeLevelConfig?.degrees.find(d => d.id === activeDegree);

  const filteredDegrees = activeLevelConfig
    ? activeLevelConfig.degrees.filter(d => d.name.toLowerCase().includes(degreeSearch.toLowerCase()))
    : [];

  const filteredDepts = activeDegreeConfig?.departments
    ? activeDegreeConfig.departments.filter(dept => dept.toLowerCase().includes(deptSearch.toLowerCase()))
    : [];

  const isAllDeptsChecked = Boolean(activeTab && activeLevel && activeDegree) && filteredDepts.length > 0 && filteredDepts.every(d =>
    (academicProfile[activeTab]?.[activeLevel]?.[activeDegree] || []).includes(d)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit College Profile</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Modify onboarding settings for {collegeName || "Institution"}.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.push("/dq-admin/college")} className="rounded-xl flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Cancel
        </Button>
      </div>

      {/* Top Padded Card Stepper */}
      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {steps.map((st, idx) => {
            const isActive = currentStep === st.num;
            const isCompleted = currentStep > st.num;
            return (
              <React.Fragment key={st.num}>
                <button
                  type="button"
                  disabled={st.num > currentStep}
                  onClick={() => {
                    if (st.num <= currentStep) {
                      setCurrentStep(st.num);
                    }
                  }}
                  className="flex items-center gap-3 text-left focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border ${isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-sm ring-4 ring-primary/10"
                    : isCompleted
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/25"
                      : "bg-muted text-muted-foreground border-border"
                    }`}>
                    {isCompleted ? <Check className="w-4 h-4" /> : st.num}
                  </div>
                  <div>
                    <p className={`text-xs font-bold tracking-tight ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                      {st.label}
                    </p>
                  </div>
                </button>
                {idx < steps.length - 1 && (
                  <div className={`hidden md:block h-[2px] flex-1 mx-4 rounded-full ${currentStep > st.num ? "bg-emerald-500/40" : "bg-border"
                    }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full">
        
        {/* STEP 1: Primary Admin */}
        {currentStep === 1 && (
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-5 animate-in fade-in duration-300 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <User className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-base">Primary Admin Details</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="adminName">Admin Full Name *</Label>
                <Input
                  id="adminName"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="adminEmail">Official Email Address *</Label>
                  {adminEmail && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold">
                      {isEmailOk ? (
                        <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Email Valid</span>
                      ) : isEmailDuplicate ? (
                        <span className="text-destructive flex items-center gap-1"><XCircle className="w-3 h-3" /> Email in use</span>
                      ) : (
                        <span className="text-amber-500">Invalid format</span>
                      )}
                    </span>
                  )}
                </div>
                <Input
                  id="adminEmail"
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="adminPhone">Phone Contact</Label>
                <Input
                  id="adminPhone"
                  value={adminPhone}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Backspace" ||
                      e.key === "Delete" ||
                      e.key === "Tab" ||
                      e.key === "Enter" ||
                      e.key === "ArrowLeft" ||
                      e.key === "ArrowRight" ||
                      e.ctrlKey ||
                      e.metaKey
                    ) {
                      return;
                    }
                    if (!/^[0-9]$/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/[^0-9]/g, "");
                    setAdminPhone(clean);
                  }}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="designation">Designation / Role *</Label>
                <select
                  id="designation"
                  value={adminDesignation}
                  onChange={(e) => setAdminDesignation(e.target.value)}
                  className="w-full bg-background border border-input rounded-xl p-2.5 text-sm text-foreground focus-visible:ring-primary/20"
                >
                  {DESIGNATIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Institution Details */}
        {currentStep === 2 && (
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-5 animate-in fade-in duration-300 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-base">Institution Identity</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="collegeName">Official College Name *</Label>
                <Input
                  id="collegeName"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="collegeCode">College Code *</Label>
                  {collegeCode && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold">
                      {isCodeOk ? (
                        <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Code Available</span>
                      ) : (
                        <span className="text-destructive flex items-center gap-1"><XCircle className="w-3 h-3" /> Code Exists</span>
                      )}
                    </span>
                  )}
                </div>
                <Input
                  id="collegeCode"
                  value={collegeCode}
                  onChange={(e) => setCollegeCode(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <Label className={errors.domains ? "text-destructive" : ""}>Approved Email Domains *</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. college.edu"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    className={`flex-1 ${errors.domains ? "border-destructive focus-visible:ring-destructive/20" : ""}`}
                  />
                  <Button type="button" onClick={handleAddDomain} variant="secondary" className="rounded-xl px-4">
                    Add Domain
                  </Button>
                </div>
                {errors.domains && <p className="text-xs text-destructive mt-1">{errors.domains}</p>}
                <div className="flex flex-wrap gap-2 pt-1">
                  {domains.map((dom) => (
                    <span key={dom} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                      {dom}
                      <button type="button" onClick={() => handleRemoveDomain(dom)} className="hover:text-destructive">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                  {domains.length === 0 && (
                    <span className="text-xs text-muted-foreground italic">No domains added.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Detailed Location */}
        {currentStep === 3 && (
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-5 animate-in fade-in duration-300 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <Compass className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-base">Location Coordinate Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="streetAddress" className={errors.streetAddress ? "text-destructive" : ""}>Street Address / Landmark *</Label>
                <Input
                  id="streetAddress"
                  placeholder="e.g. Karakambadi Road, Near Renigunta"
                  value={streetAddress}
                  onChange={(e) => {
                    setStreetAddress(e.target.value);
                    if (errors.streetAddress) setErrors(prev => ({ ...prev, streetAddress: "" }));
                  }}
                  className={errors.streetAddress ? "border-destructive focus-visible:ring-destructive/20" : ""}
                />
                {errors.streetAddress && <p className="text-xs text-destructive mt-1">{errors.streetAddress}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city" className={errors.city ? "text-destructive" : ""}>City *</Label>
                <Input
                  id="city"
                  placeholder="e.g. Tirupati"
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    if (errors.city) setErrors(prev => ({ ...prev, city: "" }));
                  }}
                  className={errors.city ? "border-destructive focus-visible:ring-destructive/20" : ""}
                />
                {errors.city && <p className="text-xs text-destructive mt-1">{errors.city}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="district" className={errors.district ? "text-destructive" : ""}>District *</Label>
                <Input
                  id="district"
                  placeholder="e.g. Chittoor District"
                  value={district}
                  onChange={(e) => {
                    setDistrict(e.target.value);
                    if (errors.district) setErrors(prev => ({ ...prev, district: "" }));
                  }}
                  className={errors.district ? "border-destructive focus-visible:ring-destructive/20" : ""}
                />
                {errors.district && <p className="text-xs text-destructive mt-1">{errors.district}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="state" className={errors.state ? "text-destructive" : ""}>State *</Label>
                <Input
                  id="state"
                  placeholder="e.g. Andhra Pradesh"
                  value={state}
                  onChange={(e) => {
                    setState(e.target.value);
                    if (errors.state) setErrors(prev => ({ ...prev, state: "" }));
                  }}
                  className={errors.state ? "border-destructive focus-visible:ring-destructive/20" : ""}
                />
                {errors.state && <p className="text-xs text-destructive mt-1">{errors.state}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="postalCode" className={errors.postalCode ? "text-destructive" : ""}>Postal Code / Pincode *</Label>
                <Input
                  id="postalCode"
                  placeholder="e.g. 517507"
                  value={postalCode}
                  onChange={(e) => {
                    setPostalCode(e.target.value);
                    if (errors.postalCode) setErrors(prev => ({ ...prev, postalCode: "" }));
                  }}
                  className={errors.postalCode ? "border-destructive focus-visible:ring-destructive/20" : ""}
                />
                {errors.postalCode && <p className="text-xs text-destructive mt-1">{errors.postalCode}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="coordinates">GPS Coordinates (Latitude, Longitude) (Optional)</Label>
                <Input
                  id="coordinates"
                  placeholder="e.g. 13.6288, 79.4192"
                  value={coordinates}
                  onChange={(e) => setCoordinates(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Progressive Hierarchical Academic Profile */}
        {currentStep === 4 && (
          <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in duration-300 w-full items-start">
            
            {/* Center Panel: Main selector content */}
            <div className="flex-1 space-y-6 w-full">
              
              {/* 1. Select Institution Types */}
              <div className={`bg-card border p-6 rounded-2xl shadow-sm space-y-4 ${errors.selectedInstTypes ? "border-destructive ring-1 ring-destructive/20" : "border-border"}`}>
                <h3 className={`font-bold text-sm flex items-center gap-1.5 ${errors.selectedInstTypes ? "text-destructive" : "text-foreground"}`}>
                  1. Select Institution Types <span className="text-destructive">*</span>
                </h3>
                {errors.selectedInstTypes && <p className="text-xs text-destructive font-semibold">{errors.selectedInstTypes}</p>}
                
                {/* Types grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {academicCatalog.map((t) => {
                    const isChecked = selectedInstTypes.includes(t.id);
                    return (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => handleTypeToggle(t.id)}
                        className={`flex items-center gap-3 p-4 rounded-xl border text-xs text-left transition-all ${
                          isChecked
                            ? "bg-primary/5 border-primary text-primary font-bold shadow-sm"
                            : "border-border text-foreground hover:bg-muted"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          readOnly
                          className="accent-primary w-4 h-4 pointer-events-none"
                        />
                        <GraduationCap className="w-4 h-4" />
                        <span>{t.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Selected types chips row */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mr-1">Selected Types:</span>
                  {selectedInstTypes.map((tid) => {
                    const label = academicCatalog.find(t => t.id === tid)?.name || tid;
                    return (
                      <span key={tid} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                        {label}
                        <button type="button" onClick={() => handleTypeToggle(tid)} className="hover:text-destructive">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* 2. Select Programs & Departments */}
              <div className={`bg-card border p-6 rounded-2xl shadow-sm space-y-4 ${errors.academicProfile ? "border-destructive ring-1 ring-destructive/20" : "border-border"}`}>
                <h3 className={`font-bold text-sm flex items-center gap-1.5 ${errors.academicProfile ? "text-destructive" : "text-foreground"}`}>
                  2. Select Programs & Departments <span className="text-destructive">*</span>
                </h3>
                {errors.academicProfile && <p className="text-xs text-destructive font-semibold">{errors.academicProfile}</p>}

                {/* Inst Type Tabs */}
                <div className="flex border-b border-border overflow-x-auto gap-2">
                  {selectedInstTypes.map((tid) => {
                    const label = academicCatalog.find(t => t.id === tid)?.name || tid;
                    const isActive = activeTab === tid;
                    return (
                      <button
                        type="button"
                        key={tid}
                        onClick={() => setActiveTab(tid)}
                        className={`py-2.5 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                          isActive
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                {/* 3-Panel hierarchical selector */}
                <div className="grid grid-cols-1 md:grid-cols-3 border border-border rounded-xl divide-y md:divide-y-0 md:divide-x divide-border overflow-hidden h-[360px] bg-background">
                  
                  {/* Panel 1: Program Level */}
                  <div className="p-3 overflow-y-auto space-y-2 flex flex-col">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 mb-1">1. Program Level</span>
                    {activeTypeConfig?.levels.map((lvl) => {
                      const isActive = activeLevel === lvl.id;
                      return (
                        <button
                          type="button"
                          key={lvl.id}
                          onClick={() => setActiveLevel(lvl.id)}
                          className={`w-full p-3 rounded-xl border text-left transition-all ${
                            isActive
                              ? "bg-primary/5 border-primary/45 text-primary font-bold shadow-sm"
                              : "border-transparent text-foreground hover:bg-muted/40"
                          }`}
                        >
                          <span className="text-xs block">{lvl.name}</span>
                          <span className="text-[10px] text-muted-foreground font-normal block mt-0.5">{lvl.desc}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Panel 2: Degree / Program */}
                  <div className="p-3 overflow-y-auto space-y-2 flex flex-col">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 mb-1">2. Degree / Program</span>
                    
                    {/* Search */}
                    <div className="relative px-2">
                      <Search className="absolute left-4 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                      <Input
                        placeholder="Search program..."
                        value={degreeSearch}
                        onChange={(e) => setDegreeSearch(e.target.value)}
                        className="h-8 pl-8 text-xs rounded-lg"
                      />
                    </div>

                    <div className="space-y-1 flex-1 overflow-y-auto pr-1">
                      {filteredDegrees.map((deg) => {
                        const isChecked = !!(academicProfile[activeTab]?.[activeLevel]?.[deg.id]);
                        const isActive = activeDegree === deg.id;
                        return (
                          <button
                            type="button"
                            key={deg.id}
                            onClick={() => {
                              if (!isChecked) {
                                handleDegreeToggle(deg.id);
                              } else {
                                setActiveDegree(deg.id);
                              }
                            }}
                            className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-all ${
                              isActive
                                ? "bg-primary/5 border-primary/30 text-primary font-bold"
                                  : "border-transparent text-foreground hover:bg-muted/40"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleDegreeToggle(deg.id)}
                                className="accent-primary w-3.5 h-3.5"
                              />
                              <span className="text-xs">{deg.name}</span>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                          </button>
                        );
                      })}
                      {filteredDegrees.length === 0 && (
                        <span className="text-xs text-muted-foreground italic p-2 block">No programs found</span>
                      )}
                    </div>
                  </div>

                  {/* Panel 3: Departments / Branches */}
                  <div className="p-3 overflow-y-auto space-y-2 flex flex-col">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 mb-1">3. Departments / Branches</span>
                    
                    {/* Search */}
                    <div className="relative px-2">
                      <Search className="absolute left-4 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                      <Input
                        placeholder="Search branch..."
                        value={deptSearch}
                        onChange={(e) => setDeptSearch(e.target.value)}
                        className="h-8 pl-8 text-xs rounded-lg"
                      />
                    </div>

                    {/* Select All */}
                    {filteredDepts.length > 0 && (
                      <div className="flex items-center justify-between bg-muted/20 p-2 rounded-lg mx-2">
                        <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isAllDeptsChecked}
                            onChange={() => handleSelectAllDepts(filteredDepts, isAllDeptsChecked)}
                            className="accent-primary w-3.5 h-3.5"
                          />
                          Select All
                        </label>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {(academicProfile[activeTab]?.[activeLevel]?.[activeDegree] || []).length} of {filteredDepts.length} selected
                        </span>
                      </div>
                    )}

                    <div className="space-y-1 flex-1 overflow-y-auto pr-1">
                      {filteredDepts.map((dept) => {
                        const isChecked = (academicProfile[activeTab]?.[activeLevel]?.[activeDegree] || []).includes(dept);
                        return (
                          <label
                            key={dept}
                            className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                              isChecked
                                ? "bg-primary/5 border-primary/20 text-primary font-semibold"
                                : "border-transparent text-foreground hover:bg-muted/40"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleDeptToggle(dept)}
                              className="accent-primary w-3.5 h-3.5"
                            />
                            <span className="truncate" title={dept}>{dept}</span>
                          </label>
                        );
                      })}
                      {!activeDegreeConfig && (
                        <span className="text-xs text-muted-foreground italic p-2 block text-center">Select a Program / Degree first</span>
                      )}
                      {activeDegreeConfig && filteredDepts.length === 0 && (
                        <span className="text-xs text-muted-foreground italic p-2 block text-center">No departments match branch search</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Capacity Card */}
              <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4 max-w-md">
                <h3 className="font-bold text-sm text-foreground">3. Student Intake Capacity</h3>
                <div className="space-y-1.5">
                  <Label htmlFor="capacity" className={errors.capacity ? "text-destructive" : ""}>Total Onboarding Intake *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="0"
                    placeholder="e.g. 1200"
                    value={capacity}
                    onKeyDown={(e) => {
                      if (e.key === "-" || e.key === "Minus" || e.key === "e" || e.key === "E") {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/-/g, "");
                      if (clean === "" || Number(clean) >= 0) {
                        setCapacity(clean);
                      }
                      if (errors.capacity) setErrors(prev => ({ ...prev, capacity: "" }));
                    }}
                    className={errors.capacity ? "border-destructive focus-visible:ring-destructive/20" : ""}
                  />
                  {errors.capacity && <p className="text-xs text-destructive mt-1">{errors.capacity}</p>}
                </div>
              </div>
            </div>

            {/* Right Panel: Slimmer Sticky Selected Academic Profile Summary */}
            <div className="w-full lg:w-[280px] bg-card border border-border rounded-2xl shadow-sm p-4 space-y-4 shrink-0">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <BookOpen className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-xs uppercase tracking-wider">Selected Profile</h3>
              </div>

              {/* Types list */}
              <div className="space-y-3">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Institution Types</span>
                <div className="space-y-1">
                  {selectedInstTypes.map(tid => (
                    <span key={tid} className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      {academicCatalog.find(t => t.id === tid)?.name || tid}
                    </span>
                  ))}
                  {selectedInstTypes.length === 0 && (
                    <span className="text-xs text-muted-foreground italic">None selected</span>
                  )}
                </div>
              </div>

              {/* Details list */}
              <div className="space-y-4 border-t border-border pt-3">
                {summaryDetails.structure.map((st) => (
                  <div key={st.id} className="space-y-1.5">
                    <span className="text-[9px] font-extrabold text-primary uppercase tracking-wide block">{st.name}</span>
                    
                    <div className="pl-2 border-l border-primary/20 space-y-2.5">
                      {st.degrees.map((dg: any) => (
                        <div key={dg.id} className="space-y-0.5">
                          <span className="text-[9px] font-bold text-muted-foreground block">{dg.levelName} – {dg.name} ({dg.depts.length})</span>
                          <div className="space-y-0.5 pl-1.5">
                            {dg.depts.map((dep: string) => (
                              <span key={dep} className="block text-[10px] text-foreground font-semibold truncate" title={dep}>
                                • {dep}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total metrics */}
              <div className="border-t border-border pt-3 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium">Programs:</span>
                  <span className="bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-md font-mono">{summaryDetails.totalPrograms}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium">Departments:</span>
                  <span className="bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-md font-mono">{summaryDetails.totalDepartments}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Branding */}
        {currentStep === 5 && (
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-6 animate-in fade-in duration-300 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <ImageIcon className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-base">Branding & Identity Assets</h3>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Upload Logo</Label>
                <div className="border border-dashed border-border p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 hover:bg-muted/30 transition-all relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {logoPreview ? (
                    <div className="w-20 h-20 rounded-xl overflow-hidden border border-border relative">
                      <img src={logoPreview} alt="Logo preview" className="object-cover w-full h-full" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-primary/5 border border-primary/10 rounded-2xl flex items-center justify-center text-primary">
                      <CloudUpload className="w-6 h-6" />
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-foreground">
                      {logoName || "Select Logo"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">PNG, JPG up to 2MB</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Upload Cover Banner</Label>
                <div className="border border-dashed border-border p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 hover:bg-muted/30 transition-all relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {coverPreview ? (
                    <div className="w-full h-20 rounded-xl overflow-hidden border border-border relative">
                      <img src={coverPreview} alt="Cover preview" className="object-cover w-full h-full" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-primary/5 border border-primary/10 rounded-2xl flex items-center justify-center text-primary">
                      <CloudUpload className="w-6 h-6" />
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-foreground">
                      {coverName || "Select Cover"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">PNG, JPG up to 5MB</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Action Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-card/90 backdrop-blur-md border-t border-border p-4 shadow-lg lg:pl-64 transition-all duration-300">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Button
            variant="outline"
            type="button"
            onClick={() => router.push("/dq-admin/college")}
            className="rounded-xl px-6 text-xs font-bold"
          >
            Cancel
          </Button>
          
          <div className="flex gap-2">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                disabled={isSaving}
                onClick={handleBack}
                className="rounded-xl px-5 text-xs font-bold"
              >
                Back
              </Button>
            )}
            
            {currentStep < 5 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="rounded-xl px-6 text-xs font-bold flex items-center gap-1 bg-primary hover:bg-primary/95 text-primary-foreground shadow"
              >
                Next <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <Button
                type="button"
                disabled={isSaving}
                onClick={handleSaveChanges}
                className="rounded-xl px-6 text-xs font-bold bg-primary hover:bg-primary/95 text-primary-foreground shadow flex items-center justify-center gap-1.5"
              >
                {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Save Changes
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
