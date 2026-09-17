const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../components/hod/exams/ExamForm.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Declare errors state
content = content.replace(
  '        tab_switch_limit: 3,\r\n    });',
  '        tab_switch_limit: 3,\r\n    });\r\n    const [errors, setErrors] = useState<Record<string, string>>({});'
);

// 2. Update updateField function to clear errors on field change
content = content.replace(
  `    const updateField = (field: string, value: any) => {\r\n        setForm((prev) => ({\r\n            ...prev,\r\n            [field]: value,\r\n        }));\r\n    };`,
  `    const updateField = (field: string, value: any) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }));
        }
    };`
);

// 3. Inject validateForm and replace handleSubmit with validation check
const handleSubmitIndex = content.indexOf('    const handleSubmit = () => {');
if (handleSubmitIndex === -1) {
  console.error("Could not find handleSubmit signature");
  process.exit(1);
}

const validationInjection = `    const validateForm = () => {
        const tempErrors: Record<string, string> = {};

        if (!form.title.trim()) {
            tempErrors.title = "Exam Title is required";
        }

        if (!form.exam_type_id) {
            tempErrors.exam_type_id = "Exam Type is required";
        }

        if (!form.duration || form.duration <= 0 || isNaN(form.duration)) {
            tempErrors.duration = "Valid Duration is required";
        }

        if (!form.start_date) {
            tempErrors.start_date = "Start Date is required";
        }

        if (!form.end_date) {
            tempErrors.end_date = "End Date is required";
        } else if (form.start_date && new Date(form.end_date) <= new Date(form.start_date)) {
            tempErrors.end_date = "End Date must be after Start Date";
        }

        if (form.pass_percentage === undefined || form.pass_percentage === null || form.pass_percentage < 0 || form.pass_percentage > 100 || isNaN(form.pass_percentage)) {
            tempErrors.pass_percentage = "Passing Percentage must be between 0 and 100";
        }

        if (form.exam_type_id === 1 && mcqs.length === 0) {
            tempErrors.questions = "At least one MCQ question is required for MCQ Assessment";
        } else if (form.exam_type_id === 2 && codings.length === 0) {
            tempErrors.questions = "At least one Coding challenge is required for Coding Challenge";
        } else if (form.exam_type_id === 3 && mcqs.length === 0 && codings.length === 0) {
            tempErrors.questions = "At least one MCQ or Coding question is required for Mixed Evaluation";
        }

        setErrors(tempErrors);

        const isValid = Object.keys(tempErrors).length === 0;
        if (!isValid) {
            if (tempErrors.questions) {
                toast.error(tempErrors.questions);
            } else {
                toast.error("Please fill in all required exam details correctly.");
            }
        }
        return isValid;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;`;

content = content.slice(0, handleSubmitIndex) + validationInjection + content.slice(handleSubmitIndex + '    const handleSubmit = () => {'.length);

// 4. JSX UI Input bindings

// Title
content = content.replace(
  `                    <div>\r\n                        <Label className="text-sm font-semibold">Title</Label>\r\n                        <Input\r\n                            value={form.title}\r\n                            onChange={(e) => updateField("title", e.target.value)}\r\n                            placeholder="Enter exam title..."\r\n                            className="mt-1"\r\n                        />\r\n                    </div>`,
  `                    <div>
                        <Label className={\`text-sm font-semibold \${errors.title ? "text-destructive" : ""}\`}>Title *</Label>
                        <Input
                            value={form.title}
                            onChange={(e) => updateField("title", e.target.value)}
                            placeholder="Enter exam title..."
                            className={\`mt-1 \${errors.title ? "border-destructive focus-visible:ring-destructive/20" : ""}\`}
                        />
                        {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
                    </div>`
);

// Exam Type
content = content.replace(
  `                        <div>\r\n                            <Label>Exam Type</Label>\r\n\r\n                            <select\r\n                                value={form.exam_type_id}\r\n                                onChange={(e) =>\r\n                                    updateField(\r\n                                        "exam_type_id",\r\n                                        Number(e.target.value)\r\n                                    )\r\n                                }\r\n                                className="w-full mt-2 h-10 px-3 rounded-lg border"\r\n                            >`,
  `                        <div>
                            <Label className={errors.exam_type_id ? "text-destructive" : ""}>Exam Type *</Label>

                            <select
                                value={form.exam_type_id}
                                onChange={(e) => {
                                    updateField(
                                        "exam_type_id",
                                        Number(e.target.value)
                                    );
                                    if (errors.questions) setErrors(prev => ({ ...prev, questions: "" }));
                                }}
                                className={\`w-full mt-2 h-10 px-3 rounded-lg border \${errors.exam_type_id ? "border-destructive focus-visible:ring-destructive/20" : ""}\`}
                            >`
);

content = content.replace(
  `                            </select>\r\n                        </div>`,
  `                            </select>\r\n                            {errors.exam_type_id && <p className="text-xs text-destructive mt-1">{errors.exam_type_id}</p>}\r\n                        </div>`
);

// Duration
content = content.replace(
  `                        <div>\r\n                            <Label className="text-sm font-semibold">Duration (min)</Label>\r\n                            <Input\r\n                                type="number"\r\n                                value={form.duration}\r\n                                onChange={(e) => updateField("duration", +e.target.value)}\r\n                                className="mt-1.5"\r\n                            />\r\n                        </div>`,
  `                        <div>
                            <Label className={\`text-sm font-semibold \${errors.duration ? "text-destructive" : ""}\`}>Duration (min) *</Label>
                            <Input
                                type="number"
                                value={form.duration}
                                onChange={(e) => updateField("duration", +e.target.value)}
                                className={\`mt-1.5 \${errors.duration ? "border-destructive focus-visible:ring-destructive/20" : ""}\`}
                            />
                            {errors.duration && <p className="text-xs text-destructive mt-1">{errors.duration}</p>}
                        </div>`
);

// Start Date
content = content.replace(
  `                        <div>\r\n                            <Label>\r\n                                Start Date\r\n                            </Label>\r\n\r\n                            <Input\r\n                                type="datetime-local"\r\n                                value={form.start_date}\r\n                                onChange={(e) =>\r\n                                    updateField(\r\n                                        "start_date",\r\n                                        e.target.value\r\n                                    )\r\n                                }\r\n                            />\r\n                        </div>`,
  `                        <div>
                            <Label className={errors.start_date ? "text-destructive" : ""}>
                                Start Date *
                            </Label>

                            <Input
                                type="datetime-local"
                                value={form.start_date}
                                onChange={(e) =>
                                    updateField(
                                        "start_date",
                                        e.target.value
                                    )
                                }
                                className={\`mt-1.5 \${errors.start_date ? "border-destructive focus-visible:ring-destructive/20" : ""}\`}
                            />
                            {errors.start_date && <p className="text-xs text-destructive mt-1">{errors.start_date}</p>}
                        </div>`
);

// End Date
content = content.replace(
  `                        <div>\r\n                            <Label>\r\n                                End Date\r\n                            </Label>\r\n\r\n                            <Input\r\n                                type="datetime-local"\r\n                                value={form.end_date}\r\n                                onChange={(e) =>\r\n                                    updateField(\r\n                                        "end_date",\r\n                                        e.target.value\r\n                                    )\r\n                                }\r\n                            />\r\n                        </div>`,
  `                        <div>
                            <Label className={errors.end_date ? "text-destructive" : ""}>
                                End Date *
                            </Label>

                            <Input
                                type="datetime-local"
                                value={form.end_date}
                                onChange={(e) =>
                                    updateField(
                                        "end_date",
                                        e.target.value
                                    )
                                }
                                className={\`mt-1.5 \${errors.end_date ? "border-destructive focus-visible:ring-destructive/20" : ""}\`}
                            />
                            {errors.end_date && <p className="text-xs text-destructive mt-1">{errors.end_date}</p>}
                        </div>`
);

// Passing Percentage
content = content.replace(
  `                        <div>\r\n                            <Label className="text-sm font-semibold">Passing %</Label>\r\n                            <Input\r\n                                type="number"\r\n                                value={form.pass_percentage}\r\n                                onChange={(e) => updateField("pass_percentage", +e.target.value)}\r\n                                className="mt-1.5"\r\n                            />\r\n                        </div>`,
  `                        <div>
                            <Label className={\`text-sm font-semibold \${errors.pass_percentage ? "text-destructive" : ""}\`}>Passing % *</Label>
                            <Input
                                type="number"
                                value={form.pass_percentage}
                                onChange={(e) => updateField("pass_percentage", +e.target.value)}
                                className={\`mt-1.5 \${errors.pass_percentage ? "border-destructive focus-visible:ring-destructive/20" : ""}\`}
                            />
                            {errors.pass_percentage && <p className="text-xs text-destructive mt-1">{errors.pass_percentage}</p>}
                        </div>`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Exam Form validations injected successfully!");
