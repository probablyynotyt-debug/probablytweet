const fs = require('fs');
let content = fs.readFileSync('src/components/TweetCard.tsx', 'utf8');

// import TweetComposer
content = content.replace(
  "import { Link } from 'react-router-dom';",
  "import { Link } from 'react-router-dom';\nimport { TweetComposer } from './TweetComposer';"
);

// We don't need replyText anymore if we use Composer, but we'll leave it in case.
const oldForm = `<form onSubmit={submitReply} className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Post your reply"
                    className="flex-1 bg-[#1c1c24] border border-zinc-700/50 rounded-full px-4 py-2 text-sm text-zinc-100 focus:outline-none focus:border-[#6364ff] transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    className="bg-[#6364ff] hover:bg-[#5253d8] disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-full text-sm transition-colors"
                  >
                    Reply
                  </button>
                </form>`;

const newForm = `<div className="mb-4">
                  <TweetComposer 
                    onPostTweet={(content, mediaUrl, mediaType, stickerUrl) => {
                      if (onAddReply) {
                        onAddReply(tweet.id, content, mediaUrl, mediaType, stickerUrl);
                        setShowReplies(true);
                      }
                    }}
                  />
                </div>`;

content = content.replace(oldForm, newForm);

fs.writeFileSync('src/components/TweetCard.tsx', content);
