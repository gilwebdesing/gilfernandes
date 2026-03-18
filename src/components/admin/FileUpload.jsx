import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Loader2, Download, AlertCircle, FileType } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

const FileUpload = ({ 
  files = [], 
  onFilesChange, 
  bucketName = 'property-images', 
  folderPath = 'plans',
  maxSizeMB = 10,
  acceptedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
}) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  const handleFileSelect = async (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    // Validate files
    const validFiles = selectedFiles.filter(file => {
      const isValidType = acceptedTypes.includes(file.type);
      const isValidSize = file.size <= maxSizeMB * 1024 * 1024;
      
      if (!isValidType) {
        toast({
          title: "Tipo de arquivo inválido",
          description: `${file.name} não é suportado. Use PDF, JPG ou PNG.`,
          variant: "destructive"
        });
      }
      if (!isValidSize) {
        toast({
          title: "Arquivo muito grande",
          description: `${file.name} excede o limite de ${maxSizeMB}MB.`,
          variant: "destructive"
        });
      }
      return isValidType && isValidSize;
    });

    if (validFiles.length === 0) return;

    setUploading(true);
    const newFiles = [];

    try {
      for (const file of validFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${folderPath}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from(bucketName)
          .getPublicUrl(fileName);

        newFiles.push({
          name: file.name,
          size: file.size,
          type: file.type,
          url: publicUrl,
          uploadedAt: new Date().toISOString()
        });
      }

      onFilesChange([...files, ...newFiles]);
      toast({
        title: "Upload concluído",
        description: `${newFiles.length} arquivo(s) adicionado(s) com sucesso.`,
        className: "bg-green-50 border-green-200"
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Erro no upload",
        description: "Falha ao enviar arquivos. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    onFilesChange(newFiles);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    if (type?.includes('pdf')) return <FileText className="w-8 h-8 text-red-500" />;
    if (type?.includes('image')) return <FileType className="w-8 h-8 text-blue-500" />;
    return <FileText className="w-8 h-8 text-gray-500" />;
  };

  return (
    <div className="space-y-4">
      <div 
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
          uploading ? "bg-gray-50 border-gray-300" : "hover:bg-gray-50 border-gray-300 hover:border-[#1a3a52]"
        )}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileSelect} 
          multiple 
          accept={acceptedTypes.join(',')} 
          className="hidden" 
          disabled={uploading}
        />
        
        {uploading ? (
          <div className="flex flex-col items-center justify-center py-4">
            <Loader2 className="w-8 h-8 animate-spin text-[#1a3a52] mb-2" />
            <p className="text-sm text-gray-500">Enviando arquivos...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4">
            <Upload className="w-10 h-10 text-gray-400 mb-2" />
            <p className="text-sm font-medium text-gray-700">Clique para adicionar arquivos ou arraste aqui</p>
            <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG (Max 10MB)</p>
          </div>
        )}
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {files.map((file, index) => (
            <div key={index} className="relative flex items-center p-3 bg-white border border-gray-200 rounded-lg shadow-sm group hover:border-blue-200 transition-colors">
              <div className="mr-3 flex-shrink-0">
                {getFileIcon(file.type)}
              </div>
              <div className="flex-1 min-w-0 mr-2">
                <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {file.size ? formatFileSize(file.size) : 'Tamanho desconhecido'}
                </p>
              </div>
              <div className="flex items-center space-x-1">
                <a 
                  href={file.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-1.5 text-gray-400 hover:text-[#1a3a52] hover:bg-gray-100 rounded-full transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Download className="w-4 h-4" />
                </a>
                <button 
                  type="button" 
                  onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;