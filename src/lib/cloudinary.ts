export const uploadToCloudinary = async (file: File, type: 'image' | 'video' | 'audio' | 'raw' | 'auto' = 'auto') => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary credentials not configured in .env file.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${type === 'audio' ? 'video' : type}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error('Failed to upload media to Cloudinary');
  }

  const data = await res.json();
  return data.secure_url as string;
};
