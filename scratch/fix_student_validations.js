const fs = require('fs');
const path = require('path');

function processFile(filePath, isEdit) {
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Declare errors state
  content = content.replace(
    'const [isActive, setIsActive] = useState(true);',
    'const [isActive, setIsActive] = useState(true);\r\n  const [errors, setErrors] = useState<Record<string, string>>({});'
  );

  // 2. Replace submit handler
  const targetFuncStr = isEdit ? 'const handleSaveChanges = async () => {' : 'const handleCreateStudent = async () => {';
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

    if (!rollNumber.trim()) {
      tempErrors.rollNumber = "Roll Number is required";
    } else if (isRollDuplicate) {
      tempErrors.rollNumber = "Roll Number already exists";
    }

    if (!firstName.trim()) {
      tempErrors.firstName = "First Name is required";
    }

    if (!lastName.trim()) {
      tempErrors.lastName = "Last Name is required";
    }

    if (!personalEmail.trim()) {
      tempErrors.personalEmail = "Personal Email is required";
    } else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(personalEmail)) {
      tempErrors.personalEmail = "Invalid email format";
    }

    if (officialEmail.trim()) {
      if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(officialEmail)) {
        tempErrors.officialEmail = "Invalid email format";
      } else if (!isEmailDomainOk) {
        tempErrors.officialEmail = \`Official email must match approved domains: \${approvedDomains.join(" / ")}\`;
      }
    }

    if (!contactNumber.trim()) {
      tempErrors.contactNumber = "Contact Number is required";
    } else if (!/^\\+?[0-9\\s\\-]{8,15}$/.test(contactNumber.trim())) {
      tempErrors.contactNumber = "Please enter a valid phone number";
    }

    if (!department.trim()) {
      tempErrors.department = "Department is required";
    }

    if (!section.trim()) {
      tempErrors.section = "Section is required";
    }

    if (!gradYear.trim()) {
      tempErrors.gradYear = "Graduation Year is required";
    } else if (isNaN(Number(gradYear)) || Number(gradYear) < 1900 || Number(gradYear) > 2100) {
      tempErrors.gradYear = "Please enter a valid year";
    }

    if (cgpaScore.trim()) {
      const cgpaVal = Number(cgpaScore);
      if (isNaN(cgpaVal) || cgpaVal < 0 || cgpaVal > 10) {
        tempErrors.cgpaScore = "CGPA must be a number between 0 and 10";
      }
    }

    setErrors(tempErrors);

    if (Object.keys(tempErrors).length > 0) {
      toast.error("Please fill in all required fields correctly.");
      return;
    }

    `;

  content = content.slice(0, startIdx) + newValidator + content.slice(tryIdx);

  // 3. JSX Input Replacements

  // Roll Number
  content = content.replace(
    `<Label htmlFor="rollNumber">Roll Number *</Label>\r\n                {rollNumber && (\r\n                  <span className="text-[10px] font-bold">\r\n                    {isRollOk ? (\r\n                      <span className="text-emerald-500 flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3" /> Available</span>\r\n                    ) : (\r\n                      <span className="text-destructive flex items-center gap-0.5"><XCircle className="w-3 h-3" /> Already Registered</span>\r\n                    )}\r\n                  </span>\r\n                )}\r\n              </div>\r\n              <Input\r\n                id="rollNumber"\r\n                placeholder="e.g. 20131A0501"`,
    `<Label htmlFor="rollNumber" className={errors.rollNumber ? "text-destructive" : ""}>Roll Number *</Label>
                {rollNumber && !errors.rollNumber && (
                  <span className="text-[10px] font-bold">
                    {isRollOk ? (
                      <span className="text-emerald-500 flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3" /> Available</span>
                    ) : (
                      <span className="text-destructive flex items-center gap-0.5"><XCircle className="w-3 h-3" /> Already Registered</span>
                    )}
                  </span>
                )}
              </div>
              <Input
                id="rollNumber"
                placeholder="e.g. 20131A0501"`
  );

  content = content.replace(
    `id="rollNumber"\r\n                placeholder="e.g. 20131A0501"\r\n                value={rollNumber}\r\n                onChange={(e) => setRollNumber(e.target.value)}\r\n                className="rounded-xl text-xs"`,
    `id="rollNumber"
                placeholder="e.g. 20131A0501"
                value={rollNumber}
                onChange={(e) => {
                  setRollNumber(e.target.value);
                  if (errors.rollNumber) setErrors(prev => ({ ...prev, rollNumber: "" }));
                }}
                className={\`rounded-xl text-xs \${errors.rollNumber ? "border-destructive focus-visible:ring-destructive/20" : ""}\`}`
  );

  // In the edit page, Roll Number uses a simpler input
  content = content.replace(
    `<Label htmlFor="rollNumber">Roll Number *</Label>\r\n                {rollNumber && (\r\n                  <span className="text-[10px] font-bold">\r\n                    {isRollOk ? (\r\n                      <span className="text-emerald-500 flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3" /> Available</span>\r\n                    ) : (\r\n                      <span className="text-destructive flex items-center gap-0.5"><XCircle className="w-3 h-3" /> Already In Use</span>\r\n                    )}\r\n                  </span>\r\n                )}\r\n              </div>\r\n              <Input\r\n                id="rollNumber"\r\n                placeholder="e.g. 20131A0501"`,
    `<Label htmlFor="rollNumber" className={errors.rollNumber ? "text-destructive" : ""}>Roll Number *</Label>
                {rollNumber && !errors.rollNumber && (
                  <span className="text-[10px] font-bold">
                    {isRollOk ? (
                      <span className="text-emerald-500 flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3" /> Available</span>
                    ) : (
                      <span className="text-destructive flex items-center gap-0.5"><XCircle className="w-3 h-3" /> Already In Use</span>
                    )}
                  </span>
                )}
              </div>
              <Input
                id="rollNumber"
                placeholder="e.g. 20131A0501"`
  );

  // Render rollNumber error text right after input
  const rollNumberInputEnd = `placeholder="e.g. 20131A0501"`;
  // Let's do general replacements for other inputs
  
  // First Name
  content = content.replace(
    `<Label htmlFor="firstName">First Name *</Label>\r\n              <Input\r\n                id="firstName"\r\n                placeholder="Enter first name"\r\n                value={firstName}\r\n                onChange={(e) => setFirstName(e.target.value)}\r\n                className="rounded-xl text-xs"\r\n              />`,
    `<Label htmlFor="firstName" className={errors.firstName ? "text-destructive" : ""}>First Name *</Label>
              <Input
                id="firstName"
                placeholder="Enter first name"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  if (errors.firstName) setErrors(prev => ({ ...prev, firstName: "" }));
                }}
                className={\`rounded-xl text-xs \${errors.firstName ? "border-destructive focus-visible:ring-destructive/20" : ""}\`}
              />
              {errors.firstName && <p className="text-xs text-destructive mt-1">{errors.firstName}</p>}`
  );

  // Last Name
  content = content.replace(
    `<Label htmlFor="lastName">Last Name *</Label>\r\n              <Input\r\n                id="lastName"\r\n                placeholder="Enter last name"\r\n                value={lastName}\r\n                onChange={(e) => setLastName(e.target.value)}\r\n                className="rounded-xl text-xs"\r\n              />`,
    `<Label htmlFor="lastName" className={errors.lastName ? "text-destructive" : ""}>Last Name *</Label>
              <Input
                id="lastName"
                placeholder="Enter last name"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  if (errors.lastName) setErrors(prev => ({ ...prev, lastName: "" }));
                }}
                className={\`rounded-xl text-xs \${errors.lastName ? "border-destructive focus-visible:ring-destructive/20" : ""}\`}
              />
              {errors.lastName && <p className="text-xs text-destructive mt-1">{errors.lastName}</p>}`
  );

  // Personal Email
  content = content.replace(
    `<Label htmlFor="personalEmail">Personal Email Address *</Label>\r\n              <Input\r\n                id="personalEmail"\r\n                type="email"\r\n                placeholder="personal@gmail.com"\r\n                value={personalEmail}\r\n                onChange={(e) => setPersonalEmail(e.target.value)}\r\n                className="rounded-xl text-xs"\r\n              />`,
    `<Label htmlFor="personalEmail" className={errors.personalEmail ? "text-destructive" : ""}>Personal Email Address *</Label>
              <Input
                id="personalEmail"
                type="email"
                placeholder="personal@gmail.com"
                value={personalEmail}
                onChange={(e) => {
                  setPersonalEmail(e.target.value);
                  if (errors.personalEmail) setErrors(prev => ({ ...prev, personalEmail: "" }));
                }}
                className={\`rounded-xl text-xs \${errors.personalEmail ? "border-destructive focus-visible:ring-destructive/20" : ""}\`}
              />
              {errors.personalEmail && <p className="text-xs text-destructive mt-1">{errors.personalEmail}</p>}`
  );

  // Official Email
  content = content.replace(
    `<Label htmlFor="officialEmail">Official Email Address</Label>\r\n                {officialEmail && (\r\n                  <span className="text-[10px] font-bold">\r\n                    {isEmailDomainOk ? (\r\n                      <span className="text-emerald-500 flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3" /> Domain Verified</span>\r\n                    ) : (\r\n                      <span className="text-destructive flex items-center gap-0.5"><XCircle className="w-3 h-3" /> Approved Domain Required</span>\r\n                    )}\r\n                  </span>\r\n                )}\r\n              </div>\r\n              <Input\r\n                id="officialEmail"\r\n                type="email"\r\n                placeholder={\`e.g. student@\${approvedDomains[0] || "college.edu"}\`}\r\n                value={officialEmail}\r\n                onChange={(e) => setOfficialEmail(e.target.value)}\r\n                className="rounded-xl text-xs"\r\n              />`,
    `<Label htmlFor="officialEmail" className={errors.officialEmail ? "text-destructive" : ""}>Official Email Address</Label>
                {officialEmail && !errors.officialEmail && (
                  <span className="text-[10px] font-bold">
                    {isEmailDomainOk ? (
                      <span className="text-emerald-500 flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3" /> Domain Verified</span>
                    ) : (
                      <span className="text-destructive flex items-center gap-0.5"><XCircle className="w-3 h-3" /> Approved Domain Required</span>
                    )}
                  </span>
                )}
              </div>
              <Input
                id="officialEmail"
                type="email"
                placeholder={\`e.g. student@\${approvedDomains[0] || "college.edu"}\`}
                value={officialEmail}
                onChange={(e) => {
                  setOfficialEmail(e.target.value);
                  if (errors.officialEmail) setErrors(prev => ({ ...prev, officialEmail: "" }));
                }}
                className={\`rounded-xl text-xs \${errors.officialEmail ? "border-destructive focus-visible:ring-destructive/20" : ""}\`}
              />
              {errors.officialEmail && <p className="text-xs text-destructive mt-1">{errors.officialEmail}</p>}`
  );

  // Contact Number
  content = content.replace(
    `<Label htmlFor="contactNumber">Contact Number *</Label>\r\n              <div className="relative">\r\n                <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-semibold border-r border-border pr-2">+91</span>\r\n                <Input\r\n                  id="contactNumber"\r\n                  placeholder="9876543210"\r\n                  value={contactNumber}\r\n                  onChange={(e) => setContactNumber(e.target.value)}\r\n                  className="pl-12 rounded-xl text-xs"\r\n                />\r\n              </div>`,
    `<Label htmlFor="contactNumber" className={errors.contactNumber ? "text-destructive" : ""}>Contact Number *</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-semibold border-r border-border pr-2">+91</span>
                <Input
                  id="contactNumber"
                  placeholder="9876543210"
                  value={contactNumber}
                  onChange={(e) => {
                    setContactNumber(e.target.value);
                    if (errors.contactNumber) setErrors(prev => ({ ...prev, contactNumber: "" }));
                  }}
                  className={\`pl-12 rounded-xl text-xs \${errors.contactNumber ? "border-destructive focus-visible:ring-destructive/20" : ""}\`}
                />
              </div>
              {errors.contactNumber && <p className="text-xs text-destructive mt-1">{errors.contactNumber}</p>}`
  );

  // Department
  content = content.replace(
    `<Label htmlFor="department">Department / Branch *</Label>\r\n              <Input\r\n                id="department"\r\n                placeholder="e.g. Computer Science & Engineering"\r\n                value={department}\r\n                onChange={(e) => setDepartment(e.target.value)}\r\n                className="rounded-xl text-xs"\r\n              />`,
    `<Label htmlFor="department" className={errors.department ? "text-destructive" : ""}>Department / Branch *</Label>
              <Input
                id="department"
                placeholder="e.g. Computer Science & Engineering"
                value={department}
                onChange={(e) => {
                  setDepartment(e.target.value);
                  if (errors.department) setErrors(prev => ({ ...prev, department: "" }));
                }}
                className={\`rounded-xl text-xs \${errors.department ? "border-destructive focus-visible:ring-destructive/20" : ""}\`}
              />
              {errors.department && <p className="text-xs text-destructive mt-1">{errors.department}</p>}`
  );

  // Section
  content = content.replace(
    `<Label htmlFor="section">Class Section *</Label>\r\n              <Input\r\n                id="section"\r\n                placeholder="e.g. A or CSE-B"\r\n                value={section}\r\n                onChange={(e) => setSection(e.target.value)}\r\n                className="rounded-xl text-xs"\r\n              />`,
    `<Label htmlFor="section" className={errors.section ? "text-destructive" : ""}>Class Section *</Label>
              <Input
                id="section"
                placeholder="e.g. A or CSE-B"
                value={section}
                onChange={(e) => {
                  setSection(e.target.value);
                  if (errors.section) setErrors(prev => ({ ...prev, section: "" }));
                }}
                className={\`rounded-xl text-xs \${errors.section ? "border-destructive focus-visible:ring-destructive/20" : ""}\`}
              />
              {errors.section && <p className="text-xs text-destructive mt-1">{errors.section}</p>}`
  );

  // Graduation Year
  content = content.replace(
    `<Label htmlFor="gradYear">Graduation Year *</Label>\r\n              <Input\r\n                id="gradYear"\r\n                placeholder="e.g. 2024"\r\n                value={gradYear}\r\n                onChange={(e) => setGradYear(e.target.value)}\r\n                className="rounded-xl text-xs"\r\n              />`,
    `<Label htmlFor="gradYear" className={errors.gradYear ? "text-destructive" : ""}>Graduation Year *</Label>
              <Input
                id="gradYear"
                placeholder="e.g. 2024"
                value={gradYear}
                onChange={(e) => {
                  setGradYear(e.target.value);
                  if (errors.gradYear) setErrors(prev => ({ ...prev, gradYear: "" }));
                }}
                className={\`rounded-xl text-xs \${errors.gradYear ? "border-destructive focus-visible:ring-destructive/20" : ""}\`}
              />
              {errors.gradYear && <p className="text-xs text-destructive mt-1">{errors.gradYear}</p>}`
  );

  // CGPA Score
  content = content.replace(
    `<Label htmlFor="cgpa">CGPA Score (Optional)</Label>\r\n              <Input\r\n                id="cgpa"\r\n                placeholder="e.g. 8.45"\r\n                value={cgpaScore}\r\n                onChange={(e) => setCgpaScore(e.target.value)}\r\n                className="rounded-xl text-xs"\r\n              />`,
    `<Label htmlFor="cgpa" className={errors.cgpaScore ? "text-destructive" : ""}>CGPA Score (Optional)</Label>
              <Input
                id="cgpa"
                placeholder="e.g. 8.45"
                value={cgpaScore}
                onChange={(e) => {
                  setCgpaScore(e.target.value);
                  if (errors.cgpaScore) setErrors(prev => ({ ...prev, cgpaScore: "" }));
                }}
                className={\`rounded-xl text-xs \${errors.cgpaScore ? "border-destructive focus-visible:ring-destructive/20" : ""}\`}
              />
              {errors.cgpaScore && <p className="text-xs text-destructive mt-1">{errors.cgpaScore}</p>}`
  );

  // Extra cleanup for rollNumber input container in create page
  content = content.replace(
    `className="rounded-xl text-xs"\r\n              />\r\n            </div>`,
    `className={\`rounded-xl text-xs \${errors.rollNumber ? "border-destructive focus-visible:ring-destructive/20" : ""}\`}\r\n              />\r\n              {errors.rollNumber && <p className="text-xs text-destructive mt-1">{errors.rollNumber}</p>}\r\n            </div>`
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Processed " + filePath);
}

processFile(path.join(__dirname, '../components/super-admin/student/create/page.tsx'), false);
processFile(path.join(__dirname, '../components/super-admin/student/edit/[id]/page.tsx'), true);
