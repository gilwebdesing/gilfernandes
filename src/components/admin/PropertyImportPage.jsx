import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { parseCSV } from '@/lib/parseCSV';
import { mapPropertyData } from '@/lib/mapPropertyData';
import { importProperties } from '@/services/importProperties';
import { supabase } from '@/lib/supabase';

const PropertyImportPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef(null);

  // States
  const [file, setFile] = useState(null);
  const [step, setStep] = useState('upload'); // 'upload', 'preview', 'importing', 'results'
  const [previewData, setPreviewData] = useState([]);
  const [rawParsedData, setRawParsedData] = useState([]);
  const [importResults, setImportResults] = useState(null);
  const [progress, setProgress] = useState(0);
  
  // Broker Data State
  const [brokerId, setBrokerId] = useState(null);
  const [loadingBroker, setLoadingBroker] = useState(false);

  useEffect(() => {
    const fetchBrokerProfile = async () => {
      if (!user) return;
      
      setLoadingBroker(true);
      try {
        const { data, error } = await supabase
          .from('brokers')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;
        
        if (data) {
          setBrokerId(data.id);
        }
      } catch (error) {
        console.error('Error fetching broker profile:', error);
        // We don't show toast here to avoid spamming on load, handled in validate
      } finally {
        setLoadingBroker(false);
      }
    };

    fetchBrokerProfile();
  }, [user]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        toast({
          title: "Formato inválido",
          description: "Por favor, envie apenas arquivos CSV.",
          variant: "destructive"
        });
        return;
      }
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const parseFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const parsed = parseCSV(text);
      
      if (parsed.length === 0) {
        toast({
          title: "Arquivo vazio ou inválido",
          description: "Não foi possível ler dados do arquivo CSV.",
          variant: "destructive"
        });
        setFile(null);
        return;
      }

      setRawParsedData(parsed);
      
      // Map first 5 items for preview. 
      // We use user.id or brokerId for preview visualization, though the real ID is injected at import.
      const displayId = brokerId || user?.id;
      const mappedPreview = parsed.slice(0, 5).map(item => mapPropertyData(item, displayId));
      setPreviewData(mappedPreview);
      setStep('preview');
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    // Validation: Check Authentication
    if (!user) {
      toast({
        title: "Erro de Autenticação",
        description: "Você precisa estar logado para importar imóveis.",
        variant: "destructive"
      });
      return;
    }

    // Validation: Check Broker Profile
    if (!brokerId) {
      toast({
        title: "Perfil Incompleto",
        description: "Seu perfil de corretor não foi encontrado. Por favor, complete seu perfil antes de importar imóveis.",
        variant: "destructive"
      });
      return;
    }

    setStep('importing');
    setProgress(10);

    // Map all data
    // Note: We pass raw items to mapPropertyData, but mapPropertyData expects a brokerId.
    // However, importProperties now also accepts and forces brokerId. 
    // We'll map first for structure, then pass to service.
    const allMappedData = rawParsedData.map(item => mapPropertyData(item, brokerId));
    setProgress(30);

    // Process import
    try {
      const results = await importProperties(allMappedData, brokerId);
      setProgress(100);
      setImportResults(results);
      setStep('results');
      
      if (results.successCount > 0) {
        toast({
          title: "Importação concluída!",
          description: `${results.successCount} imóveis importados com sucesso.`,
          className: "bg-green-50 border-green-200"
        });
      }
      
      // Check for specific friendly errors in the results to show a specific toast if needed
      const hasBrokerError = results.errors.some(e => e.error.includes("perfil de corretor"));
      if (hasBrokerError) {
        toast({
          title: "Erro de Vinculação",
          description: "Alguns imóveis falharam pois não foi possível vinculá-los ao seu perfil.",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error("Import failed critically:", error);
      toast({
        title: "Erro na importação",
        description: "Falha crítica ao processar dados.",
        variant: "destructive"
      });
      setStep('preview');
    }
  };

  const resetImport = () => {
    setFile(null);
    setPreviewData([]);
    setRawParsedData([]);
    setImportResults(null);
    setStep('upload');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- Render Steps ---

  const renderUploadStep = () => {
    if (loadingBroker) {
      return (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
           <Loader2 className="w-10 h-10 text-[#1a3a52] animate-spin mb-4" />
           <p className="text-gray-500">Verificando permissões de importação...</p>
        </div>
      );
    }

    return (
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
           onClick={() => fileInputRef.current.click()}>
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange} 
          accept=".csv" 
          className="hidden" 
        />
        <div className="w-16 h-16 bg-blue-100 text-[#1a3a52] rounded-full flex items-center justify-center mx-auto mb-4">
          <Upload className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-[#1a3a52] mb-2">Clique para fazer upload do CSV</h3>
        <p className="text-gray-500 text-sm max-w-sm mx-auto">
          Arraste e solte ou clique para selecionar. O arquivo deve estar no formato CSV com colunas como: post_title, post_content, property_type, property_status, etc.
        </p>
      </div>
    );
  };

  const renderPreviewStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg border border-blue-100">
        <div className="flex items-center">
          <FileText className="w-5 h-5 text-blue-600 mr-3" />
          <div>
            <p className="font-semibold text-[#1a3a52]">{file?.name}</p>
            <p className="text-sm text-gray-500">{rawParsedData.length} imóveis encontrados</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={resetImport} className="text-red-500 hover:text-red-700 hover:bg-red-50">
          <X className="w-4 h-4 mr-1" /> Cancelar
        </Button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h4 className="font-bold text-sm text-gray-700">Pré-visualização dos dados (5 primeiros)</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                <th className="px-4 py-3">Título</th>
                <th className="px-4 py-3">Bairro</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Preço</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {previewData.map((prop, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900 truncate max-w-[200px]">{prop.title}</td>
                  <td className="px-4 py-3 text-gray-600">{prop.neighborhood}</td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{prop.type}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {prop.price ? `R$ ${prop.price}` : (prop.rental_price ? `R$ ${prop.rental_price}/mês` : '-')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      prop.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {prop.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button 
          onClick={handleImport} 
          disabled={loadingBroker}
          className="bg-[#1a3a52] hover:bg-[#1a3a52]/90 text-white min-w-[150px]"
        >
          {loadingBroker ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Confirmar Importação
        </Button>
      </div>
    </div>
  );

  const renderImportingStep = () => (
    <div className="py-20 text-center">
      <div className="relative w-24 h-24 mx-auto mb-6">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle 
            className="text-gray-200 stroke-current" 
            strokeWidth="8" 
            cx="50" cy="50" r="40" 
            fill="transparent" 
          ></circle>
          <circle 
            className="text-[#1a3a52] progress-ring__circle stroke-current transition-all duration-500 ease-out" 
            strokeWidth="8" 
            strokeLinecap="round" 
            cx="50" cy="50" r="40" 
            fill="transparent" 
            strokeDasharray="251.2" 
            strokeDashoffset={251.2 - (251.2 * progress) / 100} 
            transform="rotate(-90 50 50)"
          ></circle>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-bold text-xl text-[#1a3a52]">
          {progress}%
        </div>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">Importando Imóveis...</h3>
      <p className="text-gray-500">Por favor, não feche esta janela.</p>
    </div>
  );

  const renderResultsStep = () => (
    <div className="text-center py-10">
      <div className="mb-6 flex justify-center">
        {importResults.failedCount === 0 ? (
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
             <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
        ) : (
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
             <AlertCircle className="w-10 h-10 text-yellow-600" />
          </div>
        )}
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Importação Finalizada</h2>
      <p className="text-gray-500 mb-8">Processamos {importResults.totalProcessed} linhas do seu arquivo.</p>

      <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto mb-8">
        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
          <p className="text-sm text-green-600 font-medium uppercase mb-1">Sucesso</p>
          <p className="text-3xl font-bold text-green-700">{importResults.successCount}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-xl border border-red-100">
          <p className="text-sm text-red-600 font-medium uppercase mb-1">Falhas</p>
          <p className="text-3xl font-bold text-red-700">{importResults.failedCount}</p>
        </div>
      </div>

      {importResults.errors.length > 0 && (
        <div className="max-w-2xl mx-auto bg-gray-50 rounded-lg border border-gray-200 overflow-hidden mb-8 text-left">
          <div className="p-3 bg-gray-100 border-b border-gray-200 font-medium text-sm text-gray-700 flex justify-between items-center">
            <span>Erros Detalhados</span>
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{importResults.errors.length} erros</span>
          </div>
          <div className="max-h-48 overflow-y-auto p-4 space-y-3">
            {importResults.errors.map((err, idx) => (
              <div key={idx} className="text-sm text-gray-600 border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                <span className="font-semibold text-red-500 block mb-1">
                  {err.row ? `Linha ${err.row}` : `Lote ${err.batch_index}`} - {err.title || 'Sem título'}
                </span>
                {err.error}
              </div>
            ))}
          </div>
        </div>
      )}

      <Button onClick={resetImport} className="bg-[#1a3a52] hover:bg-[#1a3a52]/90 text-white">
        <RefreshCw className="w-4 h-4 mr-2" /> Importar Novo Arquivo
      </Button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#1a3a52]">Importar Imóveis via CSV</h2>
        <p className="text-gray-500 text-sm">Importe múltiplos imóveis de uma vez usando arquivos CSV (formato WordPress/WpResidence compatível).</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      >
        {step === 'upload' && renderUploadStep()}
        {step === 'preview' && renderPreviewStep()}
        {step === 'importing' && renderImportingStep()}
        {step === 'results' && renderResultsStep()}
      </motion.div>
    </div>
  );
};

export default PropertyImportPage;