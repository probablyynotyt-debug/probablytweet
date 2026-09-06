import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, User, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

export const MobileBottomNav = () => {
  const { currentUser, userProfile, openAuthModal } = useAuth();
  const location = useLocation();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#121216]/90 backdrop-blur-md border-t border-zinc-800/80 px-6 py-3 flex items-center justify-between z-50">
      <Link to="/" className={`p-2 rounded-full transition-colors ${location.pathname === '/' ? 'text-white bg-zinc-800' : 'text-zinc-500 hover:text-zinc-300'}`}>
        <Home className="w-6 h-6" />
      </Link>
      
      {currentUser && userProfile ? (
        <>
          <Link to={`/${userProfile.handle}`} className={`p-2 rounded-full transition-colors ${location.pathname === `/${userProfile.handle}` ? 'text-white bg-zinc-800' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <User className="w-6 h-6" />
          </Link>
          <button onClick={() => signOut(auth)} className="p-2 text-zinc-500 hover:text-red-400 rounded-full transition-colors">
            <LogOut className="w-6 h-6" />
          </button>
        </>
      ) : (
        <button onClick={() => openAuthModal('signin')} className="p-2 text-zinc-500 hover:text-zinc-300 rounded-full transition-colors">
          <LogIn className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};
