import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';

const VideoEmbed = ({ url, title, className }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(false);

  if (!url) return null;

  const getEmbedUrl = (videoUrl) => {
    try {
      // Handle standard YouTube URLs
      let videoId = '';
      if (videoUrl.includes('youtu.be/')) {
        videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
      } else if (videoUrl.includes('youtube.com/watch')) {
        videoId = new URL(videoUrl).searchParams.get('v');
      } else if (videoUrl.includes('youtube.com/embed/')) {
        videoId = videoUrl.split('youtube.com/embed/')[1].split('?')[0];
      }

      if (!videoId) throw new Error('Invalid YouTube URL');

      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    } catch (e) {
      console.error('Error parsing video URL', e);
      setError(true);
      return '';
    }
  };

  const getThumbnailUrl = (videoUrl) => {
    try {
      let videoId = '';
      if (videoUrl.includes('youtu.be/')) {
        videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
      } else if (videoUrl.includes('youtube.com/watch')) {
        videoId = new URL(videoUrl).searchParams.get('v');
      } else if (videoUrl.includes('youtube.com/embed/')) {
        videoId = videoUrl.split('youtube.com/embed/')[1].split('?')[0];
      }
      return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
    } catch (e) {
      return null;
    }
  };

  const embedUrl = getEmbedUrl(url);
  const thumbnailUrl = getThumbnailUrl(url);

  if (error) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-lg border border-gray-200">
        <p className="text-gray-500 text-sm">Vídeo indisponível</p>
      </div>
    );
  }

  return (
    <div className={cn("relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-sm", className)}>
      {!isPlaying ? (
        <div 
          className="absolute inset-0 cursor-pointer group" 
          onClick={() => setIsPlaying(true)}
        >
          {thumbnailUrl && (
            <img 
              src={thumbnailUrl} 
              alt={title || "Video thumbnail"} 
              className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity" 
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border-2 border-white/50">
              <Play className="w-8 h-8 text-white fill-white ml-1" />
            </div>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
             <h3 className="text-white font-medium text-lg drop-shadow-md truncate">{title}</h3>
          </div>
        </div>
      ) : (
        <iframe
          src={embedUrl}
          title={title || "YouTube video player"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      )}
    </div>
  );
};

export default VideoEmbed;