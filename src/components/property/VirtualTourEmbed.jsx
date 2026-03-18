import React, { useState } from 'react';
import { Rotate3D, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const VirtualTourEmbed = ({ url, className }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  if (!url) return null;

  return (
    <div className={cn("relative w-full aspect-video bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-sm", className)}>
      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-10">
          <Rotate3D className="w-12 h-12 text-gray-400 mb-3 animate-pulse" />
          <p className="text-gray-500 font-medium">Carregando Tour Virtual...</p>
        </div>
      )}
      <iframe
        src={url}
        title="Virtual Tour"
        className="w-full h-full relative z-20"
        onLoad={() => setIsLoaded(true)}
        allowFullScreen
      />
      
      <div className="absolute bottom-4 right-4 z-30">
        <Button 
          variant="secondary" 
          size="sm" 
          className="bg-white/90 hover:bg-white shadow-sm text-xs backdrop-blur-sm"
          onClick={() => window.open(url, '_blank')}
        >
          <ExternalLink className="w-3 h-3 mr-2" />
          Abrir em nova aba
        </Button>
      </div>
    </div>
  );
};

export default VirtualTourEmbed;