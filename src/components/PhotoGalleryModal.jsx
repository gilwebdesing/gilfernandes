import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

const PhotoGalleryModal = ({ isOpen, onClose, images = [], initialIndex = 0 }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  
  // Touch navigation refs
  const touchStartX = useRef(null);
  const touchCurrentX = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, initialIndex]);

  const nextImage = useCallback((e) => {
    e?.stopPropagation && e.stopPropagation();
    if (images.length === 0) return;
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const prevImage = useCallback((e) => {
    e?.stopPropagation && e.stopPropagation();
    if (images.length === 0) return;
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  // Swipe Handlers
  const handleTouchStart = (e) => {
    // Capture initial position
    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = e.touches[0].clientX; // Initialize current to avoid null issues on tap
  };

  const handleTouchMove = (e) => {
    // Track movement
    // Note: e.preventDefault() for scroll blocking is handled by style={{ touchAction: 'none' }}
    touchCurrentX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchCurrentX.current === null) return;

    // Calculate difference
    const diff = touchStartX.current - touchCurrentX.current;
    const threshold = 60; // 60px minimum distance

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swipe Left -> Next Image
        nextImage();
      } else {
        // Swipe Right -> Previous Image
        prevImage();
      }
    }

    // Reset refs
    touchStartX.current = null;
    touchCurrentX.current = null;
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, nextImage, prevImage, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between"
          onClick={onClose}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 text-white bg-gradient-to-b from-black/50 to-transparent">
            <span className="text-sm font-medium">
              {currentIndex + 1} / {images.length}
            </span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(images[currentIndex], '_blank');
                }}
              >
                <Download className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
          </div>

          {/* Main Image */}
          <div className="flex-1 relative flex items-center justify-center p-4">
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 z-10 text-white hover:bg-white/10 rounded-full h-12 w-12 hidden md:flex"
              onClick={prevImage}
            >
              <ChevronLeft className="w-8 h-8" />
            </Button>

            <motion.img
              key={currentIndex}
              src={images[currentIndex]}
              alt={`Gallery image ${currentIndex + 1}`}
              className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              
              // Touch Event Handlers
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              
              // Prevent default browser scrolling/panning gestures on the image
              style={{ touchAction: 'none' }}
              
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            />

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 z-10 text-white hover:bg-white/10 rounded-full h-12 w-12 hidden md:flex"
              onClick={nextImage}
            >
              <ChevronRight className="w-8 h-8" />
            </Button>
          </div>

          {/* Thumbnails */}
          <div
            className="h-24 bg-black/50 backdrop-blur-sm p-4 flex gap-2 overflow-x-auto justify-center items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`relative h-16 w-24 flex-shrink-0 rounded-md overflow-hidden transition-all ${
                  currentIndex === idx
                    ? 'ring-2 ring-white opacity-100 scale-105'
                    : 'opacity-50 hover:opacity-80'
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PhotoGalleryModal;