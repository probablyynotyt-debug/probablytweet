const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf8');

content = content.replace(
  "  replyTo?: string; // id of the tweet it replies to\n}",
  "  replyTo?: string; // id of the tweet it replies to\n  mediaUrl?: string;\n  mediaType?: 'image' | 'video' | 'audio';\n  stickerUrl?: string;\n}"
);

fs.writeFileSync('src/types.ts', content);
