const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../components/dq-admin/college/create/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fix the top padded card stepper block
const stepperSearchStart = '      {/* Top Padded Card Stepper */}';
const stepperSearchEnd = '      {/* Main Content Area */}';

const startIdx = content.indexOf(stepperSearchStart);
const endIdx = content.indexOf(stepperSearchEnd);

if (startIdx === -1 || endIdx === -1) {
  console.error("Could not locate Stepper area");
  process.exit(1);
}

const cleanStepper = `      {/* Top Padded Card Stepper */}
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
                  <div className={\`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border \${isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-sm ring-4 ring-primary/10"
                    : isCompleted
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/25"
                      : "bg-muted text-muted-foreground border-border"
                    }\`}>
                    {isCompleted ? <Check className="w-4 h-4" /> : st.num}
                  </div>
                  <div>
                    <p className={\`text-xs font-bold tracking-tight \${isActive ? "text-foreground" : "text-muted-foreground"}\`}>
                      {st.label}
                    </p>
                  </div>
                </button>
                {idx < steps.length - 1 && (
                  <div className={\`hidden md:block h-[2px] flex-1 mx-4 rounded-full \${currentStep > st.num ? "bg-emerald-500/40" : "bg-border"
                    }\`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

`;

content = content.slice(0, startIdx) + cleanStepper + content.slice(endIdx);

// 2. Replacements for inline error messages on input fields

// Admin Name
content = content.replace(
  `<Label htmlFor="adminName">Admin Full Name *</Label>\r\n                <Input\r\n                  id="adminName"\r\n                  placeholder="Enter full name"\r\n                  value={adminName}\r\n                  onChange={(e) => setAdminName(e.target.value)}\r\n                />`,
  `<Label htmlFor="adminName" className={errors.adminName ? "text-destructive" : ""}>Admin Full Name *</Label>
                <Input
                  id="adminName"
                  placeholder="Enter full name"
                  value={adminName}
                  onChange={(e) => {
                    setAdminName(e.target.value);
                    if (errors.adminName) setErrors(prev => ({ ...prev, adminName: "" }));
                  }}
                  className={errors.adminName ? "border-destructive focus-visible:ring-destructive/20" : ""}
                />
                {errors.adminName && <p className="text-xs text-destructive mt-1">{errors.adminName}</p>}`
);

// Admin Email
content = content.replace(
  `<Label htmlFor="adminEmail">Official Email Address *</Label>\r\n                  {adminEmail && (\r\n                    <span className="flex items-center gap-1 text-[11px] font-semibold">\r\n                      {isEmailOk ? (\r\n                        <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Email Available</span>\r\n                      ) : isEmailDuplicate ? (\r\n                        <span className="text-destructive flex items-center gap-1"><XCircle className="w-3 h-3" /> Already Registered</span>\r\n                      ) : (\r\n                        <span className="text-amber-500">Invalid format</span>\r\n                      )}\r\n                    </span>\r\n                  )}\r\n                </div>\r\n                <Input\r\n                  id="adminEmail"\r\n                  type="email"\r\n                  placeholder="admin@college.edu"\r\n                  value={adminEmail}\r\n                  onChange={(e) => setAdminEmail(e.target.value)}\r\n                />`,
  `<Label htmlFor="adminEmail" className={errors.adminEmail ? "text-destructive" : ""}>Official Email Address *</Label>
                  {adminEmail && !errors.adminEmail && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold">
                      {isEmailOk ? (
                        <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Email Available</span>
                      ) : isEmailDuplicate ? (
                        <span className="text-destructive flex items-center gap-1"><XCircle className="w-3 h-3" /> Already Registered</span>
                      ) : (
                        <span className="text-amber-500">Invalid format</span>
                      )}
                    </span>
                  )}
                </div>
                <Input
                  id="adminEmail"
                  type="email"
                  placeholder="admin@college.edu"
                  value={adminEmail}
                  onChange={(e) => {
                    setAdminEmail(e.target.value);
                    if (errors.adminEmail) setErrors(prev => ({ ...prev, adminEmail: "" }));
                  }}
                  className={errors.adminEmail ? "border-destructive focus-visible:ring-destructive/20" : ""}
                />
                {errors.adminEmail && <p className="text-xs text-destructive mt-1">{errors.adminEmail}</p>}`
);

// Admin Phone
content = content.replace(
  `<Label htmlFor="adminPhone">Phone Contact *</Label>\r\n                <Input\r\n                  id="adminPhone"\r\n                  placeholder="+91 99999 88888"\r\n                  value={adminPhone}\r\n                  onChange={(e) => setAdminPhone(e.target.value)}\r\n                />`,
  `<Label htmlFor="adminPhone" className={errors.adminPhone ? "text-destructive" : ""}>Phone Contact *</Label>
                <Input
                  id="adminPhone"
                  placeholder="+91 99999 88888"
                  value={adminPhone}
                  onChange={(e) => {
                    setAdminPhone(e.target.value);
                    if (errors.adminPhone) setErrors(prev => ({ ...prev, adminPhone: "" }));
                  }}
                  className={errors.adminPhone ? "border-destructive focus-visible:ring-destructive/20" : ""}
                />
                {errors.adminPhone && <p className="text-xs text-destructive mt-1">{errors.adminPhone}</p>}`
);

// College Name
content = content.replace(
  `<Label htmlFor="collegeName">Official College Name *</Label>\r\n                <Input\r\n                  id="collegeName"\r\n                  placeholder="Sri Venkateswara College of Engineering"\r\n                  value={collegeName}\r\n                  onChange={(e) => setCollegeName(e.target.value)}\r\n                />`,
  `<Label htmlFor="collegeName" className={errors.collegeName ? "text-destructive" : ""}>Official College Name *</Label>
                <Input
                  id="collegeName"
                  placeholder="Sri Venkateswara College of Engineering"
                  value={collegeName}
                  onChange={(e) => {
                    setCollegeName(e.target.value);
                    if (errors.collegeName) setErrors(prev => ({ ...prev, collegeName: "" }));
                  }}
                  className={errors.collegeName ? "border-destructive focus-visible:ring-destructive/20" : ""}
                />
                {errors.collegeName && <p className="text-xs text-destructive mt-1">{errors.collegeName}</p>}`
);

// College Code
content = content.replace(
  `<Label htmlFor="collegeCode">College Code *</Label>\r\n                  {collegeCode && (\r\n                    <span className="flex items-center gap-1 text-[11px] font-semibold">\r\n                      {isCodeOk ? (\r\n                        <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Code Available</span>\r\n                      ) : (\r\n                        <span className="text-destructive flex items-center gap-1"><XCircle className="w-3 h-3" /> Code Exists</span>\r\n                      )}\r\n                    </span>\r\n                  )}\r\n                </div>\r\n                <Input\r\n                  id="collegeCode"\r\n                  placeholder="SVCE1234"\r\n                  value={collegeCode}\r\n                  onChange={(e) => setCollegeCode(e.target.value)}\r\n                />`,
  `<Label htmlFor="collegeCode" className={errors.collegeCode ? "text-destructive" : ""}>College Code *</Label>
                  {collegeCode && !errors.collegeCode && (
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
                  placeholder="SVCE1234"
                  value={collegeCode}
                  onChange={(e) => {
                    setCollegeCode(e.target.value);
                    if (errors.collegeCode) setErrors(prev => ({ ...prev, collegeCode: "" }));
                  }}
                  className={errors.collegeCode ? "border-destructive focus-visible:ring-destructive/20" : ""}
                />
                {errors.collegeCode && <p className="text-xs text-destructive mt-1">{errors.collegeCode}</p>}`
);

// Approved domains
content = content.replace(
  `<Label>Approved Email Domains *</Label>\r\n                <div className="flex gap-2">\r\n                  <Input\r\n                    placeholder="e.g. college.edu"\r\n                    value={newDomain}\r\n                    onChange={(e) => setNewDomain(e.target.value)}\r\n                    className="flex-1"\r\n                  />\r\n                  <Button type="button" onClick={handleAddDomain} variant="secondary" className="rounded-xl px-4">\r\n                    Add Domain\r\n                  </Button>\r\n                </div>`,
  `<Label className={errors.domains ? "text-destructive" : ""}>Approved Email Domains *</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. college.edu"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    className={\`flex-1 \${errors.domains ? "border-destructive focus-visible:ring-destructive/20" : ""}\`}
                  />
                  <Button type="button" onClick={handleAddDomain} variant="secondary" className="rounded-xl px-4">
                    Add Domain
                  </Button>
                </div>
                {errors.domains && <p className="text-xs text-destructive mt-1">{errors.domains}</p>}`
);

// Location inputs
content = content.replace(
  `<Label htmlFor="streetAddress">Street Address / Landmark *</Label>\r\n                <Input\r\n                  id="streetAddress"\r\n                  placeholder="e.g. Karakambadi Road, Near Renigunta"\r\n                  value={streetAddress}\r\n                  onChange={(e) => setStreetAddress(e.target.value)}\r\n                />`,
  `<Label htmlFor="streetAddress" className={errors.streetAddress ? "text-destructive" : ""}>Street Address / Landmark *</Label>
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
                {errors.streetAddress && <p className="text-xs text-destructive mt-1">{errors.streetAddress}</p>}`
);

content = content.replace(
  `<Label htmlFor="city">City *</Label>\r\n                <Input\r\n                  id="city"\r\n                  placeholder="e.g. Tirupati"\r\n                  value={city}\r\n                  onChange={(e) => setCity(e.target.value)}\r\n                />`,
  `<Label htmlFor="city" className={errors.city ? "text-destructive" : ""}>City *</Label>
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
                {errors.city && <p className="text-xs text-destructive mt-1">{errors.city}</p>}`
);

content = content.replace(
  `<Label htmlFor="district">District *</Label>\r\n                <Input\r\n                  id="district"\r\n                  placeholder="e.g. Chittoor District"\r\n                  value={district}\r\n                  onChange={(e) => setDistrict(e.target.value)}\r\n                />`,
  `<Label htmlFor="district" className={errors.district ? "text-destructive" : ""}>District *</Label>
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
                {errors.district && <p className="text-xs text-destructive mt-1">{errors.district}</p>}`
);

content = content.replace(
  `<Label htmlFor="state">State *</Label>\r\n                <Input\r\n                  id="state"\r\n                  placeholder="e.g. Andhra Pradesh"\r\n                  value={state}\r\n                  onChange={(e) => setState(e.target.value)}\r\n                />`,
  `<Label htmlFor="state" className={errors.state ? "text-destructive" : ""}>State *</Label>
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
                {errors.state && <p className="text-xs text-destructive mt-1">{errors.state}</p>}`
);

content = content.replace(
  `<Label htmlFor="postalCode">Postal Code / Pincode *</Label>\r\n                <Input\r\n                  id="postalCode"\r\n                  placeholder="e.g. 517507"\r\n                  value={postalCode}\r\n                  onChange={(e) => setPostalCode(e.target.value)}\r\n                />`,
  `<Label htmlFor="postalCode" className={errors.postalCode ? "text-destructive" : ""}>Postal Code / Pincode *</Label>
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
                {errors.postalCode && <p className="text-xs text-destructive mt-1">{errors.postalCode}</p>}`
);

// Institution type select card error
content = content.replace(
  `{/* 1. Select Institution Types */}\r\n              <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">\r\n                <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">\r\n                  1. Select Institution Types <span className="text-destructive">*</span>\r\n                </h3>`,
  `{/* 1. Select Institution Types */}
              <div className={\`bg-card border p-6 rounded-2xl shadow-sm space-y-4 \${errors.selectedInstTypes ? "border-destructive ring-1 ring-destructive/20" : "border-border"}\`}>
                <h3 className={\`font-bold text-sm flex items-center gap-1.5 \${errors.selectedInstTypes ? "text-destructive" : "text-foreground"}\`}>
                  1. Select Institution Types <span className="text-destructive">*</span>
                </h3>
                {errors.selectedInstTypes && <p className="text-xs text-destructive font-semibold">{errors.selectedInstTypes}</p>}`
);

// Programs and departments select card error
content = content.replace(
  `{/* 2. Select Programs & Departments */}\r\n              <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">\r\n                <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">\r\n                  2. Select Programs & Departments <span className="text-destructive">*</span>\r\n                </h3>`,
  `{/* 2. Select Programs & Departments */}
              <div className={\`bg-card border p-6 rounded-2xl shadow-sm space-y-4 \${errors.academicProfile ? "border-destructive ring-1 ring-destructive/20" : "border-border"}\`}>
                <h3 className={\`font-bold text-sm flex items-center gap-1.5 \${errors.academicProfile ? "text-destructive" : "text-foreground"}\`}>
                  2. Select Programs & Departments <span className="text-destructive">*</span>
                </h3>
                {errors.academicProfile && <p className="text-xs text-destructive font-semibold">{errors.academicProfile}</p>}`
);

// Intake Capacity
content = content.replace(
  `<Label htmlFor="capacity">Total Onboarding Intake *</Label>\r\n                  <Input\r\n                    id="capacity"\r\n                    type="number"\r\n                    placeholder="e.g. 1200"\r\n                    value={capacity}\r\n                    onChange={(e) => setCapacity(e.target.value)}\r\n                  />`,
  `<Label htmlFor="capacity" className={errors.capacity ? "text-destructive" : ""}>Total Onboarding Intake *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    placeholder="e.g. 1200"
                    value={capacity}
                    onChange={(e) => {
                      setCapacity(e.target.value);
                      if (errors.capacity) setErrors(prev => ({ ...prev, capacity: "" }));
                    }}
                    className={errors.capacity ? "border-destructive focus-visible:ring-destructive/20" : ""}
                  />
                  {errors.capacity && <p className="text-xs text-destructive mt-1">{errors.capacity}</p>}`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log("JSX replacements executed successfully!");
