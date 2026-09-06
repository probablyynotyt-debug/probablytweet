const fs = require('fs');
let lines = fs.readFileSync('src/pages/Profile.tsx', 'utf8').split('\n');

// Find the start of the getCountFromServer block
let start = lines.findIndex(l => l.includes('// Sync exact counts'));
let end = lines.findIndex(l => l.includes('if (currentUser) {'));

if (start !== -1 && end !== -1 && end > start) {
  lines.splice(start, end - start);
  fs.writeFileSync('src/pages/Profile.tsx', lines.join('\n'));
  console.log("Removed getCountFromServer block");
} else {
  console.log("Could not find getCountFromServer block");
}
