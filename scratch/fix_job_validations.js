const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../app/(site)/tpo/jobs/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Declare errors state
content = content.replace(
  '  const [description, setDescription] = useState("");\r\n  const [formSaving, setFormSaving] = useState(false);',
  '  const [description, setDescription] = useState("");\r\n  const [formSaving, setFormSaving] = useState(false);\r\n  const [errors, setErrors] = useState<Record<string, string>>({});'
);

// 2. Clear errors in modal openers
content = content.replace(
  '    setDescription("");\r\n    setFormOpen(true);',
  '    setDescription("");\r\n    setErrors({});\r\n    setFormOpen(true);'
);
content = content.replace(
  '    setDescription(j.description || "");\r\n    setFormOpen(true);',
  '    setDescription(j.description || "");\r\n    setErrors({});\r\n    setFormOpen(true);'
);

// 3. Update handleSaveJob with validations
content = content.replace(
  `  const handleSaveJob = async (e: React.FormEvent) => {\r\n    e.preventDefault();\r\n    if (!role.trim() || !company.trim()) {\r\n      toast.error("Role and company are required.");\r\n      return;\r\n    }`,
  `  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    const tempErrors: Record<string, string> = {};

    if (!role.trim()) {
      tempErrors.role = "Role Name is required";
    }
    if (!company.trim()) {
      tempErrors.company = "Company Name is required";
    }
    if (applyLink.trim() && !/^https?:\\/\\/[^\\s/$.?#].[^\\s]*$/.test(applyLink.trim())) {
      tempErrors.applyLink = "Please enter a valid URL (e.g., https://careers.company.com)";
    }

    setErrors(tempErrors);

    if (Object.keys(tempErrors).length > 0) {
      toast.error("Please fill in all required fields correctly.");
      return;
    }`
);

// 4. JSX UI Input bindings

// Role
content = content.replace(
  `<Label>Role Name *</Label>\r\n                <Input value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Frontend Developer" className="rounded-xl" required />`,
  `<Label className={errors.role ? "text-destructive" : ""}>Role Name *</Label>
                <Input
                  value={role}
                  onChange={e => {
                    setRole(e.target.value);
                    if (errors.role) setErrors(prev => ({ ...prev, role: "" }));
                  }}
                  placeholder="e.g. Frontend Developer"
                  className={\`rounded-xl \${errors.role ? "border-destructive focus-visible:ring-destructive/20" : ""}\`}
                />
                {errors.role && <p className="text-xs text-destructive mt-1">{errors.role}</p>}`
);

// Company
content = content.replace(
  `<Label>Company Name *</Label>\r\n                <Input value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Google" className="rounded-xl" required />`,
  `<Label className={errors.company ? "text-destructive" : ""}>Company Name *</Label>
                <Input
                  value={company}
                  onChange={e => {
                    setCompany(e.target.value);
                    if (errors.company) setErrors(prev => ({ ...prev, company: "" }));
                  }}
                  placeholder="e.g. Google"
                  className={\`rounded-xl \${errors.company ? "border-destructive focus-visible:ring-destructive/20" : ""}\`}
                />
                {errors.company && <p className="text-xs text-destructive mt-1">{errors.company}</p>}`
);

// Apply Link
content = content.replace(
  `<Label>External Apply Link</Label>\r\n                <Input value={applyLink} onChange={e => setApplyLink(e.target.value)} placeholder="https://careers.company.com/..." className="rounded-xl" />`,
  `<Label className={errors.applyLink ? "text-destructive" : ""}>External Apply Link</Label>
                <Input
                  value={applyLink}
                  onChange={e => {
                    setApplyLink(e.target.value);
                    if (errors.applyLink) setErrors(prev => ({ ...prev, applyLink: "" }));
                  }}
                  placeholder="https://careers.company.com/..."
                  className={\`rounded-xl \${errors.applyLink ? "border-destructive focus-visible:ring-destructive/20" : ""}\`}
                />
                {errors.applyLink && <p className="text-xs text-destructive mt-1">{errors.applyLink}</p>}`
);

// Remove the default 'required' attribute since we manage it via JS state validation error messages
content = content.replace('required className="rounded-xl"', 'className="rounded-xl"');

fs.writeFileSync(filePath, content, 'utf8');
console.log("TPO Jobs validations injected successfully!");
