const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../components/super-admin/student/edit/[id]/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  '${approvedDomains.join(" / ")}',
  '${collegeDomains.join(" / ")}'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Fixed approvedDomains reference in student edit page!");
