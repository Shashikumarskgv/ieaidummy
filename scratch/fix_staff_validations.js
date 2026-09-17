const fs = require('fs');
const path = require('path');

function processFile(filePath, isEdit) {
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Declare errors state
  if (isEdit) {
    content = content.replace(
      'const [isActive, setIsActive] = useState(true);',
      'const [isActive, setIsActive] = useState(true);\r\n  const [errors, setErrors] = useState<Record<string, string>>({});'
    );
  } else {
    content = content.replace(
      'const [isActive, setIsActive] = useState(false);',
      'const [isActive, setIsActive] = useState(false);\r\n  const [errors, setErrors] = useState<Record<string, string>>({});'
    );
  }

  // 2. Replace submit handler
  const targetFuncStr = isEdit ? 'const handleSaveChanges = async () => {' : 'const handleCreateStaff = async () => {';
  const startIdx = content.indexOf(targetFuncStr);
  if (startIdx === -1) {
    console.error("Could not find submit function in " + filePath);
    return;
  }

  // Find the try block start
  const tryIdx = content.indexOf('try {', startIdx);
  if (tryIdx === -1) {
    console.error("Could not find try block in " + filePath);
    return;
  }

  const newValidator = `${targetFuncStr}
    const tempErrors: Record<string, string> = {};

    if (!empId.trim()) {
      tempErrors.empId = "Employee ID is required";
    } else if (isEmpIdDuplicate) {
      tempErrors.empId = "Employee ID already exists";
    }

    if (!fullName.trim()) {
      tempErrors.fullName = "Full Name is required";
    }

    if (!email.trim()) {
      tempErrors.email = "Email Address is required";
    } else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
      tempErrors.email = "Invalid email address format";
    } else if (!isEmailDomainOk) {
      tempErrors.email = \`Email must use approved domains: \${collegeDomains.join(" or ")}\`;
    }

    if (!phone.trim()) {
      tempErrors.phone = "Phone Contact is required";
    } else if (!/^\\+?[0-9\\s\\-]{8,15}$/.test(phone.trim())) {
      tempErrors.phone = "Please enter a valid phone number (8-15 digits)";
    }

    if (role === "HOD" && !selectedDept) {
      tempErrors.selectedDept = "HOD Department Allocation is required";
    }

    if (role === "TPO" && accessScope === "Selected Departments" && selectedTpoDepts.length === 0) {
      tempErrors.selectedTpoDepts = "Please select at least one department";
    }

    setErrors(tempErrors);

    if (Object.keys(tempErrors).length > 0) {
      toast.error("Please fill in all required fields correctly.");
      return;
    }

    `;

  content = content.slice(0, startIdx) + newValidator + content.slice(tryIdx);

  // 3. JSX Bindings

  // Employee ID
  content = content.replace(
    `<Label htmlFor="empId">Employee ID *</Label>\r\n                {empId && (\r\n                  <span className="text-[10px] font-bold">\r\n                    {isEmpIdOk ? (\r\n                      <span className="text-emerald-500 flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3" /> Available</span>\r\n                    ) : (\r\n                      <span className="text-destructive flex items-center gap-0.5"><XCircle className="w-3 h-3" /> Already Exists</span>\r\n                    )}\r\n                  </span>\r\n                )}\r\n              </div>\r\n              <Input\r\n                id="empId"\r\n                placeholder={\`e.g. \${selectedCollege.code}-TPO-01\`}\r\n                value={empId}\r\n                onChange={(e) => {`,
    `<Label htmlFor="empId" className={errors.empId ? "text-destructive" : ""}>Employee ID *</Label>
                {empId && !errors.empId && (
                  <span className="text-[10px] font-bold">
                    {isEmpIdOk ? (
                      <span className="text-emerald-500 flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3" /> Available</span>
                    ) : (
                      <span className="text-destructive flex items-center gap-0.5"><XCircle className="w-3 h-3" /> Already Exists</span>
                    )}
                  </span>
                )}
              </div>
              <Input
                id="empId"
                placeholder={\`e.g. \${selectedCollege.code}-TPO-01\`}
                value={empId}
                onChange={(e) => {`
  );

  content = content.replace(
    `className="rounded-xl text-xs"\r\n              />\r\n            </div>`,
    `className={\`rounded-xl text-xs \${errors.empId ? "border-destructive focus-visible:ring-destructive/20" : ""}\`}
              />
              {errors.empId && <p className="text-xs text-destructive mt-1">{errors.empId}</p>}
            </div>`
  );

  // Full Name
  content = content.replace(
    `<Label htmlFor="fullName">Full Name *</Label>\r\n              <Input\r\n                id="fullName"\r\n                placeholder="Enter full name"\r\n                value={fullName}\r\n                onChange={(e) => setFullName(e.target.value)}\r\n                className="rounded-xl text-xs"\r\n              />`,
    `<Label htmlFor="fullName" className={errors.fullName ? "text-destructive" : ""}>Full Name *</Label>
              <Input
                id="fullName"
                placeholder="Enter full name"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors(prev => ({ ...prev, fullName: "" }));
                }}
                className={\`rounded-xl text-xs \${errors.fullName ? "border-destructive focus-visible:ring-destructive/20" : ""}\`}
              />
              {errors.fullName && <p className="text-xs text-destructive mt-1">{errors.fullName}</p>}`
  );

  // Email
  content = content.replace(
    `<Label htmlFor="email">Official Email Address *</Label>\r\n                {email && (\r\n                  <span className="text-[10px] font-bold">\r\n                    {isEmailDomainOk ? (\r\n                      <span className="text-emerald-500 flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3" /> Domain Verified</span>\r\n                    ) : (\r\n                      <span className="text-destructive flex items-center gap-0.5"><XCircle className="w-3 h-3" /> Must use {collegeDomains.join(" / ")}</span>\r\n                    )}\r\n                  </span>\r\n                )}\r\n              </div>\r\n              <Input\r\n                id="email"\r\n                type="email"\r\n                placeholder={\`e.g. staff@\${collegeDomains[0] || "college.edu"}\`}\r\n                value={email}\r\n                onChange={(e) => setEmail(e.target.value)}\r\n                className="rounded-xl text-xs"\r\n              />`,
    `<Label htmlFor="email" className={errors.email ? "text-destructive" : ""}>Official Email Address *</Label>
                {email && !errors.email && (
                  <span className="text-[10px] font-bold">
                    {isEmailDomainOk ? (
                      <span className="text-emerald-500 flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3" /> Domain Verified</span>
                    ) : (
                      <span className="text-destructive flex items-center gap-0.5"><XCircle className="w-3 h-3" /> Must use {collegeDomains.join(" / ")}</span>
                    )}
                  </span>
                )}
              </div>
              <Input
                id="email"
                type="email"
                placeholder={\`e.g. staff@\${collegeDomains[0] || "college.edu"}\`}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors(prev => ({ ...prev, email: "" }));
                }}
                className={\`rounded-xl text-xs \${errors.email ? "border-destructive focus-visible:ring-destructive/20" : ""}\`}
              />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}`
  );

  // Phone
  content = content.replace(
    `<Label htmlFor="phone">Phone Contact *</Label>\r\n              <div className="relative">\r\n                <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-semibold border-r border-border pr-2">+91</span>\r\n                <Input\r\n                  id="phone"\r\n                  placeholder="9876543210"\r\n                  value={phone}\r\n                  onChange={(e) => setPhone(e.target.value)}\r\n                  className="pl-12 rounded-xl text-xs"\r\n                />\r\n              </div>`,
    `<Label htmlFor="phone" className={errors.phone ? "text-destructive" : ""}>Phone Contact *</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-semibold border-r border-border pr-2">+91</span>
                <Input
                  id="phone"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors(prev => ({ ...prev, phone: "" }));
                  }}
                  className={\`pl-12 rounded-xl text-xs \${errors.phone ? "border-destructive focus-visible:ring-destructive/20" : ""}\`}
                />
              </div>
              {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}`
  );

  // Restrict to Selected Departments Restrict block
  content = content.replace(
    `{accessScope === "Selected Departments" && (\r\n                <div className="bg-background border border-border p-4 rounded-xl space-y-4 animate-in slide-in-from-top-2 duration-300">`,
    `{accessScope === "Selected Departments" && (
                <div className={\`bg-background border p-4 rounded-xl space-y-4 animate-in slide-in-from-top-2 duration-300 \${errors.selectedTpoDepts ? "border-destructive ring-1 ring-destructive/20" : "border-border"}\`}>
                  {errors.selectedTpoDepts && <p className="text-xs text-destructive font-semibold">{errors.selectedTpoDepts}</p>}`
  );

  // HOD Allocation block
  content = content.replace(
    `<Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">HOD Department Allocation *</Label>`,
    `<Label className={\`text-xs uppercase tracking-wider font-bold \${errors.selectedDept ? "text-destructive" : "text-muted-foreground"}\`}>HOD Department Allocation *</Label>`
  );

  content = content.replace(
    `<div className="border border-border rounded-xl bg-background divide-y divide-border max-h-[300px] overflow-y-auto pr-1">`,
    `{errors.selectedDept && <p className="text-xs text-destructive font-semibold my-1">{errors.selectedDept}</p>}
              <div className={\`border rounded-xl bg-background divide-y divide-border max-h-[300px] overflow-y-auto pr-1 \${errors.selectedDept ? "border-destructive" : "border-border"}\`}`
  );

  // Add event trigger cleanups
  content = content.replace(
    'setSelectedDept(item.deptName)',
    'setSelectedDept(item.deptName);\r\n                      if (errors.selectedDept) setErrors(prev => ({ ...prev, selectedDept: "" }));'
  );
  content = content.replace(
    'setSelectedTpoDepts(selectedTpoDepts.filter(d => d !== dept));',
    'setSelectedTpoDepts(selectedTpoDepts.filter(d => d !== dept));\r\n    if (errors.selectedTpoDepts) setErrors(prev => ({ ...prev, selectedTpoDepts: "" }));'
  );
  content = content.replace(
    'setSelectedTpoDepts([...selectedTpoDepts, dept]);',
    'setSelectedTpoDepts([...selectedTpoDepts, dept]);\r\n    if (errors.selectedTpoDepts) setErrors(prev => ({ ...prev, selectedTpoDepts: "" }));'
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Processed " + filePath);
}

processFile(path.join(__dirname, '../components/super-admin/hod-tpo/create/page.tsx'), false);
processFile(path.join(__dirname, '../components/super-admin/hod-tpo/edit/[id]/page.tsx'), true);
