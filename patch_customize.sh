#!/bin/bash
cat << 'INNER_EOF' > /tmp/customize_changes.txt
import React, { useState } from 'react';
import { X, Lock } from 'lucide-react';
import { UserProfile } from '../types';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { BioRenderer } from './BioRenderer';
import { SOLID_COLORS, GLOW_COLORS, GRADIENTS, SPECIAL_EFFECTS, getUsernameStyle, getProfileBorderStyle, getProfileEffectClass } from '../lib/customization';

interface CustomizeProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onProfileUpdate: (updatedProfile: UserProfile) => void;
}

export const CustomizeProfileModal: React.FC<CustomizeProfileModalProps> = ({ isOpen, onClose, profile, onProfileUpdate }) => {
  const [activeTab, setActiveTab] = useState<'username' | 'border'>('username');
  const [loading, setLoading] = useState(false);

  // Local state for preview
  const [previewCustomization, setPreviewCustomization] = useState(profile.customization || {});
  const [nameColorType, setNameColorType] = useState<'solid' | 'glow' | 'gradient'>(previewCustomization?.usernameColor?.type || 'solid');

  if (!isOpen) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      const updates = {
        customization: previewCustomization
      };
      await updateDoc(doc(db, 'users', profile.uid), updates);
      onProfileUpdate({ ...profile, customization: previewCustomization });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateUsernameColor = (type: 'solid' | 'glow' | 'gradient', value: string) => {
    setPreviewCustomization(prev => ({
      ...prev,
      usernameColor: { type, value }
    }));
  };

  const updateProfileBorder = (update: Partial<NonNullable<UserProfile['customization']>['profileBorder']>) => {
    setPreviewCustomization(prev => ({
      ...prev,
      profileBorder: { ...(prev.profileBorder || { type: 'solid', thickness: 4 }), ...update } as any
    }));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#121216] border border-zinc-800/80 rounded-2xl w-full max-w-[1000px] h-[80vh] flex flex-col md:flex-row overflow-hidden shadow-2xl">
        
        {/* Mobile Header (Hidden on md+) */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-zinc-800/80">
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white rounded-full">
             <X className="w-5 h-5" />
          </button>
          <span className="font-bold text-white">Customize</span>
          <button onClick={handleSave} className="text-sm font-bold text-[#6364ff]">Save</button>
        </div>

        {/* Left: Preview Panel */}
        <div className={`w-full md:w-1/2 border-b md:border-b-0 md:border-r border-zinc-800/80 bg-zinc-950/50 flex flex-col relative overflow-y-auto`}>
           <div className="p-6">
              <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-6 text-center">Live Preview</h3>
              
              <div 
                className={`rounded-xl overflow-hidden bg-[#121216] shadow-xl ${getProfileEffectClass(previewCustomization)}`}
                style={{
                  ...(!previewCustomization?.profileBorder ? { border: '1px solid #27272a' } : getProfileBorderStyle(previewCustomization))
                }}
              >
                 {/* Banner */}
                  <div className="h-32 w-full bg-zinc-800 relative">
                    {profile.bannerURL && (
                      <img src={profile.bannerURL} alt="Banner" className="w-full h-full object-cover" />
                    )}
                  </div>
                  
                  <div className="px-4 pb-4">
                    <div className="flex justify-between items-start">
                      {/* Avatar */}
                      <div className="relative -mt-12">
                         <div className="w-24 h-24 rounded-full border-4 border-[#121216] bg-zinc-700 overflow-hidden">
                            {profile.photoURL ? (
                              <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-3xl text-white font-bold">
                                {profile.displayName.charAt(0).toUpperCase()}
                              </div>
                            )}
                         </div>
                      </div>
                      <button className="mt-3 border border-zinc-600 text-white font-bold py-1.5 px-4 rounded-full text-sm">
                        Edit profile
                      </button>
                    </div>

                    <div className="mt-3">
                      <h2 className="font-bold text-xl" style={getUsernameStyle(previewCustomization)}>{profile.displayName}</h2>
                      <p className="text-sm text-zinc-500">@{profile.handle}</p>
                    </div>
                    
                    {profile.bio && (
                      <div className="mt-3">
                        <BioRenderer bio={profile.bio} />
                      </div>
                    )}
                  </div>
              </div>
           </div>
        </div>

        {/* Right: Controls */}
        <div className="w-full md:w-1/2 flex flex-col h-full bg-[#121216]">
          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between p-4 border-b border-zinc-800/80">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
               Customize
            </h2>
            <div className="flex items-center gap-3">
              <button onClick={onClose} className="text-sm text-zinc-400 hover:text-white font-medium">Cancel</button>
              <button onClick={handleSave} disabled={loading} className="bg-white text-black font-bold py-1.5 px-4 rounded-full text-sm hover:bg-zinc-200 disabled:opacity-50">
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-zinc-800/80">
            <button 
              onClick={() => setActiveTab('username')} 
              className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'username' ? 'text-white border-b-2 border-[#6364ff]' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              USERNAME COLOR
            </button>
            <button 
              onClick={() => setActiveTab('border')} 
              className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'border' ? 'text-white border-b-2 border-[#6364ff]' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              PROFILE BORDERS
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'username' && (
              <div className="space-y-6">
                {/* Type selector */}
                <div className="flex gap-2 p-1 bg-zinc-900 rounded-lg">
                  {['solid', 'glow', 'gradient'].map(type => (
                    <button 
                      key={type}
                      onClick={() => setNameColorType(type as any)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-md capitalize ${nameColorType === type ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-5 sm:grid-cols-8 gap-3">
                  {nameColorType === 'solid' && SOLID_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => updateUsernameColor('solid', color)}
                      className="w-8 h-8 rounded-full border border-zinc-700 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  
                  {nameColorType === 'glow' && GLOW_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => updateUsernameColor('glow', color)}
                      className="w-8 h-8 rounded-full border border-zinc-700 hover:scale-110 transition-transform relative flex items-center justify-center"
                      style={{ backgroundColor: color }}
                    >
                      <div className="absolute inset-0 rounded-full" style={{ boxShadow: `0 0 10px ${color}` }}></div>
                    </button>
                  ))}

                  {nameColorType === 'gradient' && GRADIENTS.map(grad => (
                    <button
                      key={grad}
                      onClick={() => updateUsernameColor('gradient', grad)}
                      className="w-8 h-8 rounded-full border border-zinc-700 hover:scale-110 transition-transform"
                      style={{ background: grad }}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'border' && (
              <div className="space-y-8">
                
                {/* Style */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-zinc-400">Border Style</h3>
                  <div className="flex gap-2">
                     {['solid', 'dotted', 'glow'].map(style => (
                        <button 
                          key={style}
                          onClick={() => updateProfileBorder({ type: style as any })}
                          className={`flex-1 py-2 text-sm font-semibold rounded-lg capitalize border ${previewCustomization?.profileBorder?.type === style ? 'border-[#6364ff] text-[#6364ff] bg-[#6364ff]/10' : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'}`}
                        >
                          {style}
                        </button>
                     ))}
                  </div>
                </div>

                {/* Color */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-zinc-400">Color</h3>
                  <div className="grid grid-cols-5 sm:grid-cols-8 gap-3 h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {SOLID_COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => updateProfileBorder({ color })}
                        className={`w-8 h-8 rounded-full border-2 transition-transform ${previewCustomization?.profileBorder?.color === color ? 'border-white scale-110' : 'border-transparent hover:scale-110'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Thickness */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-zinc-400 flex justify-between">
                    <span>Thickness</span>
                    <span>{previewCustomization?.profileBorder?.thickness || 4}px</span>
                  </h3>
                  <input 
                    type="range" 
                    min="1" max="10" 
                    value={previewCustomization?.profileBorder?.thickness || 4}
                    onChange={(e) => updateProfileBorder({ thickness: parseInt(e.target.value) })}
                    className="w-full accent-[#6364ff]"
                  />
                </div>

                {/* Special Effects */}
                <div className="space-y-3 pt-4 border-t border-zinc-800/80">
                  <h3 className="text-sm font-bold text-zinc-400 flex items-center gap-2">
                    Special Effects (Unlocked)
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-2 h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {SPECIAL_EFFECTS.map(effect => (
                      <button
                        key={effect.id}
                        onClick={() => updateProfileBorder({ type: 'effect', effectId: effect.id })}
                        className={`py-2 px-3 text-sm font-semibold rounded-lg border text-left flex justify-between items-center ${previewCustomization?.profileBorder?.effectId === effect.id ? 'border-[#6364ff] text-[#6364ff] bg-[#6364ff]/10' : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'}`}
                      >
                        <span style={effect.id === 'neon' ? { textShadow: '0 0 5px #0ff' } : {}}>{effect.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
INNER_EOF
cp /tmp/customize_changes.txt src/components/CustomizeProfileModal.tsx
