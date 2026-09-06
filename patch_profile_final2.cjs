const fs = require('fs');
let content = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

const oldBlock = `  const handleUpdateImageSubmit = async (file: File) => {
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
  };
    if (!profile) return;
    try {
      const userRef = doc(db, 'users', profile.uid);
      await setDoc(userRef, { [field]: url }, { merge: true });
      if (myProfile && profile.uid === myProfile.uid) { 
         await refreshProfile();
      }
      setProfile(prev => prev ? { ...prev, [field]: url } : null);
    } catch (error) {
      console.error(\`Error updating \${field}:\`, error);
    }
  };`;

const newBlock = `  const handleUpdateImageSubmit = async (file: File) => {
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
  };`;

content = content.replace(oldBlock, newBlock);

fs.writeFileSync('src/pages/Profile.tsx', content);
