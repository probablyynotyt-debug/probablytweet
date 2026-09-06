const fs = require('fs');
let content = fs.readFileSync('src/components/StickerPicker.tsx', 'utf8');

// We need to change imports
content = content.replace(
  "import { collection, query, orderBy, limit, getDocs, addDoc } from 'firebase/firestore';",
  "import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';"
);

// We need to change the fetch logic
const fetchOld = `    const fetchStickers = async () => {
      try {
        const q = query(collection(db, 'stickers'), orderBy('createdAt', 'desc'), limit(50));
        const snapshot = await getDocs(q);
        setStickers(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Sticker)));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };`;

const fetchNew = `    const fetchStickers = async () => {
      if (!currentUser) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.stickers) {
            // Sort by createdAt descending
            const sortedStickers = [...data.stickers].sort((a, b) => b.createdAt - a.createdAt);
            setStickers(sortedStickers);
          }
        }
      } catch (e) {
        console.error('Error fetching stickers:', e);
      } finally {
        setLoading(false);
      }
    };`;

content = content.replace(fetchOld, fetchNew);

// We need to change the upload logic
const uploadOld = `      const url = await uploadToCloudinary(file, 'image');
      const docRef = await addDoc(collection(db, 'stickers'), {
        uid: currentUser.uid,
        url,
        createdAt: Date.now()
      });
      setStickers(prev => [{ id: docRef.id, uid: currentUser.uid, url, createdAt: Date.now() }, ...prev]);`;

const uploadNew = `      const url = await uploadToCloudinary(file, 'image');
      const newSticker = {
        id: Date.now().toString(),
        uid: currentUser.uid,
        url,
        createdAt: Date.now()
      };
      await updateDoc(doc(db, 'users', currentUser.uid), {
        stickers: arrayUnion(newSticker)
      });
      setStickers(prev => [newSticker, ...prev]);`;

content = content.replace(uploadOld, uploadNew);

fs.writeFileSync('src/components/StickerPicker.tsx', content);
