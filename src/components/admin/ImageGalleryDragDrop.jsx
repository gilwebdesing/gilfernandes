import React, { useState, useRef } from 'react';
import { Upload, Loader2, GripVertical, Trash2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ImageGalleryDragDrop = ({ 
  images = [], 
  onReorder, 
  onDelete, 
  onUpload, 
  uploading = false 
}) => {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    // Create a custom drag image if needed, or rely on browser default
    // e.dataTransfer.setDragImage(e.target, 0, 0); 
  };

  const handleDragEnter = (e, index) => {
    e.preventDefault();
    if (draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      handleDragEnd();
      return;
    }

    const newImages = [...images];
    const draggedItem = newImages[draggedIndex];
    
    // Remove dragged item
    newImages.splice(draggedIndex, 1);
    // Insert at new position
    newImages.splice(dropIndex, 0, draggedItem);

    onReorder(newImages);
    handleDragEnd();
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
       {/* Upload Button Section */}
       <div className="flex items-center gap-4">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={onUpload}
          />
          <Button 
            type="button"
            className="w-full md:w-auto bg-[#1a3a52] text-white hover:bg-[#1a3a52]/90"
            onClick={handleUploadClick}
            disabled={uploading}
          >
             {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
             {uploading ? 'Enviando...' : 'Carregar Imagens'}
          </Button>
          <p className="text-sm text-gray-500 hidden sm:block">
            Arraste as imagens para reordenar. A primeira será a capa do imóvel.
          </p>
       </div>

       {/* Draggable Grid */}
       {images.length > 0 ? (
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {images.map((img, index) => (
             <div
               key={`${img}-${index}`}
               draggable
               onDragStart={(e) => handleDragStart(e, index)}
               onDragEnter={(e) => handleDragEnter(e, index)}
               onDragOver={handleDragOver}
               onDrop={(e) => handleDrop(e, index)}
               onDragEnd={handleDragEnd}
               className={cn(
                 "relative group rounded-lg overflow-hidden border transition-all duration-200 aspect-video bg-gray-50 cursor-grab active:cursor-grabbing",
                 draggedIndex === index && "opacity-50 border-dashed border-2 border-gray-400 scale-95",
                 dragOverIndex === index && draggedIndex !== index && "border-2 border-[#1a3a52] scale-105 shadow-xl z-10",
                 !draggedIndex && "hover:shadow-md border-gray-200"
               )}
             >
               <img
                 src={img}
                 alt={`Property ${index + 1}`}
                 className="w-full h-full object-cover pointer-events-none" 
               />
               
               {/* Overlay with actions */}
               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                 <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-5 h-5 text-white" />
                 </div>
                 <button
                   type="button"
                   onClick={(e) => {
                     e.stopPropagation(); 
                     onDelete(index);
                   }}
                   className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors shadow-lg transform hover:scale-110"
                   title="Remover imagem"
                 >
                   <Trash2 className="w-4 h-4" />
                 </button>
               </div>
               
               {/* Index badge */}
               <div className={cn(
                 "absolute top-2 left-2 text-xs px-2 py-1 rounded-full font-medium shadow-sm pointer-events-none",
                 index === 0 ? "bg-[#1a3a52] text-white" : "bg-black/60 text-white"
               )}>
                 {index === 0 ? 'Capa Principal' : `#${index + 1}`}
               </div>
             </div>
           ))}
         </div>
       ) : (
         <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
            <ImageIcon className="w-12 h-12 mb-3 opacity-20" />
            <p className="font-medium">Nenhuma imagem adicionada</p>
            <p className="text-sm mt-1">Carregue imagens do seu computador ou adicione via URL</p>
         </div>
       )}
    </div>
  );
};

export default ImageGalleryDragDrop;