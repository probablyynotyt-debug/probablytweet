const fs = require('fs');

let content = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

// We need to import writeBatch and increment
if (!content.includes('writeBatch')) {
  content = content.replace("import { doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';", "import { doc, setDoc, deleteDoc, getDoc, writeBatch, increment, collection, query, where, getDocs, limit } from 'firebase/firestore';");
}

const toggleFollowStr = `  const toggleFollow = async () => {
    if (!currentUser || !profile) return;
    const ref = doc(db, 'follows', \`\${currentUser.uid}_\${profile.uid}\`);
    const batch = writeBatch(db);
    const currentUserRef = doc(db, 'users', currentUser.uid);
    const profileUserRef = doc(db, 'users', profile.uid);

    if (profile.isFollowing) {
      batch.delete(ref);
      batch.update(currentUserRef, { followingCount: increment(-1) });
      batch.update(profileUserRef, { followersCount: increment(-1) });
      await batch.commit();
      setProfile(prev => prev ? { ...prev, isFollowing: false, followersCount: Math.max(0, (prev.followersCount || 0) - 1) } : null);
    } else {
      batch.set(ref, {
        followerId: currentUser.uid,
        followingId: profile.uid,
        createdAt: Date.now()
      });
      batch.update(currentUserRef, { followingCount: increment(1) });
      batch.update(profileUserRef, { followersCount: increment(1) });
      await batch.commit();
      setProfile(prev => prev ? { ...prev, isFollowing: true, followersCount: (prev.followersCount || 0) + 1 } : null);
    }
  };`;

content = content.replace(/  const toggleFollow = async \(\) => \{[\s\S]*?  \};\n/m, toggleFollowStr + '\n');
fs.writeFileSync('src/pages/Profile.tsx', content);
