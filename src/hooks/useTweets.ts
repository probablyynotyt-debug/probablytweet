import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, limit, addDoc, doc, deleteDoc, getDoc, where, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Tweet, UserProfile } from '../types';
import { useAuth } from '../contexts/AuthContext';

export type TabType = 'posts' | 'replies' | 'reposts' | 'likes' | 'saves';

export function useTweets(handle?: string, tab: TabType = 'posts') {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    setLoading(true);

    const populateAuthors = async (docs: Tweet[]) => {
      return Promise.all(docs.map(async (data) => {
        const authorDoc = await getDoc(doc(db, 'users', data.authorUid));
        return {
          ...data,
          author: authorDoc.exists() ? authorDoc.data() as UserProfile : undefined
        };
      }));
    };

    const fetchTweets = async () => {
      if (handle) {
        const handleDoc = await getDoc(doc(db, 'handles', handle.toLowerCase()));
        if (!handleDoc.exists()) {
          setTweets([]);
          setLoading(false);
          return;
        }
        const uid = handleDoc.data().uid;

        if (tab === 'posts') {
          const q = query(collection(db, 'tweets'), where('authorUid', '==', uid), limit(100));
          return onSnapshot(q, async (snapshot) => {
            const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Tweet)).filter(t => !t.replyTo);
            const fetched = await populateAuthors(docs);
            setTweets(fetched.sort((a,b) => b.createdAt - a.createdAt));
            setLoading(false);
          });
        } else if (tab === 'replies') {
          const q = query(collection(db, 'tweets'), where('authorUid', '==', uid), limit(100));
          return onSnapshot(q, async (snapshot) => {
            const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Tweet)).filter(t => t.replyTo);
            const fetched = await populateAuthors(docs);
            setTweets(fetched.sort((a,b) => b.createdAt - a.createdAt));
            setLoading(false);
          });
        } else {
          // likes, saves, reposts
          const q = query(collection(db, tab), where('uid', '==', uid), limit(100));
          return onSnapshot(q, async (snapshot) => {
            const tweetIds = snapshot.docs.map(d => d.data().tweetId);
            if (tweetIds.length === 0) {
              setTweets([]);
              setLoading(false);
              return;
            }
            // fetch each tweet
            const tweetPromises = tweetIds.map(id => getDoc(doc(db, 'tweets', id)));
            const tweetDocs = await Promise.all(tweetPromises);
            const docs = tweetDocs.filter(d => d.exists()).map(d => ({ id: d.id, ...d.data() } as Tweet));
            const fetched = await populateAuthors(docs);
            setTweets(fetched.sort((a,b) => b.createdAt - a.createdAt));
            setLoading(false);
          });
        }
      } else {
        // Home feed
        const q = query(collection(db, 'tweets'), limit(100));
        return onSnapshot(q, async (snapshot) => {
          const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Tweet)).filter(t => !t.replyTo);
          const fetched = await populateAuthors(docs);
          setTweets(fetched.sort((a,b) => b.createdAt - a.createdAt));
          setLoading(false);
        });
      }
    };

    let unsub: any;
    fetchTweets().then(u => { unsub = u; });
    return () => {
      if (unsub) unsub();
    };
  }, [handle, tab]);

  const addTweet = async (content: string, mediaUrl?: string, mediaType?: 'image' | 'video' | 'audio', stickerUrl?: string) => {
    if (!currentUser) throw new Error('Must be logged in');
    await addDoc(collection(db, 'tweets'), {
      authorUid: currentUser.uid,
      content,
      mediaUrl: mediaUrl || null,
      mediaType: mediaType || null,
      stickerUrl: stickerUrl || null,
      createdAt: Date.now(),
      likesCount: 0,
      repostsCount: 0,
      repliesCount: 0,
    });
  };

  const deleteTweet = async (tweetId: string) => {
    if (!currentUser) return;
    await deleteDoc(doc(db, 'tweets', tweetId));
  };

  const addReply = async (tweetId: string, content: string, mediaUrl?: string, mediaType?: 'image' | 'video' | 'audio', stickerUrl?: string) => {
    if (!currentUser) throw new Error('Must be logged in');
    await addDoc(collection(db, 'tweets'), {
      authorUid: currentUser.uid,
      content,
      mediaUrl: mediaUrl || null,
      mediaType: mediaType || null,
      stickerUrl: stickerUrl || null,
      createdAt: Date.now(),
      likesCount: 0,
      repostsCount: 0,
      repliesCount: 0,
      replyTo: tweetId
    });
    
    // We increment the replies count on the parent tweet
    await updateDoc(doc(db, 'tweets', tweetId), {
      repliesCount: increment(1)
    });
  };

  return { tweets, loading, addTweet, deleteTweet, addReply };
}

export function useReplies(tweetId: string) {
  const [replies, setReplies] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tweetId) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const populateAuthors = async (docs: Tweet[]) => {
      return Promise.all(docs.map(async (data) => {
        const authorDoc = await getDoc(doc(db, 'users', data.authorUid));
        return {
          ...data,
          author: authorDoc.exists() ? authorDoc.data() as UserProfile : undefined
        };
      }));
    };

    const q = query(collection(db, 'tweets'), where('replyTo', '==', tweetId), limit(50));
    const unsub = onSnapshot(q, async (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Tweet));
      const fetched = await populateAuthors(docs);
      setReplies(fetched.sort((a,b) => a.createdAt - b.createdAt)); // Sort oldest first for replies usually
      setLoading(false);
    });

    return () => unsub();
  }, [tweetId]);

  return { replies, loading };
}

