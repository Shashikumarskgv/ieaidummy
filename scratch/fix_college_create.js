const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../components/dq-admin/college/create/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Find the position of 'setIsSubmitting(true);'
const targetStr = 'setIsSubmitting(true);';
const targetIndex = content.indexOf(targetStr);
if (targetIndex === -1) {
  console.log("Could not find setIsSubmitting");
  process.exit(1);
}

// Check if 'validateStep' already exists before this index
if (content.indexOf('const validateStep = (stepNum: number) => {') !== -1) {
  console.log("validateStep already exists, skipping...");
  process.exit(0);
}

const insertionContent = `  const validateStep = (stepNum: number) => {
    const tempErrors: Record<string, string> = {};

    if (stepNum === 1) {
      if (!adminName.trim()) {
        tempErrors.adminName = "Admin Full Name is required";
      }
      if (!adminEmail.trim()) {
        tempErrors.adminEmail = "Official Email Address is required";
      } else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(adminEmail)) {
        tempErrors.adminEmail = "Invalid email format (e.g. admin@college.edu)";
      } else if (existingColleges.some(c => c.adminEmail.toLowerCase() === adminEmail.trim().toLowerCase())) {
        tempErrors.adminEmail = "This admin email is already registered";
      }
      if (!adminPhone.trim()) {
        tempErrors.adminPhone = "Phone Contact is required";
      } else if (!/^\\+?[0-9\\s\\-]{8,15}$/.test(adminPhone.trim())) {
        tempErrors.adminPhone = "Please enter a valid phone number (8-15 digits)";
      }
    } else if (stepNum === 2) {
      if (!collegeName.trim()) {
        tempErrors.collegeName = "Official College Name is required";
      }
      if (!collegeCode.trim()) {
        tempErrors.collegeCode = "College Code is required";
      } else if (existingColleges.some(c => c.code.toUpperCase() === collegeCode.trim().toUpperCase())) {
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
      } else if (!/^\\d{6}$/.test(postalCode.trim())) {
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

  const handleCreateCollege = async () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4)) {
      return;
    }
  `;

const newContent = content.slice(0, targetIndex) + insertionContent + content.slice(targetIndex);
fs.writeFileSync(filePath, newContent, 'utf8');
console.log("Code injected successfully!");
