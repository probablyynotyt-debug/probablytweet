const fs = require('fs');
let content = fs.readFileSync('src/components/TweetComposer.tsx', 'utf8');

content = content.replace(
  "import { Send, Hash } from 'lucide-react';",
  "import { Send, Hash, Image, Video, FileAudio, SmilePlus, X, Loader2 } from 'lucide-react';\nimport { uploadToCloudinary } from '../lib/cloudinary';\nimport { StickerPicker } from './StickerPicker';"
);

content = content.replace(
  "  onPostTweet: (content: string, tag?: string) => void;",
  "  onPostTweet: (content: string, mediaUrl?: string, mediaType?: 'image' | 'video' | 'audio', stickerUrl?: string) => void;"
);

content = content.replace(
  "  const maxChars = 280;",
  `  const maxChars = 280;
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'audio' | null>(null);
  const [stickerUrl, setStickerUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);`
);

content = content.replace(
  "  const handleSubmit = (e?: React.FormEvent) => {\n    if (e) e.preventDefault();\n    if (!content.trim()) return;\n    onPostTweet(content.trim(), selectedTag ? selectedTag.replace('#', '') : undefined);\n    setContent('');\n    setSelectedTag('');\n    if (onClose) onClose();\n  };",
  `  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim() && !mediaFile && !stickerUrl) return;
    
    setIsUploading(true);
    let uploadedMediaUrl = undefined;
    if (mediaFile && mediaType) {
      try {
        uploadedMediaUrl = await uploadToCloudinary(mediaFile, mediaType);
      } catch (err) {
        console.error(err);
        alert('Failed to upload media');
        setIsUploading(false);
        return;
      }
    }

    onPostTweet(content.trim() || ' ', uploadedMediaUrl, mediaType || undefined, stickerUrl || undefined);
    
    setContent('');
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    setStickerUrl(null);
    setIsUploading(false);
    if (onClose) onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      setMediaType('image');
      setMediaPreview(URL.createObjectURL(file));
    } else if (file.type.startsWith('video/')) {
      setMediaType('video');
      setMediaPreview(URL.createObjectURL(file));
    } else if (file.type.startsWith('audio/')) {
      setMediaType('audio');
      setMediaPreview(URL.createObjectURL(file));
    } else {
      alert('Unsupported file type');
      return;
    }
    setMediaFile(file);
    setStickerUrl(null); // Cannot have both media and sticker for simplicity
  };

  const clearMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
`
);

content = content.replace(
  "disabled={!content.trim() || isOver}",
  "disabled={(!content.trim() && !mediaFile && !stickerUrl) || isOver || isUploading}"
);

content = content.replace(
  "<span>Tweet</span>",
  "{isUploading ? <span>Posting...</span> : <span>Tweet</span>}"
);

const mediaPreviewSection = `
          {mediaPreview && (
            <div className="mt-3 relative inline-block max-w-full rounded-2xl overflow-hidden border border-zinc-800 bg-[#1c1c24]">
              {mediaType === 'image' && <img src={mediaPreview} alt="Preview" className="max-h-64 object-contain" />}
              {mediaType === 'video' && <video src={mediaPreview} controls className="max-h-64 object-contain" />}
              {mediaType === 'audio' && <audio src={mediaPreview} controls className="mt-2" />}
              <button onClick={clearMedia} className="absolute top-2 right-2 bg-black/70 p-1.5 rounded-full hover:bg-black transition-colors text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          {stickerUrl && (
            <div className="mt-3 relative inline-block">
              <img src={stickerUrl} alt="Sticker" className="w-24 h-24 object-contain drop-shadow-md" />
              <button onClick={() => setStickerUrl(null)} className="absolute -top-2 -right-2 bg-zinc-800 p-1 rounded-full hover:bg-zinc-700 transition-colors text-white border border-zinc-700">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
`;

content = content.replace(
  "<textarea",
  mediaPreviewSection + "\n          <textarea"
);

const oldControls = `<div className="flex items-center gap-2">
              <span
                className={\`text-xs font-mono \${
                  isOver
                    ? 'text-red-400 font-bold'
                    : remaining <= 20
                    ? 'text-amber-400'
                    : 'text-zinc-500'
                }\`}
              >
                {remaining}
              </span>
              <span className="hidden sm:inline text-[11px] text-zinc-600">
                (Cmd+Enter to send)
              </span>
            </div>`;

const newControls = `<div className="flex items-center gap-2 text-zinc-500">
              <input type="file" accept="image/*,video/*,audio/*" hidden ref={fileInputRef} onChange={handleFileChange} />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-zinc-800 rounded-full transition-colors hover:text-[#6364ff]" title="Media">
                <Image className="w-4 h-4" />
              </button>
              <div className="relative">
                <button type="button" onClick={() => setShowStickerPicker(!showStickerPicker)} className="p-2 hover:bg-zinc-800 rounded-full transition-colors hover:text-[#6364ff]" title="Stickers">
                  <SmilePlus className="w-4 h-4" />
                </button>
                {showStickerPicker && (
                  <StickerPicker 
                    onClose={() => setShowStickerPicker(false)} 
                    onSelectSticker={(url) => { setStickerUrl(url); clearMedia(); }} 
                  />
                )}
              </div>
              <span
                className={\`ml-2 text-xs font-mono \${
                  isOver
                    ? 'text-red-400 font-bold'
                    : remaining <= 20
                    ? 'text-amber-400'
                    : 'text-zinc-500'
                }\`}
              >
                {remaining}
              </span>
            </div>`;

content = content.replace(oldControls, newControls);

fs.writeFileSync('src/components/TweetComposer.tsx', content);
