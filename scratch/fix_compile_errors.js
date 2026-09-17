const fs = require('fs');
const path = require('path');

// 1. Fix components/super-admin/hod-tpo/create/page.tsx
const createStaffPath = path.join(__dirname, '../components/super-admin/hod-tpo/create/page.tsx');
let createStaffContent = fs.readFileSync(createStaffPath, 'utf8');
createStaffContent = createStaffContent.replace(
  'onClick={() => setSelectedDept(item.deptName);\r\n                      if (errors.selectedDept) setErrors(prev => ({ ...prev, selectedDept: "" }));}',
  'onClick={() => { setSelectedDept(item.deptName); if (errors.selectedDept) setErrors(prev => ({ ...prev, selectedDept: "" })); }}'
);
fs.writeFileSync(createStaffPath, createStaffContent, 'utf8');
console.log("Fixed HOD Create Staff click handler braces!");

// 2. Fix components/super-admin/hod-tpo/edit/[id]/page.tsx
const editStaffPath = path.join(__dirname, '../components/super-admin/hod-tpo/edit/[id]/page.tsx');
let editStaffContent = fs.readFileSync(editStaffPath, 'utf8');
editStaffContent = editStaffContent.replace(
  'onClick={() => setSelectedDept(item.deptName);\r\n                      if (errors.selectedDept) setErrors(prev => ({ ...prev, selectedDept: "" }));}',
  'onClick={() => { setSelectedDept(item.deptName); if (errors.selectedDept) setErrors(prev => ({ ...prev, selectedDept: "" })); }}'
);
fs.writeFileSync(editStaffPath, editStaffContent, 'utf8');
console.log("Fixed HOD Edit Staff click handler braces!");
