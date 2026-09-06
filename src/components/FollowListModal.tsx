import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, limit as firestoreLimit, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile } from '../types';

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  type: 'followers' | 'following';
}

export const FollowListModal: React.FC<FollowListModalProps> = ({ isOpen, onClose, userId, type }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchUsers = async () => {
      setLoading(true);
      setUsers([]);
      try {
        const followsRef = collection(db, 'follows');
        const searchField = type === 'followers' ? 'followingId' : 'followerId';
        const targetField = type === 'followers' ? 'followerId' : 'followingId';
        const limitCount = type === 'followers' ? 50 : 10;
        
        const q = query(followsRef, where(searchField, '==', userId), firestoreLimit(limitCount));
        const snapshot = await getDocs(q);
        
        const userPromises = snapshot.docs.map(async (d) => {
          const targetId = d.data()[targetField];
          const userDoc = await getDoc(doc(db, 'users', targetId));
          if (userDoc.exists()) {
            return userDoc.data() as UserProfile;
          }
          return null;
        });

        const fetchedUsers = (await Promise.all(userPromises)).filter((u): u is UserProfile => u !== null);
        setUsers(fetchedUsers);
      } catch (e) {
        console.error('Error fetching follow list:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isOpen, userId, type]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1c1d26] w-full max-w-md rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl flex flex-col max-h-[80vh]">
        <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between sticky top-0 bg-[#1c1d26]/90 backdrop-blur-md z-10">
          <h2 className="text-xl font-bold text-white capitalize">{type}</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="text-center text-zinc-500 py-8">Loading...</div>
          ) : users.length > 0 ? (
            users.map(user => (
              <div key={user.uid} className="flex items-center justify-between gap-3">
                <Link to={`/${user.handle}`} className="flex items-center gap-3 min-w-0" onClick={onClose}>
                  <div className="w-10 h-10 rounded-full bg-zinc-700 overflow-hidden shrink-0 border border-zinc-800">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-white">
                        {user.displayName?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-white truncate hover:underline">{user.displayName}</div>
                    <div className="text-sm text-zinc-500 truncate">@{user.handle}</div>
                  </div>
                </Link>
                {/* Could add a follow back button here if needed */}
              </div>
            ))
          ) : (
            <div className="text-center text-zinc-500 py-8">
              No {type} found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
