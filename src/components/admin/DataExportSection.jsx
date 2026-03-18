
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Download, FileJson, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { exportPropertiesCSV } from '@/utils/exportCSV';
import { downloadPropertyImagesZip } from '@/utils/downloadImagesZip';

const DataExportSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isExportingCSV, setIsExportingCSV] = useState(false);
  const [isExportingZIP, setIsExportingZIP] = useState(false);
  const [zipProgress, setZipProgress] = useState(null);
  const [zipError, setZipError] = useState(null);

  // Updated Admin Email: gilfernandesml@gmail.com
  const isAdmin = user?.email === 'gilfernandesml@gmail.com';

  if (!isAdmin) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-red-700">Acesso negado</h3>
        <p className="text-red-600 mt-2">Apenas o administrador (gilfernandesml@gmail.com) pode acessar estas ferramentas de exportação.</p>
      </div>
    );
  }

  const handleExportCSV = async () => {
    setIsExportingCSV(true);
    const result = await exportPropertiesCSV();
    setIsExportingCSV(false);

    if (result.success) {
      toast({
        title: "Sucesso!",
        description: result.message,
        className: "bg-green-50 border-green-200"
      });
    } else {
      toast({
        title: "Erro na exportação",
        description: result.message,
        variant: "destructive"
      });
    }
  };

  const handleExportZIP = async () => {
    setIsExportingZIP(true);
    setZipError(null);
    setZipProgress({ current: 0, total: 100, text: 'Iniciando...' });

    const result = await downloadPropertyImagesZip((current, total, text) => {
      setZipProgress({ current, total, text: text || `Baixando ${current} de ${total} imagens...` });
    });

    setIsExportingZIP(false);
    setZipProgress(null);

    if (result.success) {
      toast({
        title: "Sucesso!",
        description: result.message,
        className: "bg-green-50 border-green-200"
      });
    } else {
      setZipError(result.message);
      toast({
        title: "Erro no download",
        description: result.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#1a3a52]">Data Export / Backup</h2>
        <p className="text-gray-600 mt-1">Exporte dados das propriedades e imagens para backup ou migração.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* CSV Export Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
            <FileJson className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Exportar Dados (CSV)</h3>
          <p className="text-gray-500 text-sm mb-6">
            Baixe uma planilha completa com todas as informações das propriedades cadastradas.
          </p>
          <Button 
            onClick={handleExportCSV} 
            disabled={isExportingCSV || isExportingZIP}
            className="w-full bg-[#0d5a7a] hover:bg-[#0b4a65] text-white"
          >
            {isExportingCSV ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Exportando...</>
            ) : (
              <><Download className="w-4 h-4 mr-2" /> Export Properties CSV</>
            )}
          </Button>
        </div>

        {/* ZIP Export Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-4">
            <ImageIcon className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Exportar Imagens (ZIP)</h3>
          <p className="text-gray-500 text-sm mb-6">
            Faça download de todas as imagens em alta resolução organizadas por pasta.
          </p>
          
          {zipProgress && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Progresso</span>
                <span>{Math.round((zipProgress.current / zipProgress.total) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all" 
                  style={{ width: `${(zipProgress.current / zipProgress.total) * 100}%` }}
                />
              </div>
              <p className="text-xs text-center text-gray-500 mt-2 font-medium">{zipProgress.text}</p>
            </div>
          )}

          {zipError && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-start">
              <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>{zipError}</span>
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={handleExportZIP} 
              disabled={isExportingZIP || isExportingCSV}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isExportingZIP ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processando...</>
              ) : (
                <><Download className="w-4 h-4 mr-2" /> {zipError ? 'Tentar Novamente' : 'Download Property Images'}</>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataExportSection;
