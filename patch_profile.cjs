const fs = require('fs');
let content = fs.readFileSync('src/pages/Profile.tsx', 'utf8');
content = content.replace(
  "onAddReply={addReply}",
  "onAddReply={addReply as any}"
);
fs.writeFileSync('src/pages/Profile.tsx', content);
