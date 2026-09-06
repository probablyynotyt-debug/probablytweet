const fs = require('fs');
let content = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

// Fix the onReply to onAddReply
content = content.replace(
  "onReply={addReply as any}",
  "onAddReply={addReply as any}"
);
content = content.replace(
  "onReply={addReply}",
  "onAddReply={addReply as any}"
);

// Fix the image upload handler
content = content.replace(
  "  const handleUpdateImageSubmit = async (url: string, field: 'photoURL' | 'bannerURL') => {",
  `  const handleUpdateImageSubmit = async (file: File) => {
    if (!profile) return;
    try {
      const { uploadToCloudinary } = await import('../lib/cloudinary');
      const url = await uploadToCloudinary(file, 'image');
      const field = imageModal.field;
      const userRef = doc(db, 'users', profile.uid);
      await setDoc(userRef, { [field]: url }, { merge: true });
      if (myProfile && profile.uid === myProfile.uid) { 
        await refreshProfile();
      }
      setProfile(prev => prev ? { ...prev, [field]: url } : null);
    } catch (error) {
      console.error('Error updating image:', error);
      alert('Failed to upload image. Make sure Cloudinary env vars are set.');
    }
  };`
);

fs.writeFileSync('src/pages/Profile.tsx', content);
