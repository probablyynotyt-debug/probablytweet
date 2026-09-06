import React, { useState } from 'react';
import { X, Palette } from 'lucide-react';
import { UserProfile } from '../types';
import { doc, updateDoc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { differenceInDays } from 'date-fns';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onProfileUpdate: (updatedProfile: UserProfile) => void;
  onOpenCustomize: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, profile, onProfileUpdate, onOpenCustomize }) => {
  const [displayName, setDisplayName] = useState(profile.displayName || '');
  const [handle, setHandle] = useState(profile.handle || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSave = async () => {
    setError('');
    setLoading(true);

    const updates: Partial<UserProfile> = {
      bio
    };

    let displayNameChanged = false;
    let handleChanged = false;

    // Check display name cooldown
    if (displayName !== profile.displayName) {
      if (profile.displayNameUpdatedAt) {
        const daysSince = differenceInDays(new Date(), new Date(profile.displayNameUpdatedAt));
        if (daysSince < 7) {
          setError(`You can change your display name again in ${7 - daysSince} days.`);
          setLoading(false);
          return;
        }
      }
      updates.displayName = displayName;
      updates.displayNameUpdatedAt = Date.now();
      displayNameChanged = true;
    }

    // Check handle cooldown
    if (handle !== profile.handle) {
      if (profile.handleUpdatedAt) {
        const daysSince = differenceInDays(new Date(), new Date(profile.handleUpdatedAt));
        if (daysSince < 30) {
          setError(`You can change your handle again in ${30 - daysSince} days.`);
          setLoading(false);
          return;
        }
      }
      
      const handleLower = handle.toLowerCase();
      // Check if handle is taken
      const handleRef = doc(db, 'handles', handleLower);
      const handleDoc = await getDoc(handleRef);
      if (handleDoc.exists()) {
        setError('That handle is already taken.');
        setLoading(false);
        return;
      }
      
      updates.handle = handle;
      updates.handleUpdatedAt = Date.now();
      handleChanged = true;
    }

    try {
      const userRef = doc(db, 'users', profile.uid);
      await updateDoc(userRef, updates);

      if (handleChanged) {
        // Create new handle mapping
        await setDoc(doc(db, 'handles', handle.toLowerCase()), { uid: profile.uid });
        // Delete old handle mapping
        if (profile.handle) {
          await deleteDoc(doc(db, 'handles', profile.handle.toLowerCase()));
        }
      }

      onProfileUpdate({ ...profile, ...updates });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#121216] border border-zinc-800/80 rounded-2xl w-full max-w-[600px] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white flex items-center gap-4">
              Edit profile
              <button 
                onClick={() => { onClose(); onOpenCustomize(); }}
                className="flex items-center gap-2 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-200 py-1.5 px-3 rounded-full transition-colors"
              >
                <Palette className="w-4 h-4 text-[#6364ff]" />
                Customize
              </button>
            </h2>
          </div>
          <button 
            onClick={handleSave}
            disabled={loading || (!displayName.trim() && !handle.trim())}
            className="bg-white text-black font-bold py-1.5 px-4 rounded-full text-sm hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-400">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-[#6364ff] transition-colors"
              placeholder="Display Name"
            />
            <p className="text-xs text-zinc-500 mt-1">You can change this every 7 days.</p>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-400">Handle (@)</label>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-[#6364ff] transition-colors"
              placeholder="username"
            />
            <p className="text-xs text-zinc-500 mt-1">You can change this every 30 days.</p>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-400">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-[#6364ff] transition-colors resize-none"
              placeholder="Tell us about yourself. Supports markdown (bold, italic) and links."
            />
          </div>
        </div>
      </div>
    </div>
  );
};
