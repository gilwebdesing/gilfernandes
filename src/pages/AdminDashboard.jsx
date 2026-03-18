
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, PlusCircle, Settings, Layout, Upload, Search, Database, Trash2, Loader2 } from 'lucide-react';
import PropertyManagement from '@/components/admin/PropertyManagement';
import PropertyForm from '@/components/admin/PropertyForm';
import SiteSettings from '@/components/admin/SiteSettings';
import HomePageSettings from '@/components/admin/HomePageSettings';
import PropertyImportPage from '@/components/admin/PropertyImportPage';
import SEOStatusDashboard from '@/components/admin/SEOStatusDashboard';
import SEOMigrationScript from '@/components/admin/SEOMigrationScript';
import DataExportSection from '@/components/admin/DataExportSection';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { useAuth } from '@/context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { deletePropertiesWithoutDescription } from '@/utils/deleteEmptyProperties';

const AdminDashboard = ({ initialTab = "properties" }) => {
  const { user, broker } = useAuth();
  const [searchParams] = useSearchParams();
  const [currentTab, setCurrentTab] = useState(initialTab);
  const [refreshCounter, setRefreshCounter] = useState(0);
  
  // State management as requested
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  
  const { toast } = useToast();

  // Admin-Only Access Verification
  const isAdmin = user?.email === 'gilfernandesml@gmail.com';

  useEffect(() => {
    setCurrentTab(initialTab);
  }, [initialTab]);

  const handleCleanDemoProperties = async () => {
    setIsDeleting(true);
    try {
      const { deletedCount, errors } = await deletePropertiesWithoutDescription();
      
      if (errors && errors.length > 0) {
        toast({
          title: "Atenção",
          description: `${deletedCount} propriedades deletadas, mas ocorreram ${errors.length} erros.`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Sucesso!",
          description: `${deletedCount} propriedades de demonstração foram excluídas com sucesso!`,
          className: "bg-green-50 border-green-200"
        });
      }
      
      // Trigger a refresh for the PropertyManagement component
      setRefreshCounter(prev => prev + 1);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao limpar propriedades de demonstração: " + error.message,
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirmation(false);
    }
  };
  
  return (
    <>
      <Helmet>
        <title>Dashboard Admin | Imóveis SP</title>
      </Helmet>

      <div className="min-h-screen pt-24 pb-12 bg-[#f5f7fa] px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold text-[#1a3a52]">Olá, {broker?.name || user?.email}</h1>
              <p className="text-gray-600 mt-2">Gerencie seus imóveis, SEO e configurações do site.</p>
            </div>
            
            {/* Clean Demo Properties Button - Visible only to admin */}
            {isAdmin && (
              <Button 
                variant="destructive" 
                onClick={() => setShowDeleteConfirmation(true)}
                disabled={isDeleting}
                className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 shadow-sm"
              >
                {isDeleting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Limpando...</>
                ) : (
                  <><Trash2 className="w-4 h-4 mr-2" /> Clean Demo Properties</>
                )}
              </Button>
            )}
          </motion.div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 min-h-[600px] overflow-hidden">
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
              <div className="border-b border-gray-100 bg-gray-50/50 p-1">
                <TabsList className="w-full justify-start h-auto bg-transparent p-0 gap-2 overflow-x-auto flex-nowrap">
                  <TabsTrigger 
                    value="properties" 
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#1a3a52] px-6 py-3 rounded-lg text-gray-600 font-medium transition-all whitespace-nowrap"
                  >
                    <Building2 className="w-4 h-4 mr-2" /> Meus Imóveis
                  </TabsTrigger>
                  <TabsTrigger 
                    value="add-property" 
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#1a3a52] px-6 py-3 rounded-lg text-gray-600 font-medium transition-all whitespace-nowrap"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" /> Adicionar Imóvel
                  </TabsTrigger>
                   <TabsTrigger 
                    value="seo" 
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#1a3a52] px-6 py-3 rounded-lg text-gray-600 font-medium transition-all whitespace-nowrap"
                  >
                    <Search className="w-4 h-4 mr-2" /> Gestão SEO
                  </TabsTrigger>
                  <TabsTrigger 
                    value="import-property" 
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#1a3a52] px-6 py-3 rounded-lg text-gray-600 font-medium transition-all whitespace-nowrap"
                  >
                    <Upload className="w-4 h-4 mr-2" /> Importar CSV
                  </TabsTrigger>
                  <TabsTrigger 
                    value="export" 
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#1a3a52] px-6 py-3 rounded-lg text-gray-600 font-medium transition-all whitespace-nowrap"
                  >
                    <Database className="w-4 h-4 mr-2" /> Backup / Export
                  </TabsTrigger>
                  <TabsTrigger 
                    value="homepage" 
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#1a3a52] px-6 py-3 rounded-lg text-gray-600 font-medium transition-all whitespace-nowrap"
                  >
                    <Layout className="w-4 h-4 mr-2" /> Página Principal
                  </TabsTrigger>
                  <TabsTrigger 
                    value="settings" 
                    className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#1a3a52] px-6 py-3 rounded-lg text-gray-600 font-medium transition-all whitespace-nowrap"
                  >
                    <Settings className="w-4 h-4 mr-2" /> Configurações
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6">
                <TabsContent value="properties" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                  <PropertyManagement refreshTrigger={refreshCounter} />
                </TabsContent>
                
                <TabsContent value="add-property" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                  <PropertyForm mode="create" />
                </TabsContent>

                <TabsContent value="seo" className="mt-0 focus-visible:outline-none focus-visible:ring-0 space-y-8">
                   <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-gray-800">Status Geral do SEO</h2>
                      <SEOStatusDashboard />
                   </div>
                   
                   <div className="border-t pt-8">
                      <h2 className="text-xl font-semibold text-gray-800 mb-4">Ferramentas de Migração</h2>
                      <SEOMigrationScript />
                   </div>
                </TabsContent>

                <TabsContent value="import-property" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                  <PropertyImportPage />
                </TabsContent>
                
                <TabsContent value="export" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                  <DataExportSection />
                </TabsContent>

                <TabsContent value="homepage" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                  <HomePageSettings />
                </TabsContent>
                
                <TabsContent value="settings" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                  <SiteSettings />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={handleCleanDemoProperties}
        title="Limpar Propriedades de Demonstração?"
        description="This will permanently delete all demo properties (properties without descriptions). The properties you created will be kept. Continue?"
        isLoading={isDeleting}
        confirmText="Sim, Deletar"
        cancelText="Cancelar"
      />
    </>
  );
};

export default AdminDashboard;
