import React, { useState } from 'react';
import { SEOService } from '@/services/SEOService';
import { useSEOGeneration } from '@/hooks/useSEOGeneration';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Check, AlertCircle, Loader2, Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const SEOMigrationScript = () => {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState(null); // { processed, updated, skipped, total }
  const [skippedLog, setSkippedLog] = useState([]);
  const { generateSEOForProperty } = useSEOGeneration();
  const { toast } = useToast();

  const runMigration = async () => {
    setProcessing(true);
    setStats({ processed: 0, updated: 0, skipped: 0, total: 0 });
    setSkippedLog([]);
    setProgress(0);

    try {
      // 1. Fetch candidates
      const candidates = await SEOService.getPropertiesWithIncompleteSEO();
      const total = candidates.length;
      
      setStats(prev => ({ ...prev, total }));

      if (total === 0) {
        toast({ title: "Migração Concluída", description: "Nenhum imóvel pendente encontrado." });
        setProcessing(false);
        setProgress(100);
        return;
      }

      let updatedCount = 0;
      let skippedCount = 0;
      const skippedItems = [];

      // 2. Process
      for (let i = 0; i < total; i++) {
        const property = candidates[i];
        const { title, description, errors } = generateSEOForProperty(property);

        if (errors.length === 0 && title && description) {
          try {
            await SEOService.updatePropertySEO(property.id, title, description);
            updatedCount++;
          } catch (err) {
            skippedCount++;
            skippedItems.push({ id: property.id, title: property.title, reason: `Database Error: ${err.message}` });
          }
        } else {
          skippedCount++;
          skippedItems.push({ id: property.id, title: property.title, reason: `Validation: ${errors.join(', ')}` });
        }

        // Update progress
        const currentProcessed = i + 1;
        setStats({
           total,
           processed: currentProcessed,
           updated: updatedCount,
           skipped: skippedCount
        });
        setProgress(Math.round((currentProcessed / total) * 100));
      }

      setSkippedLog(skippedItems);
      toast({ 
        title: "Migração Finalizada", 
        description: `Atualizados: ${updatedCount}. Pulados: ${skippedCount}.`,
        variant: skippedCount > 0 ? "warning" : "default"
      });

    } catch (error) {
      console.error("Migration fatal error", error);
      toast({ title: "Erro Crítico", description: error.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Play className="w-5 h-5 text-blue-600" />
            Migração de SEO em Massa
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Gera automaticamente Título e Descrição para imóveis que não possuem estes campos preenchidos.
          </p>
        </div>
        
        {!processing && !stats && (
           <Button onClick={runMigration} className="bg-blue-600 hover:bg-blue-700 text-white">
             Iniciar Migração
           </Button>
        )}
      </div>

      {(processing || stats) && (
        <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between text-sm font-medium mb-2">
             <span>Progresso</span>
             <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          
          <div className="grid grid-cols-3 gap-4 mt-4 text-center">
             <div className="bg-white p-3 rounded border">
                <div className="text-2xl font-bold text-gray-900">{stats?.total || 0}</div>
                <div className="text-xs text-gray-500 uppercase">Encontrados</div>
             </div>
             <div className="bg-white p-3 rounded border border-green-100 bg-green-50">
                <div className="text-2xl font-bold text-green-600">{stats?.updated || 0}</div>
                <div className="text-xs text-green-700 uppercase">Atualizados</div>
             </div>
             <div className="bg-white p-3 rounded border border-yellow-100 bg-yellow-50">
                <div className="text-2xl font-bold text-yellow-600">{stats?.skipped || 0}</div>
                <div className="text-xs text-yellow-700 uppercase">Pulados</div>
             </div>
          </div>
        </div>
      )}

      {skippedLog.length > 0 && (
        <div className="mt-6 border rounded-lg overflow-hidden">
          <div className="bg-red-50 px-4 py-2 border-b border-red-100 flex justify-between items-center">
             <span className="text-sm font-bold text-red-800 flex items-center gap-2">
               <AlertCircle className="w-4 h-4" />
               Erros / Imóveis Pulados ({skippedLog.length})
             </span>
          </div>
          <div className="max-h-60 overflow-y-auto p-0">
             <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="px-4 py-2">ID / Imóvel</th>
                    <th className="px-4 py-2">Motivo</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {skippedLog.map((log, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium truncate max-w-[200px]" title={log.title}>
                        {log.title || log.id}
                      </td>
                      <td className="px-4 py-2 text-red-600">{log.reason}</td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SEOMigrationScript;