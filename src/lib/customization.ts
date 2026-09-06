export const SOLID_COLORS = [
  '#FFFFFF', '#F8F9FA', '#E9ECEF', '#DEE2E6', '#CED4DA', '#ADB5BD', '#6C757D', '#495057', '#343A40', '#212529',
  '#FF0000', '#D50000', '#C51162', '#AA00FF', '#6200EA', '#304FFE', '#2962FF', '#00B8D4', '#00BFA5', '#00C853',
  '#64DD17', '#AEEA00', '#FFD600', '#FFAB00', '#FF6D00', '#DD2C00', '#FF1744', '#F50057', '#D500F9', '#651FFF',
  '#3D5AFE', '#2979FF', '#00E5FF', '#1DE9B6', '#00E676', '#76FF03', '#C6FF00', '#FFEA00', '#FFC400', '#FF9100',
  '#FF3D00', '#f87171', '#fb923c', '#fbbf24', '#a3e635', '#4ade80', '#34d399', '#2dd4bf', '#38bdf8', '#60a5fa'
];

export const GLOW_COLORS = [...SOLID_COLORS];

export const GRADIENTS = [
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
  'linear-gradient(to right, #ff758c 0%, #ff7eb3 100%)',
  'linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(to right, #ff8177 0%, #ff867a 0%, #ff8c7f 21%, #f99185 52%, #cf556c 78%, #b12a5b 100%)',
  'linear-gradient(to top, #ff0844 0%, #ffb199 100%)',
  'linear-gradient(to top, #96fbc4 0%, #f9f586 100%)',
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #6B73FF 0%, #000DFF 100%)',
  'linear-gradient(to top, #c471f5 0%, #fa71cd 100%)',
  'linear-gradient(to top, #48c6ef 0%, #6f86d6 100%)',
  'linear-gradient(to right, #feada6 0%, #f5efef 100%)',
  'linear-gradient(to top, #e14fad 0%, #f9d423 100%)',
  'linear-gradient(to top, #00c6fb 0%, #005bea 100%)',
  'linear-gradient(to top, #fdcbf1 0%, #fdcbf1 1%, #e6dee9 100%)',
  'linear-gradient(to right, #ffecd2 0%, #fcb69f 100%)',
  'linear-gradient(to right, #cfd9df 0%, #e2ebf0 100%)',
  'linear-gradient(to top, #fff1eb 0%, #ace0f9 100%)',
  'linear-gradient(to right, #a8caba 0%, #5d4157 100%)',
  'linear-gradient(to right, #29323c 0%, #485563 100%)',
  'linear-gradient(to bottom, #FFB199 0%, #FF0844 100%)',
  'linear-gradient(to right, #92fe9d 0%, #00c9ff 100%)',
  'linear-gradient(to right, #00b09b, #96c93d)',
  'linear-gradient(to right, #8e2de2, #4a00e0)',
  'linear-gradient(to right, #ff416c, #ff4b2b)',
  'linear-gradient(to right, #f7971e, #ffd200)',
  'linear-gradient(to right, #b20a2c, #fffbd5)',
  'linear-gradient(to right, #fc4a1a, #f7b733)',
  'linear-gradient(to right, #11998e, #38ef7d)',
  'linear-gradient(to right, #ee0979, #ff6a00)',
  'linear-gradient(to right, #3a1c71, #d76d77, #ffaf7b)',
  'linear-gradient(to right, #1fa2ff, #12d8fa, #a6ffcb)',
  'linear-gradient(to right, #4cb8c4, #3cd3ad)',
  'linear-gradient(to right, #0052d4, #4364f7, #6fb1fc)',
  'linear-gradient(to right, #fc00ff, #00dbde)',
  'linear-gradient(to right, #e55d87, #5fc3e4)'
];

export const SPECIAL_EFFECTS = [
  { id: 'rainbow', name: 'Rainbow', style: { border: '4px solid', borderImage: 'linear-gradient(to bottom, red, orange, yellow, green, blue, indigo, violet) 1' }, className: 'animate-rainbow-bg' },
  { id: 'sepia', name: 'Vintage Sepia', style: { border: '4px solid #704214' }, className: 'sepia' },
  { id: 'neon', name: 'Cyber Neon', style: { border: '4px solid #0ff', boxShadow: '0 0 10px #0ff, 0 0 20px #0ff, inset 0 0 10px #0ff' } },
  { id: 'fire', name: 'Hellfire', style: { border: '4px solid #ff4500', boxShadow: '0 0 15px #ff4500, inset 0 0 15px #ff4500' } },
  { id: 'ice', name: 'Glacial Ice', style: { border: '4px solid #a5f3fc', boxShadow: '0 0 15px #a5f3fc, inset 0 0 15px #a5f3fc' } },
  { id: 'matrix', name: 'The Matrix', style: { border: '4px solid #22c55e', boxShadow: '0 0 15px #22c55e, inset 0 0 15px #22c55e' } },
  { id: 'gold', name: 'Royal Gold', style: { border: '4px solid', borderImage: 'linear-gradient(to bottom, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c) 1' } },
  { id: 'holo', name: 'Holographic', style: { border: '4px solid', borderImage: 'linear-gradient(45deg, #ff00ff, #00ffff) 1' } },
  { id: 'cyberpunk', name: 'Cyberpunk', style: { border: '4px dashed #f43f5e', boxShadow: '0 0 10px #f43f5e' } },
  { id: 'void', name: 'The Void', style: { border: '4px solid #000', boxShadow: '0 0 20px #4c1d95, inset 0 0 20px #4c1d95' } },
  { id: 'toxic', name: 'Toxic Waste', style: { border: '4px dotted #84cc16', boxShadow: '0 0 15px #84cc16' } },
  { id: 'sakura', name: 'Sakura Blossom', style: { border: '4px solid #fbcfe8', boxShadow: '0 0 15px #fbcfe8, inset 0 0 15px #fbcfe8' } },
  { id: 'ocean', name: 'Deep Ocean', style: { border: '4px solid #0369a1', boxShadow: '0 0 15px #0369a1, inset 0 0 15px #0369a1' } },
  { id: 'sunset', name: 'Outrun Sunset', style: { border: '4px solid', borderImage: 'linear-gradient(to bottom, #f97316, #db2777) 1' } },
  { id: 'midnight', name: 'Midnight City', style: { border: '4px solid #1e1b4b', boxShadow: '0 0 20px #312e81' } },
  { id: 'glitch', name: 'Glitch', style: { border: '4px solid #fff', boxShadow: '4px 4px 0 #0ff, -4px -4px 0 #f0f' } },
];

export const getUsernameStyle = (customization: any) => {
  if (!customization?.usernameColor) return {};
  const uc = customization.usernameColor;
  if (uc.type === 'solid') return { color: uc.value };
  if (uc.type === 'glow') return { color: uc.value, textShadow: `0 0 10px ${uc.value}` };
  if (uc.type === 'gradient') return { background: uc.value, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' };
  return {};
};

export const getProfileBorderStyle = (customization: any) => {
  if (!customization?.profileBorder) return {};
  const pb = customization.profileBorder;
  
  if (pb.type === 'effect') {
    const effect = SPECIAL_EFFECTS.find(e => e.id === pb.effectId);
    if (effect) return effect.style;
    return {};
  }

  const thickness = pb.thickness || 1;
  const color = pb.color || '#27272a';
  const borderStyle = pb.type === 'dotted' ? 'dotted' : 'solid';
  const shadow = pb.type === 'glow' ? `0 0 20px ${color}, inset 0 0 10px ${color}` : 'none';

  return {
    border: `${thickness}px ${borderStyle} ${color}`,
    boxShadow: shadow
  };
};

export const getProfileEffectClass = (customization: any) => {
  if (!customization?.profileBorder) return '';
  const pb = customization.profileBorder;
  
  if (pb.type === 'effect') {
    const effect = SPECIAL_EFFECTS.find(e => e.id === pb.effectId);
    if (effect && effect.className) return effect.className;
  }
  return '';
};
