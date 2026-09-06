const fs = require('fs');
let content = fs.readFileSync('src/lib/cloudinary.ts', 'utf8');
content = content.replace(
  "type: 'image' | 'video' | 'raw' | 'auto' = 'auto'",
  "type: 'image' | 'video' | 'audio' | 'raw' | 'auto' = 'auto'"
);
content = content.replace(
  "const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${type}/upload`",
  "const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${type === 'audio' ? 'video' : type}/upload`"
);
fs.writeFileSync('src/lib/cloudinary.ts', content);
