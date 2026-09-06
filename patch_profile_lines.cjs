const fs = require('fs');
let lines = fs.readFileSync('src/pages/Profile.tsx', 'utf8').split('\n');

// We want to delete lines 108 through 119 inclusive.
lines.splice(107, 12); // index 107 is line 108, length 12

fs.writeFileSync('src/pages/Profile.tsx', lines.join('\n'));
