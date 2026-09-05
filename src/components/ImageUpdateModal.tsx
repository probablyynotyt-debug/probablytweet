import React, { useState } from 'react';
import { X, UploadCloud, Loader2 } from 'lucide-react';

interface ImageUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (file: File) => Promise<void>;
  field: 'photoURL' | 'bannerURL';
}

export const ImageUpdateModal: React.FC<ImageUpdateModalProps> = ({ isOpen, onClose, onSubmit, field }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      setLoading(true);
      try {
        await onSubmit(file);
        handleClose();
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#121216] border border-zinc-800 rounded-2xl w-full max-w-sm overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 shrink-0">
          <h2 className="text-lg font-bold text-white">
            Upload {field === 'photoURL' ? 'Avatar' : 'Banner'}
          </h2>
          <button onClick={handleClose} className="p-1 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-4">
            {preview ? (
              <div className={`relative w-full ${field === 'photoURL' ? 'aspect-square max-w-[200px] mx-auto rounded-full' : 'aspect-video rounded-xl'} overflow-hidden border border-zinc-800 bg-zinc-900`}>
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <button 
                  type="button" 
                  onClick={() => { setFile(null); setPreview(null); }}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/80 rounded-full text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-zinc-800 border-dashed rounded-xl cursor-pointer bg-zinc-900/50 hover:bg-zinc-800/50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-8 h-8 mb-2 text-zinc-500" />
                  <p className="text-sm text-zinc-400 font-medium">Click to select image</p>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            )}
          </div>
          
          <button 
            type="submit" 
            disabled={!file || loading}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-[#6364ff] hover:bg-[#5253d8] disabled:opacity-50 disabled:hover:bg-[#6364ff] text-white font-semibold py-2.5 rounded-xl transition-colors"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Uploading...' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  );
};
