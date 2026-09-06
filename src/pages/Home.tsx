import React from 'react';
import { LeftSidebar } from '../components/LeftSidebar';
import { TweetComposer } from '../components/TweetComposer';
import { TweetCard } from '../components/TweetCard';
import { RightSidebar } from '../components/RightSidebar';
import { MessageCircle } from 'lucide-react';
import { useTweets } from '../hooks/useTweets';
import { useAuth } from '../contexts/AuthContext';

export const Home = () => {
  const { tweets, loading, addTweet, deleteTweet, addReply } = useTweets();
  const { currentUser, openAuthModal } = useAuth();

  return (
    <div className="flex justify-center w-full">
      <div className="flex w-full max-w-[1280px]">
        {/* Left Column (Instance Info / Search) */}
        <div className="hidden lg:block w-[280px] xl:w-[320px] shrink-0">
          <LeftSidebar />
        </div>

        {/* Center Column (Feed) */}
        <main className="flex-1 min-w-0 border-x border-zinc-800/80 min-h-screen bg-[#121216] max-w-[600px] w-full">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-[#121216]/90 backdrop-blur-md border-b border-zinc-800/80 px-4 py-3 flex items-center justify-between">
             <div className="font-bold text-lg text-zinc-100">Home</div>
             <div className="lg:hidden font-bold text-zinc-100 tracking-tight">Probably Tweet</div>
          </div>

          {/* Composer */}
          <div className="border-b border-zinc-800/80 bg-[#121216]">
             {currentUser ? (
               <TweetComposer onPostTweet={addTweet} />
             ) : (
               <div className="p-6 text-center">
                 <h2 className="text-zinc-200 font-bold text-lg mb-2">Join the conversation</h2>
                 <p className="text-zinc-400 text-sm mb-4">You need an account to post, reply, and like.</p>
                 <button onClick={() => openAuthModal('signup')} className="bg-[#6364ff] hover:bg-[#5253d8] text-white font-semibold py-2 px-6 rounded-full transition-colors text-sm">
                   Create account
                 </button>
               </div>
             )}
          </div>

          {/* Feed Tabs */}
          <div className="flex items-center px-4 pt-1 border-b border-zinc-800/80 bg-[#121216] overflow-x-auto hide-scrollbar">
            <button className="px-4 py-3 text-sm font-semibold text-zinc-200 border-b-2 border-[#6364ff] whitespace-nowrap">Posts</button>
            <button className="px-4 py-3 text-sm font-medium text-zinc-500 hover:text-zinc-300 whitespace-nowrap">Posts and replies</button>
            <button className="px-4 py-3 text-sm font-medium text-zinc-500 hover:text-zinc-300 whitespace-nowrap">Media</button>
          </div>

          {/* Tweets */}
          <div className="flex flex-col pb-20">
            {loading ? (
              <div className="p-8 text-center text-zinc-500 text-sm">Loading tweets...</div>
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
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <h4 className="text-zinc-300 font-semibold text-sm">
                  No posts to show
                </h4>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  It's quiet here. Post something to get started!
                </p>
              </div>
            )}
          </div>
        </main>

        {/* Right Column (Trending / Auth) */}
        <div className="hidden lg:block w-[320px] shrink-0">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
};
