const fs = require('fs');
let content = fs.readFileSync('src/components/TweetCard.tsx', 'utf8');

content = content.replace(
  "import React, { useState } from 'react';",
  "import React, { useState } from 'react';\nimport ReactMarkdown from 'react-markdown';\nimport remarkGfm from 'remark-gfm';\nimport { parseHashtags } from '../lib/markdown';"
);

// We need to change the reply form and the AddReply prop to support media
content = content.replace(
  "  onAddReply?: (id: string, content: string) => void;",
  "  onAddReply?: (id: string, content: string, mediaUrl?: string, mediaType?: 'image' | 'video' | 'audio', stickerUrl?: string) => void;"
);

// We should also probably import the StickerPicker or something here eventually, but for now just pass standard text for reply text.

const oldMainBody = `<div className="mt-2 text-zinc-200 text-sm sm:text-base leading-relaxed break-words whitespace-pre-wrap">
            {tweet.content}
          </div>`;

const newMainBody = `<div className="mt-2 text-zinc-200 text-sm sm:text-base leading-relaxed break-words whitespace-pre-wrap markdown-body">
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
          )}`;

content = content.replace(oldMainBody, newMainBody);

// add BadgeCheck logic to whydkitten
content = content.replace(
  "author?.handle?.toLowerCase() === 'probablynot' && (",
  "(author?.handle?.toLowerCase() === 'probablynot' || author?.handle?.toLowerCase() === 'whydkitten') && ("
);

fs.writeFileSync('src/components/TweetCard.tsx', content);
