const fs = require('fs');
let content = fs.readFileSync('src/components/RightSidebar.tsx', 'utf8');

content = content.replace(
  "import { TrendingUp, Globe2, LogOut } from 'lucide-react';",
  "import { TrendingUp, Globe2, LogOut, Users, BadgeCheck } from 'lucide-react';\nimport { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';\nimport { db } from '../lib/firebase';\nimport { Link } from 'react-router-dom';\nimport { UserProfile } from '../types';"
);

content = content.replace(
  "import { useState } from 'react';",
  ""
);

content = content.replace(
  "import React from 'react';",
  "import React, { useEffect, useState } from 'react';"
);

content = content.replace(
  "export const RightSidebar: React.FC<RightSidebarProps> = () => {\n  const { currentUser, openAuthModal } = useAuth();",
  `export const RightSidebar: React.FC<RightSidebarProps> = () => {
  const { currentUser, openAuthModal } = useAuth();
  const [topUsers, setTopUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    const fetchTopUsers = async () => {
      try {
        const q = query(collection(db, 'users'), orderBy('createdAt', 'asc'), limit(5));
        const snapshot = await getDocs(q);
        setTopUsers(snapshot.docs.map(doc => doc.data() as UserProfile));
      } catch (e) {
        console.error("Error fetching top users:", e);
      }
    };
    fetchTopUsers();
  }, []);`
);

content = content.replace(
  /<div className="space-y-1 mb-8">[\s\S]*?<\/div>\s*\{\/\* Info & Auth \*\/\}/,
  `<div className="mb-8 bg-[#1c1c24] rounded-2xl border border-zinc-800/80 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-zinc-400" />
          <h2 className="text-sm font-bold text-white">First 5 Members</h2>
        </div>
        <div className="space-y-4">
          {topUsers.map((user, idx) => (
            <Link key={user.uid} to={\`/\${user.handle}\`} className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800 shrink-0">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-xs text-zinc-400">
                    {user.displayName?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-sm text-zinc-100 group-hover:underline truncate">{user.displayName}</span>
                  {(user.handle?.toLowerCase() === 'probablynot' || user.handle?.toLowerCase() === 'whydkitten') && (
                    <BadgeCheck className="w-3.5 h-3.5 text-[#6364ff] shrink-0" />
                  )}
                </div>
                <div className="text-xs text-zinc-500 truncate">@{user.handle}</div>
              </div>
              <div className="text-xs font-mono font-bold text-zinc-600 bg-zinc-800/50 px-2 py-1 rounded-md shrink-0">
                #{idx + 1}
              </div>
            </Link>
          ))}
          {topUsers.length === 0 && (
            <div className="text-xs text-zinc-500 text-center py-2">Loading...</div>
          )}
        </div>
      </div>

      <div className="space-y-1 mb-8">
        {currentUser && (
          <button 
             onClick={() => signOut(auth)}
            className="w-full flex items-center gap-4 px-4 py-3 text-zinc-100 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-colors font-semibold text-sm mt-4"
          >
            <LogOut className="w-5 h-5 text-current" />
            Sign out
          </button>
        )}
      </div>

      {/* Info & Auth */}`
);

fs.writeFileSync('src/components/RightSidebar.tsx', content);
