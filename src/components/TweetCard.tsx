import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { parseHashtags } from '../lib/markdown';
import { Heart, Repeat, MessageSquare, Bookmark, Share2, Trash2, BadgeCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TweetComposer } from './TweetComposer';
import { Tweet } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useInteractions } from '../hooks/useInteractions';
import { useReplies } from '../hooks/useTweets';

interface TweetCardProps {
  tweet: Tweet;
  onAddReply?: (id: string, content: string, mediaUrl?: string, mediaType?: 'image' | 'video' | 'audio', stickerUrl?: string) => void;
  onDelete?: (id: string) => void;
}

export const TweetCard: React.FC<TweetCardProps> = ({
  tweet,
  onAddReply,
  onDelete,
}) => {
  const { currentUser } = useAuth();
  const { isLiked, isBookmarked, isReposted, toggleLike, toggleBookmark, toggleRepost } = useInteractions(tweet.id);
  
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [copied, setCopied] = useState(false);

  const { replies, loading: repliesLoading } = useReplies(showReplies ? tweet.id : '');

  const isMyTweet = currentUser?.uid === tweet.authorUid;

  const handleShare = () => {
    navigator.clipboard?.writeText?.(window.location.origin + '/tweet/' + tweet.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const submitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !onAddReply) return;
    onAddReply(tweet.id, replyText.trim());
    setReplyText('');
    setShowReplies(true);
  };

  const author = tweet.author;

  return (
    <article className="border-b border-zinc-800/80 p-4 sm:p-5 transition-colors hover:bg-[#15151c]">
      <div className="flex items-start gap-3.5">
        {/* User Avatar */}
        <Link to={`/${author?.handle || ''}`} className="shrink-0">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white border border-zinc-700/50 bg-zinc-700 overflow-hidden`}
          >
            {author?.photoURL ? (
              <img src={author.photoURL} alt={author.displayName} className="w-full h-full object-cover" />
            ) : (
              author?.displayName?.charAt(0).toUpperCase() || '?'
            )}
          </div>
        </Link>

        {/* Tweet Content Header */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link to={`/${author?.handle || ''}`} className="font-semibold text-sm text-zinc-100 hover:underline flex items-center gap-1">
                {author?.displayName || 'Unknown'}
                {(author?.handle?.toLowerCase() === 'probablynot' || author?.handle?.toLowerCase() === 'whydkitten') && (
                  <BadgeCheck className="w-4 h-4 text-[#6364ff]" />
                )}
              </Link>
              <span className="text-xs text-zinc-500 font-mono">
                @{author?.handle || 'unknown'}
              </span>
              <span className="text-zinc-600 text-xs">&bull;</span>
              <span className="text-xs text-zinc-500">
                {new Date(tweet.createdAt).toLocaleDateString()}
              </span>
            </div>

            {isMyTweet && onDelete && (
              <button
                onClick={() => onDelete(tweet.id)}
                className="text-zinc-600 hover:text-red-400 p-1 rounded transition-colors"
                title="Delete tweet"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Main Body */}
          <div className="mt-2 text-zinc-200 text-sm sm:text-base leading-relaxed break-words whitespace-pre-wrap markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {parseHashtags(tweet.content || '')}
            </ReactMarkdown>
          </div>
          {tweet.mediaUrl && (
            <div className="mt-3 rounded-2xl overflow-hidden border border-zinc-800 bg-[#1c1c24]">
              {tweet.mediaType === 'image' && (
                <img src={tweet.mediaUrl} alt="Media" className="w-full h-auto max-h-[500px] object-cover" />
              )}
              {tweet.mediaType === 'video' && (
                <video src={tweet.mediaUrl} controls className="w-full max-h-[500px] object-cover" />
              )}
              {tweet.mediaType === 'audio' && (
                <audio src={tweet.mediaUrl} controls className="w-full mt-2" />
              )}
            </div>
          )}
          {tweet.stickerUrl && (
            <div className="mt-2">
              <img src={tweet.stickerUrl} alt="Sticker" className="w-24 h-24 object-contain drop-shadow-md" />
            </div>
          )}

          {/* Interaction Bar */}
          <div className="mt-4 flex items-center justify-between text-zinc-400 max-w-md">
            {/* Reply Button */}
            <button
              onClick={() => setShowReplies(!showReplies)}
              className={`flex items-center gap-1.5 text-xs transition-colors hover:text-zinc-200 ${
                showReplies ? 'text-zinc-200' : ''
              }`}
              title="Replies"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{tweet.repliesCount || 0}</span>
            </button>

            {/* Repost Button */}
            <button
              onClick={toggleRepost}
              className={`flex items-center gap-1.5 text-xs transition-colors ${
                isReposted ? 'text-emerald-400 font-medium' : 'hover:text-zinc-200'
              }`}
              title="Repost"
            >
              <Repeat className="w-4 h-4" />
              <span>{tweet.repostsCount || 0}</span>
            </button>

            {/* Like Button */}
            <button
              onClick={toggleLike}
              className={`flex items-center gap-1.5 text-xs transition-colors ${
                isLiked ? 'text-rose-500 font-medium' : 'hover:text-zinc-200'
              }`}
              title="Like"
            >
              <Heart
                className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`}
              />
              <span>{tweet.likesCount || 0}</span>
            </button>

            {/* Bookmark Button */}
            <button
              onClick={toggleBookmark}
              className={`flex items-center gap-1.5 text-xs transition-colors ${
                isBookmarked ? 'text-amber-400' : 'hover:text-zinc-200'
              }`}
              title="Save"
            >
              <Bookmark
                className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`}
              />
            </button>
          </div>
          
          {/* Reply Section */}
          {showReplies && (
            <div className="mt-4 pt-3 border-t border-zinc-800/50">
              {currentUser ? (
                <div className="mb-4">
                  <TweetComposer 
                    onPostTweet={(content, mediaUrl, mediaType, stickerUrl) => {
                      if (onAddReply) {
                        onAddReply(tweet.id, content, mediaUrl, mediaType, stickerUrl);
                        setShowReplies(true);
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="text-xs text-zinc-500 mb-4 bg-[#1c1c24] p-3 rounded-lg border border-zinc-800">
                  Sign in to reply to this post.
                </div>
              )}

              {/* Replies List */}
              <div className="space-y-3 pl-2 sm:pl-4 border-l-2 border-zinc-800/50">
                {repliesLoading ? (
                  <div className="text-xs text-zinc-500">Loading replies...</div>
                ) : replies.length > 0 ? (
                  replies.map((reply) => (
                    <TweetCard 
                      key={reply.id} 
                      tweet={reply} 
                      onAddReply={onAddReply} 
                      onDelete={onDelete} 
                    />
                  ))
                ) : (
                  <div className="text-xs text-zinc-500">No replies yet.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

