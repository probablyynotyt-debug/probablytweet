const fs = require('fs');
let content = fs.readFileSync('firestore.rules', 'utf8');

const newRule = `    match /stickers/{stickerId} {
      allow read: if true;
      allow create: if request.auth != null && request.resource.data.uid == request.auth.uid;
      allow delete: if request.auth != null && resource.data.uid == request.auth.uid;
    }
  }
}`;

content = content.replace("  }\n}", newRule);

fs.writeFileSync('firestore.rules', content);
