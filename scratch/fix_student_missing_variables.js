const fs = require('fs');
const path = require('path');

// 1. Fix create student page
const createPath = path.join(__dirname, '../components/super-admin/student/create/page.tsx');
let createContent = fs.readFileSync(createPath, 'utf8');
const createStudentDataDef = `    const studentData = {
      rollNumber: rollNumber.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      personalEmail: personalEmail.trim(),
      officialEmail: officialEmail.trim() || undefined,
      contactNumber: contactNumber.trim(),
      department: department.trim(),
      section: section.trim(),
      status: isActive ? "Active" : "Inactive",
      graduationYear: Number(gradYear),
      cgpa: cgpaScore.trim() ? Number(cgpaScore) : undefined
    };

    const collegeCode = currentUser?.college_code || collegeId;

    try {`;
createContent = createContent.replace('    try {', createStudentDataDef);
fs.writeFileSync(createPath, createContent, 'utf8');
console.log("Restored studentData and collegeCode in create student page!");

// 2. Fix edit student page
const editPath = path.join(__dirname, '../components/super-admin/student/edit/[id]/page.tsx');
let editContent = fs.readFileSync(editPath, 'utf8');
const editStudentDataDef = `    const studentData = {
      rollNumber: rollNumber.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      personalEmail: personalEmail.trim(),
      officialEmail: officialEmail.trim() || undefined,
      contactNumber: contactNumber.trim(),
      department: department.trim(),
      section: section.trim(),
      status: isActive ? "Active" : "Inactive",
      graduationYear: Number(gradYear),
      cgpa: cgpaScore.trim() ? Number(cgpaScore) : undefined
    };

    const collegeCode = currentUser?.college_code || selectedCollege.id;

    try {`;
editContent = editContent.replace('    try {', editStudentDataDef);
fs.writeFileSync(editPath, editContent, 'utf8');
console.log("Restored studentData and collegeCode in edit student page!");
