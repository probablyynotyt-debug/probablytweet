export const parseHashtags = (text: string) => {
  // Regex to match #hashtags, but avoid matching colors like #fff
  return text.replace(/(^|\s)(#[a-z\d-_]+)/gi, (match, before, hash) => {
    return `${before}[${hash}](/search?q=${encodeURIComponent(hash)})`;
  });
};
