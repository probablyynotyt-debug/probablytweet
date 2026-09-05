import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, deleteDoc, updateDoc, increment, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

export function useInteractions(tweetId: string) {
  const { currentUser } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isReposted, setIsReposted] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      setIsLiked(false);
      setIsBookmarked(false);
      setIsReposted(false);
      return;
    }

    const likeRef = doc(db, 'likes', `${currentUser.uid}_${tweetId}`);
    const saveRef = doc(db, 'saves', `${currentUser.uid}_${tweetId}`);
    const repostRef = doc(db, 'reposts', `${currentUser.uid}_${tweetId}`);

    const unsubLike = onSnapshot(likeRef, (doc) => setIsLiked(doc.exists()));
    const unsubSave = onSnapshot(saveRef, (doc) => setIsBookmarked(doc.exists()));
    const unsubRepost = onSnapshot(repostRef, (doc) => setIsReposted(doc.exists()));

    return () => {
      unsubLike();
      unsubSave();
      unsubRepost();
    };
  }, [currentUser, tweetId]);

  const toggleLike = async () => {
    if (!currentUser) return;
    const ref = doc(db, 'likes', `${currentUser.uid}_${tweetId}`);
    const tweetRef = doc(db, 'tweets', tweetId);
    
    if (isLiked) {
      await deleteDoc(ref);
      await updateDoc(tweetRef, { likesCount: increment(-1) });
    } else {
      await setDoc(ref, { uid: currentUser.uid, tweetId, createdAt: Date.now() });
      await updateDoc(tweetRef, { likesCount: increment(1) });
    }
  };

  const toggleBookmark = async () => {
    if (!currentUser) return;
    const ref = doc(db, 'saves', `${currentUser.uid}_${tweetId}`);
    
    if (isBookmarked) {
      await deleteDoc(ref);
    } else {
      await setDoc(ref, { uid: currentUser.uid, tweetId, createdAt: Date.now() });
    }
  };

  const toggleRepost = async () => {
    if (!currentUser) return;
    const ref = doc(db, 'reposts', `${currentUser.uid}_${tweetId}`);
    const tweetRef = doc(db, 'tweets', tweetId);
    
    if (isReposted) {
      await deleteDoc(ref);
      await updateDoc(tweetRef, { repostsCount: increment(-1) });
    } else {
      await setDoc(ref, { uid: currentUser.uid, tweetId, createdAt: Date.now() });
      await updateDoc(tweetRef, { repostsCount: increment(1) });
    }
  };

  return { isLiked, isBookmarked, isReposted, toggleLike, toggleBookmark, toggleRepost };
}
