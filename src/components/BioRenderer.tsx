import React, { useMemo } from 'react';
import { ExternalLink } from 'lucide-react';

interface BioRendererProps {
  bio: string;
}

export const BioRenderer: React.FC<BioRendererProps> = ({ bio }) => {
  const { parts, regularLinks } = useMemo(() => {
    // Basic URL regex
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = Array.from(bio.matchAll(urlRegex)) as RegExpMatchArray[];
    
    const regularLinks: string[] = [];
    let lastIndex = 0;
    const parts: React.ReactNode[] = [];

    matches.forEach((match, i) => {
      const url = match[0];
      const start = match.index!;
      
      // Add text before the URL
      if (start > lastIndex) {
        parts.push(<span key={`text-${i}`}>{formatText(bio.substring(lastIndex, start))}</span>);
      }

      // Check if it's a Spotify link
      if (url.includes('open.spotify.com')) {
        // Convert to embed URL
        // From: https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT
        // To: https://open.spotify.com/embed/track/4cOdK2wGLETKBW3PvgPWqT
        let embedUrl = url;
        if (!url.includes('/embed/')) {
           embedUrl = url.replace('open.spotify.com/', 'open.spotify.com/embed/');
        }
        
        parts.push(
          <div key={`spotify-${i}`} className="my-2">
            <iframe 
              src={embedUrl} 
              width="100%" 
              height="80" 
              frameBorder="0" 
              allow="encrypted-media"
              className="rounded-xl border-none"
            ></iframe>
          </div>
        );
      } else {
        // Add to regular links list
        if (!regularLinks.includes(url)) {
          regularLinks.push(url);
        }
        // Don't render regular links inline, as per requirements they go at the bottom
      }
      
      lastIndex = start + url.length;
    });

    // Add remaining text
    if (lastIndex < bio.length) {
      parts.push(<span key="text-end">{formatText(bio.substring(lastIndex))}</span>);
    }

    return { parts, regularLinks };
  }, [bio]);

  // Simple formatter for bold (*text* or **text**) and italic (_text_)
  function formatText(text: string) {
    // This is a very simple formatter for the remaining text parts
    // Split by newlines first
    return text.split('\n').map((line, lineIndex) => {
      // Very basic implementation: just output string, real markdown is better but this fulfills basic **bold** _italic_
      // Actually, since react-markdown might be overkill for just bold/italic + custom link logic, let's use a small parser.
      
      let processed = line;
      // Handle **bold**
      const boldParts = processed.split(/(\*\*.*?\*\*)/g).map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        
        // Handle _italic_ inside non-bold
        const italicParts = part.split(/(_.*?_)/g).map((ip, j) => {
          if (ip.startsWith('_') && ip.endsWith('_')) {
             return <em key={j}>{ip.slice(1, -1)}</em>;
          }
          return ip;
        });
        return <React.Fragment key={i}>{italicParts}</React.Fragment>;
      });

      return (
        <React.Fragment key={lineIndex}>
          {boldParts}
          {lineIndex < text.split('\n').length - 1 && <br />}
        </React.Fragment>
      );
    });
  }

  if (!bio) return null;

  return (
    <div className="text-sm text-zinc-300">
      <div className="whitespace-pre-wrap word-break break-words">
        {parts.length > 0 ? parts : formatText(bio)}
      </div>

      {regularLinks.length > 0 && (
        <div className="mt-4 space-y-2 flex flex-col items-start">
          {regularLinks.map((link, i) => {
            try {
              const urlObj = new URL(link);
              return (
                <a 
                  key={i} 
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 py-1.5 px-4 rounded-full text-sm font-medium transition-colors max-w-full"
                >
                  <ExternalLink className="w-4 h-4 shrink-0 text-[#6364ff]" />
                  <span className="truncate">{urlObj.hostname}</span>
                </a>
              );
            } catch (e) {
               return null;
            }
          })}
        </div>
      )}
    </div>
  );
};
