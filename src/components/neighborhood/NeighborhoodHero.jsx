import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, MapPin } from 'lucide-react';
import ImageOptimizer from '@/components/ImageOptimizer';
import { Skeleton } from '@/components/ui/skeleton';

const NeighborhoodHero = ({ neighborhood, image, loading = false }) => {
  if (loading) {
    return <Skeleton className="w-full h-[400px]" />;
  }

  return (
    <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <ImageOptimizer
          src={image || 'https://horizons-cdn.hostinger.com/deacac47-9976-4867-ac0e-f85fb29051f1/4e59d2892c0fd545c94c77a3c6aeca9f.png'} 
          alt={`Bairro ${neighborhood}`}
          className="w-full h-full object-cover"
          priority={true}
          sizes="100vw"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a3a52] via-[#1a3a52]/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end pb-12 md:pb-20">
        <div className="max-w-7xl mx-auto px-4 w-full">
          {/* Breadcrumbs */}
          <nav className="flex items-center text-sm text-gray-300 mb-4 font-medium">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-white capitalize">{neighborhood}</span>
          </nav>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight drop-shadow-md">
            Imóveis em {neighborhood}
          </h1>
          
          <div className="flex items-center text-white/90 text-lg">
            <MapPin className="w-5 h-5 mr-2 text-[#ff8c42]" />
            <span>São Paulo, SP</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeighborhoodHero;