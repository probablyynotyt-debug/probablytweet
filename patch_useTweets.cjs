const fs = require('fs');
let content = fs.readFileSync('src/hooks/useTweets.ts', 'utf8');

content = content.replace(
  "const addTweet = async (content: string) => {",
  "const addTweet = async (content: string, mediaUrl?: string, mediaType?: 'image' | 'video' | 'audio', stickerUrl?: string) => {"
);
content = content.replace(
  "      authorUid: currentUser.uid,\n      content,",
  "      authorUid: currentUser.uid,\n      content,\n      mediaUrl: mediaUrl || null,\n      mediaType: mediaType || null,\n      stickerUrl: stickerUrl || null,"
);

content = content.replace(
  "const addReply = async (tweetId: string, content: string) => {",
  "const addReply = async (tweetId: string, content: string, mediaUrl?: string, mediaType?: 'image' | 'video' | 'audio', stickerUrl?: string) => {"
);
content = content.replace(
  "      authorUid: currentUser.uid,\n      content,\n      createdAt: Date.now(),",
  "      authorUid: currentUser.uid,\n      content,\n      mediaUrl: mediaUrl || null,\n      mediaType: mediaType || null,\n      stickerUrl: stickerUrl || null,\n      createdAt: Date.now(),"
);

fs.writeFileSync('src/hooks/useTweets.ts', content);
