const fs = require('fs');
const path = require('path');

// 1. Fix create staff page
const createPath = path.join(__dirname, '../components/super-admin/hod-tpo/create/page.tsx');
let createContent = fs.readFileSync(createPath, 'utf8');
const createStaffDataDef = `    const staffData = {
      employeeId: empId.trim(),
      name: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      role: role,
      status: isActive ? "Active" : "Inactive",
      department: role === "HOD" ? selectedDept : undefined,
      accessScope: role === "TPO" ? accessScope : undefined,
      selectedDepartments: role === "TPO" && accessScope === "Selected Departments" ? selectedTpoDepts : undefined
    };

    const currentUser = AuthService.getUser();
    const collegeCode = currentUser?.college_code || collegeId;

    try {`;
createContent = createContent.replace('    try {', createStaffDataDef);
fs.writeFileSync(createPath, createContent, 'utf8');
console.log("Restored staffData and collegeCode in create staff page!");

// 2. Fix edit staff page
const editPath = path.join(__dirname, '../components/super-admin/hod-tpo/edit/[id]/page.tsx');
let editContent = fs.readFileSync(editPath, 'utf8');
const editStaffDataDef = `    const staffData = {
      name: fullName.trim(),
      phone: phone.trim(),
      role: role,
      status: isActive ? "Active" : "Inactive",
      department: role === "HOD" ? selectedDept : undefined,
      accessScope: role === "TPO" ? accessScope : undefined,
      selectedDepartments: role === "TPO" && accessScope === "Selected Departments" ? selectedTpoDepts : undefined
    };

    const currentUser = AuthService.getUser();
    const collegeCode = currentUser?.college_code || selectedCollege.id;

    try {`;
editContent = editContent.replace('    try {', editStaffDataDef);
fs.writeFileSync(editPath, editContent, 'utf8');
console.log("Restored staffData and collegeCode in edit staff page!");
