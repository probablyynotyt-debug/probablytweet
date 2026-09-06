import React, { useState } from 'react';
import { X, Lock } from 'lucide-react';
import { UserProfile } from '../types';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { BioRenderer } from './BioRenderer';

interface CustomizeProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onProfileUpdate: (updatedProfile: UserProfile) => void;
}

const SOLID_COLORS = [
  '#FFFFFF', '#FF3B30', '#FF9500', '#FFCC00', '#4CD964', '#5AC8FA', '#007AFF', '#5856D6', '#FF2D55',
  '#f87171', '#fb923c', '#fbbf24', '#a3e635', '#4ade80', '#34d399', '#2dd4bf', '#38bdf8', '#60a5fa', '#818cf8', '#a78bfa', '#c084fc', '#e879f9', '#f472b6', '#fb7185',
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e'
].slice(0, 50);

const GLOW_COLORS = SOLID_COLORS; // Same colors, just rendered with a drop-shadow

const GRADIENTS = [
  'linear-gradient(45deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
  'linear-gradient(120deg, #f6d365 0%, #fda085 100%)',
  'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)',
  'linear-gradient(120deg, #d4fc79 0%, #96e6a1 100%)',
  'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)',
  'linear-gradient(120deg, #fccb90 0%, #d57eeb 100%)',
  'linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)',
  'linear-gradient(120deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(to right, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(to right, #fa709a 0%, #fee140 100%)',
  'linear-gradient(to top, #30cfd0 0%, #330867 100%)',
].slice(0, 50);

const SPECIAL_EFFECTS = [
  { id: 'rainbow', name: 'Rainbow', style: { background: 'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'rainbow 5s linear infinite' } },
  { id: 'sepia', name: 'Sepia', filter: 'sepia(100%)' },
  { id: 'neon', name: 'Neon', style: { textShadow: '0 0 5px #fff, 0 0 10px #fff, 0 0 20px #fff, 0 0 40px #0ff, 0 0 80px #0ff, 0 0 90px #0ff, 0 0 100px #0ff, 0 0 150px #0ff' } },
  { id: 'fire', name: 'Fire', style: { textShadow: '0 -2px 4px #fff, 0 -2px 10px #FF3, 0 -10px 20px #F90, 0 -20px 40px #C33' } },
  { id: 'ice', name: 'Ice', style: { textShadow: '0 0 5px #fff, 0 0 10px #fff, 0 0 20px #e0f7fa, 0 0 40px #80deea, 0 0 80px #26c6da' } },
  { id: 'matrix', name: 'Matrix', style: { color: '#0f0', textShadow: '0 0 5px #0f0' } },
  { id: 'gold', name: 'Gold', style: { background: 'linear-gradient(to right, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } },
  { id: 'holo', name: 'Holographic', style: { background: 'linear-gradient(45deg, #ff00ff, #00ffff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'holo 3s linear infinite' } }
];

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

  // Preview styling helpers
  const getUsernameStyle = () => {
    const uc = previewCustomization.usernameColor;
    if (!uc) return {};
    if (uc.type === 'solid') return { color: uc.value };
    if (uc.type === 'glow') return { color: uc.value, textShadow: `0 0 10px ${uc.value}` };
    if (uc.type === 'gradient') return { background: uc.value, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' };
    return {};
  };

  const getAvatarBorderStyle = () => {
    const pb = previewCustomization.profileBorder;
    if (!pb) return { border: '4px solid #121216' };
    
    if (pb.type === 'effect') {
      const effect = SPECIAL_EFFECTS.find(e => e.id === pb.effectId);
      if (effect?.id === 'rainbow') {
        return { padding: '4px', background: 'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)', borderRadius: '9999px' };
      }
      return { border: '4px solid #121216' }; // Default for effects handled elsewhere if needed
    }

    const thickness = pb.thickness || 4;
    const color = pb.color || '#121216';
    const borderStyle = pb.type === 'dotted' ? 'dotted' : 'solid';
    const shadow = pb.type === 'glow' ? `0 0 15px ${color}` : 'none';

    return {
      border: `${thickness}px ${borderStyle} ${color}`,
      boxShadow: shadow
    };
  };

  // Apply sepia filter to whole preview container if selected
  const isSepia = previewCustomization.profileBorder?.type === 'effect' && previewCustomization.profileBorder?.effectId === 'sepia';

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
        <div className={`w-full md:w-1/2 border-b md:border-b-0 md:border-r border-zinc-800/80 bg-zinc-950/50 flex flex-col relative overflow-y-auto ${isSepia ? 'sepia' : ''}`}>
           <div className="p-6">
              <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-6 text-center">Live Preview</h3>
              
              <div className="border border-zinc-800 rounded-xl overflow-hidden bg-[#121216] shadow-xl">
                 {/* Banner */}
                  <div className="h-32 w-full bg-zinc-800 relative">
                    {profile.bannerURL && (
                      <img src={profile.bannerURL} alt="Banner" className="w-full h-full object-cover" />
                    )}
                  </div>
                  
                  <div className="px-4 pb-4">
                    <div className="flex justify-between items-start">
                      {/* Avatar with customized border */}
                      <div className="relative -mt-12">
                        {previewCustomization.profileBorder?.type === 'effect' && previewCustomization.profileBorder?.effectId === 'rainbow' ? (
                          <div style={getAvatarBorderStyle()}>
                             <div className="w-20 h-20 rounded-full border-4 border-[#121216] bg-zinc-700 overflow-hidden">
                                {profile.photoURL ? (
                                  <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-3xl text-white font-bold">
                                    {profile.displayName.charAt(0).toUpperCase()}
                                  </div>
                                )}
                             </div>
                          </div>
                        ) : (
                          <div 
                            className="w-24 h-24 rounded-full bg-zinc-700 overflow-hidden"
                            style={getAvatarBorderStyle()}
                          >
                            {profile.photoURL ? (
                              <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-3xl text-white font-bold">
                                {profile.displayName.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <button className="mt-3 border border-zinc-600 text-white font-bold py-1.5 px-4 rounded-full text-sm">
                        Edit profile
                      </button>
                    </div>

                    <div className="mt-3">
                      <h2 className="font-bold text-xl" style={getUsernameStyle()}>{profile.displayName}</h2>
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
                  <div className="grid grid-cols-5 sm:grid-cols-8 gap-3">
                    {SOLID_COLORS.slice(0, 16).map(color => (
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
                    Special Effects <Lock className="w-3 h-3 text-amber-500" />
                  </h3>
                  <p className="text-xs text-zinc-500 mb-2">Locked for now, but you can preview them!</p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {SPECIAL_EFFECTS.map(effect => (
                      <button
                        key={effect.id}
                        onClick={() => updateProfileBorder({ type: 'effect', effectId: effect.id })}
                        className={`py-2 px-3 text-sm font-semibold rounded-lg border text-left flex justify-between items-center ${previewCustomization?.profileBorder?.effectId === effect.id ? 'border-amber-500 text-amber-500 bg-amber-500/10' : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'}`}
                      >
                        <span style={effect.id === 'neon' ? { textShadow: '0 0 5px #0ff' } : effect.style}>{effect.name}</span>
                        <Lock className="w-3 h-3 opacity-50" />
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
