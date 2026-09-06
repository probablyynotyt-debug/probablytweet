const fs = require('fs');
let content = fs.readFileSync('src/components/LeftSidebar.tsx', 'utf8');

// Change query from email to handle IN ['probablynot', 'whydkitten']
content = content.replace(
  "const q = query(collection(db, 'users'), where('email', '==', 'probablynot@gmail.com'));",
  "const q = query(collection(db, 'users'), where('handle', 'in', ['probablynot', 'whydkitten']));"
);

// We need to handle multiple admins.
content = content.replace(
  "const [adminProfile, setAdminProfile] = useState<UserProfile | null>(null);",
  "const [adminProfiles, setAdminProfiles] = useState<UserProfile[]>([]);"
);

content = content.replace(
  "setAdminProfile(querySnapshot.docs[0].data() as UserProfile);",
  "setAdminProfiles(querySnapshot.docs.map(d => d.data() as UserProfile));"
);

// Now update the UI for multiple admins
const oldAdminBlock = `<div className="flex-1">
          <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Administrated By:</h3>
          <div className="flex items-center gap-2">
            <Link to={adminProfile ? \`/\${adminProfile.handle}\` : '#'} className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500 overflow-hidden shrink-0">
              {adminProfile?.photoURL ? (
                 <img src={adminProfile.photoURL} alt="Admin" className="w-full h-full object-cover" />
              ) : (
                adminProfile ? adminProfile.displayName.charAt(0).toUpperCase() : '?'
              )}
            </Link>
            <div className="min-w-0">
              <Link to={adminProfile ? \`/\${adminProfile.handle}\` : '#'} className="font-semibold text-sm text-zinc-200 hover:underline truncate block">
                {adminProfile ? adminProfile.displayName : 'no one'}
              </Link>
              <div className="text-xs text-zinc-500 truncate">
                {adminProfile ? \`@\${adminProfile.handle}\` : '@no_one'}
              </div>
            </div>
          </div>
        </div>`;

const newAdminBlock = `<div className="flex-1">
          <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Administrated By:</h3>
          <div className="space-y-3">
            {adminProfiles.length > 0 ? adminProfiles.map(admin => (
              <div key={admin.uid} className="flex items-center gap-2">
                <Link to={\`/\${admin.handle}\`} className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500 overflow-hidden shrink-0">
                  {admin.photoURL ? (
                     <img src={admin.photoURL} alt="Admin" className="w-full h-full object-cover" />
                  ) : (
                    admin.displayName.charAt(0).toUpperCase()
                  )}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link to={\`/\${admin.handle}\`} className="font-semibold text-sm text-zinc-200 hover:underline truncate flex items-center gap-1">
                    {admin.displayName}
                  </Link>
                  <div className="text-[11px] text-zinc-500 truncate">
                    @{admin.handle}
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-xs text-zinc-500">None found</div>
            )}
          </div>
        </div>`;

content = content.replace(oldAdminBlock, newAdminBlock);

fs.writeFileSync('src/components/LeftSidebar.tsx', content);
