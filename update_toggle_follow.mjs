import fs from 'fs';

let content = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

if (!content.includes('writeBatch')) {
  content = content.replace("import { doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';", "import { doc, setDoc, deleteDoc, getDoc, writeBatch, increment, collection, query, where, getDocs, limit, getCountFromServer } from 'firebase/firestore';");
}

if (!content.includes('FollowListModal')) {
  content = content.replace("import { BioRenderer } from '../components/BioRenderer';", "import { BioRenderer } from '../components/BioRenderer';\nimport { FollowListModal } from '../components/FollowListModal';");
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

// Also inject the modal states
if (!content.includes('const [followModalOpen, setFollowModalOpen]')) {
  content = content.replace(
    'const [customizeModalOpen, setCustomizeModalOpen] = useState(false);', 
    'const [customizeModalOpen, setCustomizeModalOpen] = useState(false);\n  const [followModalOpen, setFollowModalOpen] = useState<{isOpen: boolean, type: \'followers\' | \'following\'}>({isOpen: false, type: \'followers\'});'
  );
}

// And update the followers/following click handlers
content = content.replace(
  /<div className="hover:underline cursor-pointer">/g, 
  (match, offset, str) => {
    if (str.substring(offset, offset + 150).includes('Following')) {
      return `<div className="hover:underline cursor-pointer" onClick={() => setFollowModalOpen({isOpen: true, type: 'following'})}>`;
    } else {
      return `<div className="hover:underline cursor-pointer" onClick={() => setFollowModalOpen({isOpen: true, type: 'followers'})}>`;
    }
  }
);

// Add modal component to render
if (!content.includes('<FollowListModal')) {
  content = content.replace(
    '</main>', 
    `  <FollowListModal
            isOpen={followModalOpen.isOpen}
            onClose={() => setFollowModalOpen(prev => ({...prev, isOpen: false}))}
            userId={profile.uid}
            type={followModalOpen.type}
          />\n        </main>`
  );
}

// Add code to fetch actual counts on load for accurate data sync (fixing out-of-sync existing numbers)
const syncCountsRegex = /const profileData = userDoc\.data\(\) as UserProfile;\n\s*if \(currentUser\) \{/m;
if (content.match(syncCountsRegex)) {
  const replacement = `const profileData = userDoc.data() as UserProfile;
          
          // Sync exact counts
          const followersQuery = query(collection(db, 'follows'), where('followingId', '==', uid));
          const followersSnapshot = await getCountFromServer(followersQuery);
          profileData.followersCount = followersSnapshot.data().count;

          const followingQuery = query(collection(db, 'follows'), where('followerId', '==', uid));
          const followingSnapshot = await getCountFromServer(followingQuery);
          profileData.followingCount = followingSnapshot.data().count;

          if (currentUser) {`;
  content = content.replace(syncCountsRegex, replacement);
}


fs.writeFileSync('src/pages/Profile.tsx', content);
