import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile } from '../types';

export const LeftSidebar = () => {
  const { currentUser, userProfile } = useAuth();
  const [adminProfiles, setAdminProfiles] = useState<UserProfile[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    const fetchAdminAndStats = async () => {
      try {
        const q = query(collection(db, 'users'), where('handle', 'in', ['probablynot', 'whydkitten']));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setAdminProfiles(querySnapshot.docs.map(d => d.data() as UserProfile));
        }
        
        // This is a naive way to get stats. In prod, you'd use aggregation queries.
        const allUsers = await getDocs(collection(db, 'users'));
        setTotalUsers(allUsers.size);
      } catch (e) {
        console.error(e);
      }
    };
    fetchAdminAndStats();
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] sticky top-4 py-2 px-2 w-full lg:w-[280px] xl:w-[320px]">
      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          placeholder="Search"
          className="w-full bg-[#1c1d26] border border-transparent rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-600 focus:bg-[#252532] transition-colors"
        />
      </div>

      {/* Instance Description */}
      <div className="mb-6 space-y-4 text-[15px] leading-relaxed text-zinc-200 px-1">
        <p>Probably Tweet is a twitter clone, where you can just tweet whatever you want.</p>
      </div>

      {/* Stats */}
      <div className="flex gap-4 mb-8 px-1">
        <div className="flex-1">
          <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Administrated By:</h3>
          <div className="space-y-3">
            {adminProfiles.length > 0 ? adminProfiles.map(admin => (
              <div key={admin.uid} className="flex items-center gap-2">
                <Link to={`/${admin.handle}`} className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500 overflow-hidden shrink-0">
                  {admin.photoURL ? (
                     <img src={admin.photoURL} alt="Admin" className="w-full h-full object-cover" />
                  ) : (
                    admin.displayName.charAt(0).toUpperCase()
                  )}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link to={`/${admin.handle}`} className="font-semibold text-sm text-zinc-200 hover:underline truncate flex items-center gap-1">
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
        </div>
        <div className="flex-1">
          <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Server Stats:</h3>
          <div className="font-bold text-sm text-zinc-200">{totalUsers}</div>
          <div className="text-xs text-zinc-500">active users</div>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1"></div>

      {/* Auth State & Footer */}
      <div className="space-y-4 mt-auto px-1">
        {userProfile && (
          <div className="flex items-center gap-3 bg-[#1c1d26] p-3 rounded-xl border border-zinc-800">
             <Link to={`/${userProfile.handle}`} className="w-10 h-10 rounded-full bg-zinc-700 overflow-hidden shrink-0">
               {userProfile.photoURL ? (
                 <img src={userProfile.photoURL} alt="PFP" className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center font-bold text-white text-sm">
                   {userProfile.displayName.charAt(0).toUpperCase()}
                 </div>
               )}
             </Link>
             <div className="min-w-0 flex-1">
               <Link to={`/${userProfile.handle}`} className="font-bold text-sm text-white hover:underline truncate block">{userProfile.displayName}</Link>
               <div className="text-xs text-zinc-400 truncate">@{userProfile.handle}</div>
             </div>
          </div>
        )}
        <div className="text-[13px] text-zinc-500 space-y-1">
          <p>
            <Link to="/" className="text-zinc-300 font-semibold hover:underline">Probably Tweet</Link> · About · Privacy policy
          </p>
        </div>
      </div>
    </div>
  );
};

