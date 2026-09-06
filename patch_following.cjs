const fs = require('fs');
let content = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

content = content.replace(
  "<div className=\"hover:underline cursor-pointer\" onClick={() => setFollowModalOpen({isOpen: true, type: 'followers'})}>\n                    <span className=\"font-bold text-white\">{profile.followingCount || 0}</span> <span className=\"text-zinc-500\">Following</span>\n                  </div>",
  "<div className=\"hover:underline cursor-pointer\" onClick={() => setFollowModalOpen({isOpen: true, type: 'following'})}>\n                    <span className=\"font-bold text-white\">{profile.followingCount || 0}</span> <span className=\"text-zinc-500\">Following</span>\n                  </div>"
);

fs.writeFileSync('src/pages/Profile.tsx', content);
