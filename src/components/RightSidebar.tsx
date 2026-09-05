import React from 'react';
import { TrendingUp, Globe2, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

interface RightSidebarProps {
  onQuickPostTag?: (tag: string) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = () => {
  const { currentUser, openAuthModal } = useAuth();

  return (
    <aside className="w-full flex flex-col pt-6 pb-4">
      {/* Site Name Header */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <span className="text-xl font-bold text-white tracking-tight">Probably Tweet</span>
      </div>

      {/* Navigation Links */}
      <div className="space-y-1 mb-8">
        <button className="w-full flex items-center gap-4 px-4 py-3 text-zinc-100 hover:bg-[#1a1b26] rounded-xl transition-colors font-semibold text-sm">
          <TrendingUp className="w-5 h-5 text-zinc-300" />
          Trending
        </button>
        <button className="w-full flex items-center gap-4 px-4 py-3 text-zinc-100 hover:bg-[#1a1b26] rounded-xl transition-colors font-semibold text-sm">
          <Globe2 className="w-5 h-5 text-zinc-300" />
          Live feeds
        </button>
        
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

      {/* Info & Auth */}
      {!currentUser && (
        <div className="border-t border-zinc-800/80 pt-8 px-2">
          <h2 className="font-bold text-[15px] text-white mb-4 leading-snug">
            Probably Tweet is the best way to keep up with what's happening.
          </h2>
          <p className="text-sm text-zinc-300 mb-6 leading-relaxed">
            Follow anyone across the Fediverse and see it all in chronological order. No algorithms, ads, or clickbait in sight.
          </p>

          <div className="space-y-3">
            <button 
              onClick={() => openAuthModal('signup')}
              className="w-full bg-[#6364ff] hover:bg-[#5253d8] text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
            >
              Create account
            </button>
            <button 
              onClick={() => openAuthModal('signin')}
              className="w-full border border-zinc-700 hover:bg-[#1a1b26] text-zinc-100 font-semibold py-2.5 rounded-lg transition-colors text-sm"
            >
              Sign in
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};


