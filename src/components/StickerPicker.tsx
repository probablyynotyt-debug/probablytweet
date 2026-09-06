import React, { useState, useEffect, useRef } from 'react';
import { Upload, X, Loader2, SmilePlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { uploadToCloudinary } from '../lib/cloudinary';

interface Sticker {
  id: string;
  uid: string;
  url: string;
  createdAt: number;
}

interface StickerPickerProps {
  onSelectSticker: (url: string) => void;
  onClose: () => void;
}

export const StickerPicker: React.FC<StickerPickerProps> = ({ onSelectSticker, onClose }) => {
  const { currentUser } = useAuth();
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchStickers = async () => {
      if (!currentUser) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.stickers) {
            // Sort by createdAt descending
            const sortedStickers = [...data.stickers].sort((a, b) => b.createdAt - a.createdAt);
            setStickers(sortedStickers);
          }
        }
      } catch (e) {
        console.error('Error fetching stickers:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchStickers();
  }, []);

  const handleUploadSticker = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    setUploading(true);
    try {
      const url = await uploadToCloudinary(file, 'image');
      const newSticker = {
        id: Date.now().toString(),
        uid: currentUser.uid,
        url,
        createdAt: Date.now()
      };
      await updateDoc(doc(db, 'users', currentUser.uid), {
        stickers: arrayUnion(newSticker)
      });
      setStickers(prev => [newSticker, ...prev]);
    } catch (e) {
      console.error(e);
      alert('Failed to upload sticker');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="absolute top-full left-0 mt-2 w-72 bg-[#1c1d26] border border-zinc-800 rounded-xl shadow-2xl p-3 z-50">
      <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-2">
        <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-1"><SmilePlus className="w-4 h-4"/> Stickers</h3>
        <button onClick={onClose} className="text-zinc-500 hover:text-white"><X className="w-4 h-4" /></button>
      </div>
      
      <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto hide-scrollbar mb-3">
        {loading ? (
          <div className="col-span-4 text-center py-4 text-zinc-500 text-xs">Loading stickers...</div>
        ) : stickers.length > 0 ? (
          stickers.map(sticker => (
            <button 
              key={sticker.id}
              onClick={() => {
                onSelectSticker(sticker.url);
                onClose();
              }}
              className="aspect-square rounded-lg hover:bg-zinc-800/50 p-1 transition-colors flex items-center justify-center"
            >
              <img src={sticker.url} alt="Sticker" className="w-full h-full object-contain" />
            </button>
          ))
        ) : (
          <div className="col-span-4 text-center py-4 text-zinc-500 text-xs">No stickers yet</div>
        )}
      </div>

      <div className="border-t border-zinc-800 pt-3">
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleUploadSticker}
        />
        <button 
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
        >
          {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
          {uploading ? 'Creating sticker...' : 'Create Sticker'}
        </button>
      </div>
    </div>
  );
};
