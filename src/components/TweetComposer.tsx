import React, { useState } from 'react';
import { Send, Hash } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface TweetComposerProps {
  onPostTweet: (content: string, tag?: string) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const TweetComposer: React.FC<TweetComposerProps> = ({
  onPostTweet,
  onClose,
  isModal = false,
}) => {
  const [content, setContent] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const { userProfile } = useAuth();
  const maxChars = 280;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim()) return;
    onPostTweet(content.trim(), selectedTag ? selectedTag.replace('#', '') : undefined);
    setContent('');
    setSelectedTag('');
    if (onClose) onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit();
    }
  };

  const remaining = maxChars - content.length;
  const isOver = remaining < 0;

  return (
    <div
      className={`p-4 sm:p-5 transition-all ${
        isModal ? 'shadow-2xl bg-[#1c1c24] rounded-2xl border border-zinc-800' : ''
      }`}
    >
      <div className="flex gap-3.5">
        {/* User Avatar */}
        <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700/60 flex items-center justify-center shrink-0 font-semibold text-zinc-300 text-sm overflow-hidden">
          {userProfile?.photoURL ? (
            <img src={userProfile.photoURL} alt="PFP" className="w-full h-full object-cover" />
          ) : (
            userProfile?.displayName?.charAt(0).toUpperCase() || 'You'
          )}
        </div>

        {/* Form Body */}
        <div className="flex-1 min-w-0">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            placeholder="Tweet whatever you want..."
            className="w-full bg-transparent text-zinc-100 placeholder-zinc-500 resize-none border-none outline-none text-base leading-relaxed mt-2"
            autoFocus={isModal}
          />

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-800/80">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-mono ${
                  isOver
                    ? 'text-red-400 font-bold'
                    : remaining <= 20
                    ? 'text-amber-400'
                    : 'text-zinc-500'
                }`}
              >
                {remaining}
              </span>
              <span className="hidden sm:inline text-[11px] text-zinc-600">
                (Cmd+Enter to send)
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isModal && onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              )}

              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={!content.trim() || isOver}
                className="inline-flex items-center gap-2 bg-[#6364ff] hover:bg-[#5253d8] text-white font-semibold text-xs sm:text-sm px-4 py-1.5 rounded-full transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>Tweet</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

