import React from 'react';
import { Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const SEOPreview = ({ title, description, slug }) => {
  const baseUrl = "https://gilcorretorsp.com.br/imovel/";
  const fullUrl = `${baseUrl}${slug || 'exemplo-de-slug'}`;
  
  // Character Limits
  const TITLE_MIN = 50;
  const TITLE_MAX = 60;
  const DESC_MIN = 150;
  const DESC_MAX = 160;

  const titleLength = title?.length || 0;
  const descLength = description?.length || 0;

  const getStatusColor = (length, min, max) => {
    if (length === 0) return "text-gray-400";
    if (length >= min && length <= max) return "text-green-600";
    if (length > max) return "text-red-500";
    return "text-yellow-500"; // Too short
  };

  const getStatusIcon = (length, min, max) => {
    if (length === 0) return null;
    if (length >= min && length <= max) return <CheckCircle className="w-4 h-4 text-green-600 inline ml-2" />;
    if (length > max) return <AlertCircle className="w-4 h-4 text-red-500 inline ml-2" />;
    return <AlertTriangle className="w-4 h-4 text-yellow-500 inline ml-2" />;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-600" />
          Prévia no Google
        </h3>
        
        {/* Google Search Result Preview */}
        <div className="max-w-[600px] font-sans">
          <div className="flex items-center gap-2 mb-1">
             <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-xs text-gray-600 font-bold border border-gray-200">
                G
             </div>
             <div className="flex flex-col leading-tight">
                <span className="text-sm text-[#202124] font-normal">Gil Corretor SP</span>
                <span className="text-xs text-[#5f6368] truncate max-w-[300px]">{fullUrl}</span>
             </div>
          </div>
          <h4 className="text-xl text-[#1a0dab] hover:underline cursor-pointer font-medium leading-snug truncate">
            {title || "Título do Imóvel aparecerá aqui..."}
          </h4>
          <p className="text-sm text-[#4d5156] mt-1 leading-snug line-clamp-2">
            {description || "A descrição do imóvel aparecerá aqui. Certifique-se de incluir palavras-chave relevantes e detalhes atrativos para aumentar a taxa de cliques."}
          </p>
        </div>
      </div>

      {/* Analysis & Tips */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Title Analysis */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
           <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Título SEO</span>
              <span className={`text-xs font-bold ${getStatusColor(titleLength, TITLE_MIN, TITLE_MAX)}`}>
                {titleLength} / {TITLE_MAX} caracteres {getStatusIcon(titleLength, TITLE_MIN, TITLE_MAX)}
              </span>
           </div>
           <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
              <div 
                className={`h-1.5 rounded-full ${titleLength > TITLE_MAX ? 'bg-red-500' : (titleLength >= TITLE_MIN ? 'bg-green-500' : 'bg-yellow-400')}`} 
                style={{ width: `${Math.min((titleLength / TITLE_MAX) * 100, 100)}%` }}
              ></div>
           </div>
           <p className="text-xs text-gray-500">
             Ideal: 50-60 caracteres. Títulos muito longos serão cortados (...) pelo Google.
           </p>
        </div>

        {/* Description Analysis */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
           <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Descrição Meta</span>
              <span className={`text-xs font-bold ${getStatusColor(descLength, DESC_MIN, DESC_MAX)}`}>
                {descLength} / {DESC_MAX} caracteres {getStatusIcon(descLength, DESC_MIN, DESC_MAX)}
              </span>
           </div>
           <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
              <div 
                className={`h-1.5 rounded-full ${descLength > DESC_MAX ? 'bg-red-500' : (descLength >= DESC_MIN ? 'bg-green-500' : 'bg-yellow-400')}`} 
                style={{ width: `${Math.min((descLength / DESC_MAX) * 100, 100)}%` }}
              ></div>
           </div>
           <p className="text-xs text-gray-500">
             Ideal: 150-160 caracteres. Inclua diferenciais e "call-to-action".
           </p>
        </div>
      </div>
    </div>
  );
};

export default SEOPreview;