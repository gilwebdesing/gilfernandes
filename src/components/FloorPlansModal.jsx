import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FloorPlansModal = ({ isOpen, plans = [], onClose, initialIndex = 0 }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  
  // Touch navigation refs
  const touchStartX = useRef(null);
  const touchCurrentX = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, initialIndex]);

  const handlePrevious = useCallback((e) => {
    e?.stopPropagation && e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? plans.length - 1 : prev - 1));
  }, [plans]);

  const handleNext = useCallback((e) => {
    e?.stopPropagation && e.stopPropagation();
    setCurrentIndex((prev) => (prev === plans.length - 1 ? 0 : prev + 1));
  }, [plans]);

  // Swipe Handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchCurrentX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchCurrentX.current === null) return;
    const diff = touchStartX.current - touchCurrentX.current;
    if (Math.abs(diff) > 60) {
      diff > 0 ? handleNext() : handlePrevious();
    }
    touchStartX.current = null;
    touchCurrentX.current = null;
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrevious, onClose]);

  if (!isOpen || !plans || plans.length === 0) return null;

  // Handle both string URLs and object structures if plans come from older uploads
  const currentPlan = plans[currentIndex];
  const currentSrc = typeof currentPlan === 'string' ? currentPlan : currentPlan?.url;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-sm"
          style={{ touchAction: 'none' }}
          onClick={onClose}
        >
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/10 z-50 rounded-full w-10 h-10"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Main Container */}
          <div 
            className="relative w-full h-full max-w-7xl max-h-screen p-4 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()} 
            style={{ touchAction: 'none' }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="relative max-w-full max-h-[85vh] flex flex-col items-center justify-center"
              >
                {/* Image Display */}
                <img
                  src={currentSrc}
                  alt={`Planta ${currentIndex + 1}`}
                  className="max-w-full max-h-[80vh] object-contain shadow-2xl rounded-lg bg-white select-none pointer-events-none"
                  draggable={false}
                />
                <div className="mt-4 flex items-center gap-2 text-white/90 bg-black/50 px-4 py-2 rounded-full backdrop-blur-md">
                   <FileText className="w-4 h-4" />
                   <span className="font-medium">Planta Humanizada</span>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            {plans.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white hover:bg-white/10 rounded-full w-12 h-12 hidden md:flex"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="w-8 h-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white hover:bg-white/10 rounded-full w-12 h-12 hidden md:flex"
                  onClick={handleNext}
                >
                  <ChevronRight className="w-8 h-8" />
                </Button>
              </>
            )}

            {/* Counter */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 font-medium px-4 py-2 bg-black/40 rounded-full backdrop-blur-md border border-white/10">
              {currentIndex + 1} de {plans.length}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloorPlansModal;