const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../components/hod/exams/ExamForm.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Use a regular expression that is independent of line endings to find the end of setForm
const match = content.match(/tab_switch_limit:\s*3,?\s*\r?\n?\s*\}\);/);
if (!match) {
  console.log("Could not find setForm state definition end");
  process.exit(1);
}

const matchStr = match[0];
const idx = content.indexOf(matchStr);
const endIdx = idx + matchStr.length;

// Inject the errors state declaration
const injection = '\r\n    const [errors, setErrors] = useState<Record<string, string>>({});';
content = content.slice(0, endIdx) + injection + content.slice(endIdx);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Injected errors state successfully!");
