import React from 'react';
import { FileText, Download, FileImage, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const PropertyPlansViewer = ({ plans = [] }) => {
  if (!plans || plans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
        <FileText className="w-12 h-12 mb-3 text-gray-300" />
        <p>Nenhuma planta disponível para este imóvel.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {plans.map((plan, index) => (
        <div 
          key={index} 
          className="group relative bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-300 hover:border-blue-200"
        >
          <div className="flex items-start justify-between mb-3">
             <div className="p-2.5 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors">
                {plan.type?.includes('image') ? <FileImage className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
             </div>
             {plan.type?.includes('image') && (
                <div className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">
                    Prévia Disponível
                </div>
             )}
          </div>
          
          <h4 className="font-semibold text-gray-900 truncate mb-1" title={plan.name}>
            {plan.name || `Planta ${index + 1}`}
          </h4>
          
          <div className="flex items-center text-xs text-gray-500 mb-4 space-x-2">
            <span>{plan.size ? (plan.size / 1024 / 1024).toFixed(2) + ' MB' : 'PDF/IMG'}</span>
            <span>•</span>
            <span className="uppercase">{plan.type?.split('/')[1] || 'FILE'}</span>
          </div>

          <div className="flex gap-2">
            <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 text-xs"
                onClick={() => window.open(plan.url, '_blank')}
            >
                <Download className="w-3 h-3 mr-2" />
                Baixar
            </Button>
            {plan.type?.includes('image') && (
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-gray-400 hover:text-blue-600"
                    onClick={() => window.open(plan.url, '_blank')}
                >
                    <Eye className="w-4 h-4" />
                </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PropertyPlansViewer;