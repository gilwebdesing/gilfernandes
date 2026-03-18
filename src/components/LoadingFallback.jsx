import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingFallback = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f7fa]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-[#1a3a52]" />
        <p className="text-[#1a3a52] font-semibold animate-pulse">Carregando...</p>
      </div>
    </div>
  );
};

export default LoadingFallback;