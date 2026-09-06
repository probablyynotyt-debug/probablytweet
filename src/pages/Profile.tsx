import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LeftSidebar } from '../components/LeftSidebar';
import { RightSidebar } from '../components/RightSidebar';
import { TweetCard } from '../components/TweetCard';
import { ImageUpdateModal } from '../components/ImageUpdateModal';
import { useTweets, TabType } from '../hooks/useTweets';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { UserProfile } from '../types';
import { ArrowLeft, Calendar, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';

export const Profile = () => {
  const { handle } = useParams<{ handle: string }>();
  const { currentUser, userProfile: myProfile, refreshProfile } = useAuth();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  
  const [imageModal, setImageModal] = useState<{isOpen: boolean, field: 'photoURL' | 'bannerURL'}>({ isOpen: false, field: 'photoURL' });
  
  // Actually handle here is the string from URL
  const { tweets, loading: loadingTweets, deleteTweet, addReply } = useTweets(handle, activeTab);
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  
  useEffect(() => {
    const fetchProfile = async () => {
      setLoadingProfile(true);
      if (!handle) return;
      
      try {
        const handleDoc = await getDoc(doc(db, 'handles', handle.toLowerCase()));
        if (handleDoc.exists()) {
          const uid = handleDoc.data().uid;
          const userDoc = await getDoc(doc(db, 'users', uid));
          if (userDoc.exists()) {
            setProfile(userDoc.data() as UserProfile);
            
            // Check following status
            if (currentUser && currentUser.uid !== uid) {
              const followRef = doc(db, 'follows', `${currentUser.uid}_${uid}`);
              const followDoc = await getDoc(followRef);
              setIsFollowing(followDoc.exists());
            }
            
            // Just simple counts (could use aggregations in prod)
            const followersQ = query(collection(db, 'follows'), where('followingUid', '==', uid));
            const followingQ = query(collection(db, 'follows'), where('followerUid', '==', uid));
            const [followersSnap, followingSnap] = await Promise.all([getDocs(followersQ), getDocs(followingQ)]);
            setFollowersCount(followersSnap.size);
            setFollowingCount(followingSnap.size);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, [handle, currentUser]);

  const isMyProfile = currentUser?.uid === profile?.uid;

  const toggleFollow = async () => {
    if (!currentUser || !profile) return;
    const ref = doc(db, 'follows', `${currentUser.uid}_${profile.uid}`);
    if (isFollowing) {
      await deleteDoc(ref);
      setIsFollowing(false);
      setFollowersCount(Math.max(0, followersCount - 1));
    } else {
      await setDoc(ref, {
        followerUid: currentUser.uid,
        followingUid: profile.uid,
        createdAt: Date.now()
      });
      setIsFollowing(true);
      setFollowersCount(followersCount + 1);
    }
  };

  const handleUpdateImageClick = (field: 'photoURL' | 'bannerURL') => {
    if (!isMyProfile || !profile) return;
    setImageModal({ isOpen: true, field });
  };

  const handleUpdateImageSubmit = async (file: File) => {
    if (!isMyProfile || !profile) return;
    try {
      // Use the provided credentials as fallbacks
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'oc8buhae';
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'probablytweet';

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || 'Upload failed');
      }

      const url = data.secure_url;

      await updateDoc(doc(db, 'users', profile.uid), { [imageModal.field]: url });
      setProfile({ ...profile, [imageModal.field]: url });
      refreshProfile();
      setImageModal({ ...imageModal, isOpen: false });
    } catch (err: any) {
      console.error("Upload failed", err);
      alert("Upload failed: " + err.message);
    }
  };

  return (
    <div className="flex justify-center w-full">
      <div className="flex w-full max-w-[1280px]">
        {/* Left Column */}
        <div className="hidden lg:block w-[280px] xl:w-[320px] shrink-0">
          <LeftSidebar />
        </div>

        {/* Center Column */}
        <main className="flex-1 min-w-0 border-x border-zinc-800/80 min-h-screen bg-[#121216] max-w-[600px] w-full">
          {loadingProfile ? (
            <div className="p-8 text-center text-zinc-500">Loading profile...</div>
          ) : !profile ? (
            <div className="p-8 text-center text-zinc-300">Profile not found</div>
          ) : (
            <>
              {/* Header */}
              <div className="sticky top-0 z-10 bg-[#121216]/90 backdrop-blur-md border-b border-zinc-800/80 px-4 py-2 flex items-center gap-6">
                <Link to="/" className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-200">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                  <h1 className="font-bold text-lg text-zinc-100 leading-tight">{profile.displayName}</h1>
                  <p className="text-xs text-zinc-500">{tweets.length} posts</p>
                </div>
              </div>

              {/* Banner */}
              <div 
                className={`h-40 sm:h-48 w-full bg-zinc-800 relative group ${isMyProfile ? 'cursor-pointer' : ''}`}
                onClick={() => handleUpdateImageClick('bannerURL')}
              >
                {profile.bannerURL && (
                  <img src={profile.bannerURL} alt="Banner" className="w-full h-full object-cover" />
                )}
                {isMyProfile && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <ImageIcon className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="px-4 pb-4">
                <div className="flex justify-between items-start relative">
                  {/* Avatar */}
                  <div 
                    className={`-mt-16 z-10 w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-[#121216] bg-zinc-700 overflow-hidden relative group ${isMyProfile ? 'cursor-pointer' : ''}`}
                    onClick={() => handleUpdateImageClick('photoURL')}
                  >
                    {profile.photoURL ? (
                      <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl text-white font-bold">
                        {profile.displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {isMyProfile && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <ImageIcon className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-3">
                    {isMyProfile ? (
                      <button className="border border-zinc-600 text-white font-bold py-1.5 px-4 rounded-full text-sm hover:bg-zinc-800 transition-colors">
                        Edit profile
                      </button>
                    ) : (
                      <button 
                        onClick={toggleFollow}
                        className={`font-bold py-1.5 px-5 rounded-full text-sm transition-colors ${
                          isFollowing 
                            ? 'border border-zinc-600 text-white hover:bg-red-500/10 hover:text-red-500 hover:border-red-500' 
                            : 'bg-white text-black hover:bg-zinc-200'
                        }`}
                      >
                        {isFollowing ? 'Following' : 'Follow'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-3">
                  <h2 className="font-bold text-xl text-zinc-100">{profile.displayName}</h2>
                  <p className="text-sm text-zinc-500">@{profile.handle} · {profile.pronouns === 'custom' ? profile.customPronouns : profile.pronouns}</p>
                </div>

                <div className="mt-3 flex items-center gap-4 text-sm text-zinc-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {format(profile.createdAt, 'MMMM yyyy')}</span>
                  </div>
                </div>

                <div className="mt-3 flex gap-4 text-sm">
                  <div className="flex gap-1 hover:underline cursor-pointer">
                    <span className="font-bold text-white">{followingCount}</span>
                    <span className="text-zinc-500">Following</span>
                  </div>
                  <div className="flex gap-1 hover:underline cursor-pointer">
                    <span className="font-bold text-white">{followersCount}</span>
                    <span className="text-zinc-500">Followers</span>
                  </div>
                </div>
              </div>

              {/* Feed Tabs */}
              <div className="flex items-center px-4 pt-1 border-b border-zinc-800/80 bg-[#121216] overflow-x-auto hide-scrollbar">
                <button onClick={() => setActiveTab('posts')} className={`px-4 py-3 text-sm font-semibold whitespace-nowrap ${activeTab === 'posts' ? 'text-zinc-200 border-b-2 border-[#6364ff]' : 'text-zinc-500 hover:text-zinc-300'}`}>Posts</button>
                <button onClick={() => setActiveTab('replies')} className={`px-4 py-3 text-sm font-semibold whitespace-nowrap ${activeTab === 'replies' ? 'text-zinc-200 border-b-2 border-[#6364ff]' : 'text-zinc-500 hover:text-zinc-300'}`}>Replies</button>
                <button onClick={() => setActiveTab('reposts')} className={`px-4 py-3 text-sm font-semibold whitespace-nowrap ${activeTab === 'reposts' ? 'text-zinc-200 border-b-2 border-[#6364ff]' : 'text-zinc-500 hover:text-zinc-300'}`}>Reposts</button>
                <button onClick={() => setActiveTab('likes')} className={`px-4 py-3 text-sm font-semibold whitespace-nowrap ${activeTab === 'likes' ? 'text-zinc-200 border-b-2 border-[#6364ff]' : 'text-zinc-500 hover:text-zinc-300'}`}>Likes</button>
                <button onClick={() => setActiveTab('saves')} className={`px-4 py-3 text-sm font-semibold whitespace-nowrap ${activeTab === 'saves' ? 'text-zinc-200 border-b-2 border-[#6364ff]' : 'text-zinc-500 hover:text-zinc-300'}`}>Saves</button>
              </div>

              {/* Tweets */}
              <div className="flex flex-col pb-20">
                {loadingTweets ? (
                  <div className="p-8 text-center text-zinc-500 text-sm">Loading {activeTab}...</div>
                ) : tweets.length > 0 ? (
                  tweets.map((tweet) => (
                    <TweetCard
                      key={tweet.id}
                      tweet={tweet}
                      onAddReply={addReply}
                      onDelete={deleteTweet}
                    />
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <h4 className="text-zinc-300 font-bold text-3xl mb-2">
                      @{profile.handle} hasn't posted
                    </h4>
                    <p className="text-zinc-500">
                      When they do, their {activeTab} will show up here.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </main>

        {/* Right Column */}
        <div className="hidden lg:block w-[320px] shrink-0">
          <RightSidebar />
        </div>
      </div>
      
      <ImageUpdateModal 
        isOpen={imageModal.isOpen} 
        onClose={() => setImageModal({...imageModal, isOpen: false})} 
        onSubmit={handleUpdateImageSubmit} 
        field={imageModal.field} 
      />
    </div>
  );
};
