#!/bin/bash
cat << 'INNER_EOF' > /tmp/profile_state.txt
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTweets } from '../hooks/useTweets';
import { TweetCard } from '../components/TweetCard';
import { LeftSidebar } from '../components/LeftSidebar';
import { RightSidebar } from '../components/RightSidebar';
import { doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ImageUpdateModal } from '../components/ImageUpdateModal';
import { ArrowLeft, Calendar, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { UserProfile } from '../types';

import { EditProfileModal } from '../components/EditProfileModal';
import { CustomizeProfileModal } from '../components/CustomizeProfileModal';
import { BioRenderer } from '../components/BioRenderer';
import { getUsernameStyle, getProfileBorderStyle, getProfileEffectClass } from '../lib/customization';

type TabType = 'posts' | 'replies' | 'reposts' | 'likes' | 'saves';

export const Profile = () => {
  const { handle } = useParams<{ handle: string }>();
  const { currentUser, userProfile: myProfile, refreshProfile } = useAuth();
  
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  
  const [imageModal, setImageModal] = useState<{isOpen: boolean, field: 'photoURL' | 'bannerURL'}>({ isOpen: false, field: 'photoURL' });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [customizeModalOpen, setCustomizeModalOpen] = useState(false);
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  
  // Actually handle here is the string from URL
  const { tweets, loading: loadingTweets, deleteTweet, addReply } = useTweets(handle, activeTab);
  const { tweets: myTweets } = useTweets(handle);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoadingProfile(true);
      if (!handle) return;
      try {
        const handleDoc = await getDoc(doc(db, 'handles', handle.toLowerCase()));
        if (!handleDoc.exists()) {
          setProfile(null);
          setLoadingProfile(false);
          return;
        }
        
        const uid = handleDoc.data().uid;
        const userDoc = await getDoc(doc(db, 'users', uid));
        
        if (userDoc.exists()) {
          const profileData = userDoc.data() as UserProfile;
          if (currentUser) {
            const followDoc = await getDoc(doc(db, 'follows', `${currentUser.uid}_${uid}`));
            profileData.isFollowing = followDoc.exists();
          }
          setProfile(profileData);
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoadingProfile(false);
      }
    };
    
    fetchProfile();
  }, [handle, currentUser]);

  const handleUpdateImageClick = (field: 'photoURL' | 'bannerURL') => {
    if (currentUser?.uid !== profile?.uid) return;
    setImageModal({ isOpen: true, field });
  };

  const handleUpdateImageSubmit = async (url: string, field: 'photoURL' | 'bannerURL') => {
    if (!profile) return;
    try {
      const userRef = doc(db, 'users', profile.uid);
      await setDoc(userRef, { [field]: url }, { merge: true });
      if (myProfile && profile.uid === myProfile.uid) {
         await refreshProfile();
      }
      setProfile(prev => prev ? { ...prev, [field]: url } : null);
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
    }
  };

  const isMyProfile = currentUser?.uid === profile?.uid;

  const toggleFollow = async () => {
    if (!currentUser || !profile) return;
    const ref = doc(db, 'follows', `${currentUser.uid}_${profile.uid}`);
    if (profile.isFollowing) {
      await deleteDoc(ref);
      setProfile(prev => prev ? { ...prev, isFollowing: false, followersCount: Math.max(0, (prev.followersCount || 0) - 1) } : null);
    } else {
      await setDoc(ref, {
        followerId: currentUser.uid,
        followingId: profile.uid,
        createdAt: Date.now()
      });
      setProfile(prev => prev ? { ...prev, isFollowing: true, followersCount: (prev.followersCount || 0) + 1 } : null);
    }
  };
  
  const customBorderStyles = getProfileBorderStyle(profile?.customization);
  const hasCustomBorder = Object.keys(customBorderStyles).length > 0;
  const borderClasses = hasCustomBorder ? '' : 'border-x border-zinc-800/80';
  const effectClasses = getProfileEffectClass(profile?.customization);

  return (
    <div className="flex justify-center w-full">
      <div className="flex w-full max-w-[1280px] min-h-screen">
        <LeftSidebar />

        {/* Center Column */}
        <main 
          className={`flex-1 min-w-0 ${borderClasses} min-h-screen bg-[#121216] max-w-[600px] w-full pb-20 lg:pb-0 ${effectClasses}`}
          style={customBorderStyles}
        >
          {loadingProfile ? (
            <div className="p-8 text-center text-zinc-500">Loading profile...</div>
          ) : !profile ? (
            <div className="p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Profile not found</h2>
              <p className="text-zinc-500">The account you are looking for doesn't exist.</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="sticky top-0 z-50 bg-[#121216]/80 backdrop-blur-md border-b border-zinc-800/80 px-4 py-2 flex items-center gap-6">
                <Link to="/" className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
                  <ArrowLeft className="w-5 h-5 text-white" />
                </Link>
                <div>
                  <h1 className="font-bold text-xl text-zinc-100" style={getUsernameStyle(profile?.customization)}>{profile.displayName}</h1>
                  <p className="text-xs text-zinc-500">{myTweets.length} posts</p>
                </div>
              </div>

              {/* Banner */}
              <div 
                className={`h-32 sm:h-48 w-full bg-zinc-800 relative group ${isMyProfile ? 'cursor-pointer' : ''}`}
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

              <div className="px-4 pb-4">
                <div className="flex justify-between items-start relative">
                  {/* Avatar */}
                  <div className="relative -mt-16 z-10">
                     <div 
                        className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-[#121216] bg-zinc-700 overflow-hidden relative group ${isMyProfile ? 'cursor-pointer' : ''}`}
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
                  </div>

                  {/* Actions */}
                  <div className="mt-3">
                    {isMyProfile ? (
                      <button 
                        onClick={() => setEditModalOpen(true)}
                        className="border border-zinc-600 text-white font-bold py-1.5 px-4 rounded-full text-sm hover:bg-zinc-800 transition-colors"
                      >
                        Edit profile
                      </button>
                    ) : (
                      <button 
                        onClick={toggleFollow}
                        className={`${profile.isFollowing ? 'border border-zinc-600 hover:border-red-500 hover:text-red-500 hover:bg-red-500/10' : 'bg-white text-black hover:bg-zinc-200'} font-bold py-1.5 px-4 rounded-full text-sm transition-colors w-24`}
                      >
                        {profile.isFollowing ? 'Following' : 'Follow'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-3">
                  <h2 className="font-bold text-xl text-zinc-100" style={getUsernameStyle(profile?.customization)}>{profile.displayName}</h2>
                  <p className="text-sm text-zinc-500">@{profile.handle} · {profile.pronouns === 'custom' ? profile.customPronouns : profile.pronouns}</p>
                </div>

                {profile.bio && (
                  <div className="mt-3">
                    <BioRenderer bio={profile.bio} />
                  </div>
                )}

                <div className="mt-3 flex items-center gap-4 text-sm text-zinc-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {format(profile.createdAt, 'MMMM yyyy')}</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-4 text-sm">
                  <div className="hover:underline cursor-pointer">
                    <span className="font-bold text-white">{profile.followingCount || 0}</span> <span className="text-zinc-500">Following</span>
                  </div>
                  <div className="hover:underline cursor-pointer">
                    <span className="font-bold text-white">{profile.followersCount || 0}</span> <span className="text-zinc-500">Followers</span>
                  </div>
                </div>
              </div>

              {/* Feed Tabs */}
              <div className="flex items-center px-4 pt-1 border-b border-zinc-800/80 bg-[#121216]/50 backdrop-blur-sm overflow-x-auto hide-scrollbar">
                <button onClick={() => setActiveTab('posts')} className={`px-4 py-3 text-sm font-semibold whitespace-nowrap ${activeTab === 'posts' ? 'text-zinc-200 border-b-2 border-[#6364ff]' : 'text-zinc-500 hover:text-zinc-300'}`}>Posts</button>
                <button onClick={() => setActiveTab('replies')} className={`px-4 py-3 text-sm font-semibold whitespace-nowrap ${activeTab === 'replies' ? 'text-zinc-200 border-b-2 border-[#6364ff]' : 'text-zinc-500 hover:text-zinc-300'}`}>Replies</button>
                <button onClick={() => setActiveTab('reposts')} className={`px-4 py-3 text-sm font-semibold whitespace-nowrap ${activeTab === 'reposts' ? 'text-zinc-200 border-b-2 border-[#6364ff]' : 'text-zinc-500 hover:text-zinc-300'}`}>Reposts</button>
                <button onClick={() => setActiveTab('likes')} className={`px-4 py-3 text-sm font-semibold whitespace-nowrap ${activeTab === 'likes' ? 'text-zinc-200 border-b-2 border-[#6364ff]' : 'text-zinc-500 hover:text-zinc-300'}`}>Likes</button>
                <button onClick={() => setActiveTab('saves')} className={`px-4 py-3 text-sm font-semibold whitespace-nowrap ${activeTab === 'saves' ? 'text-zinc-200 border-b-2 border-[#6364ff]' : 'text-zinc-500 hover:text-zinc-300'}`}>Saves</button>
              </div>

              {/* Tweets Feed */}
              <div>
                {loadingTweets ? (
                   <div className="p-8 text-center text-zinc-500">Loading posts...</div>
                ) : tweets.length > 0 ? (
                  tweets.map((tweet) => (
                    <TweetCard 
                      key={tweet.id} 
                      tweet={tweet} 
                      onDelete={deleteTweet}
                      onReply={addReply}
                    />
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {isMyProfile ? "You haven't posted yet" : `@${profile.handle} hasn't posted`}
                    </h3>
                    <p className="text-zinc-500">
                      When they do, their posts will show up here.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </main>

        <div className="hidden lg:block w-[350px]">
          <RightSidebar />
        </div>
      </div>

      <ImageUpdateModal 
        isOpen={imageModal.isOpen} 
        onClose={() => setImageModal({ ...imageModal, isOpen: false })} 
        onSubmit={handleUpdateImageSubmit} 
        field={imageModal.field} 
      />
      
      {profile && isMyProfile && (
        <>
          <EditProfileModal
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            profile={profile}
            onProfileUpdate={setProfile}
            onOpenCustomize={() => setCustomizeModalOpen(true)}
          />
          <CustomizeProfileModal
            isOpen={customizeModalOpen}
            onClose={() => setCustomizeModalOpen(false)}
            profile={profile}
            onProfileUpdate={setProfile}
          />
        </>
      )}
    </div>
  );
};
INNER_EOF
cp /tmp/profile_state.txt src/pages/Profile.tsx
