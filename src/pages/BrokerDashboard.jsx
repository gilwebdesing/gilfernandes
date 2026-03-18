import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Star, Users, Home as HomeIcon, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import PropertyForm from '@/components/admin/PropertyForm';
import BrokerProfileEditModal from '@/components/broker/BrokerProfileEditModal';
import { ensureBrokerExists } from '@/lib/ensureBrokerExists';

const BrokerDashboard = () => {
  const { user, broker: authBroker } = useAuth();
  const [currentBroker, setCurrentBroker] = useState(authBroker);
  const [properties, setProperties] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // View State
  const [viewState, setViewState] = useState('list'); // 'list', 'create', 'edit'
  const [editProperty, setEditProperty] = useState(null);
  
  // Deletion State
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Profile Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    // If authBroker updates in context, update local state
    if (authBroker) {
      setCurrentBroker(authBroker);
    }
  }, [authBroker]);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      if (user?.id) {
        try {
          // Robustly ensure broker profile exists
          const brokerData = await ensureBrokerExists(user.id, user.email, user.user_metadata?.name);
          
          if (brokerData) {
            setCurrentBroker(brokerData);
            await Promise.all([
               fetchProperties(brokerData.id),
               fetchLeads(brokerData.id)
            ]);
          }
        } catch (err) {
          console.error("Dashboard load error:", err);
          toast({
            title: "Erro ao carregar dados",
            description: "Não foi possível carregar suas informações. Tente recarregar a página.",
            variant: "destructive"
          });
        }
      }
      setLoading(false);
    };

    loadDashboardData();
  }, [user]);

  const fetchProperties = async (brokerId) => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('broker_id', brokerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const fetchLeads = async (brokerId) => {
    try {
      const { data: propertiesData } = await supabase
        .from('properties')
        .select('id')
        .eq('broker_id', brokerId);

      if (propertiesData && propertiesData.length > 0) {
        const propertyIds = propertiesData.map(p => p.id);
        
        const { data, error } = await supabase
          .from('leads')
          .select(`
            *,
            property:properties(title, neighborhood)
          `)
          .in('property_id', propertyIds)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setLeads(data || []);
      } else {
        setLeads([]);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
  };

  const handleProfileUpdateSuccess = (updatedBroker) => {
    setCurrentBroker(updatedBroker);
    toast({
      title: "Perfil Atualizado",
      description: "Suas informações foram salvas com sucesso.",
    });
  };

  const handleEditClick = (property) => {
    setEditProperty(property);
    setViewState('edit');
  };

  const handleDeleteClick = (id) => {
    setPropertyToDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (!propertyToDelete) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyToDelete);

      if (error) throw error;

      toast({
        title: "Imóvel excluído",
        description: "O imóvel foi removido com sucesso.",
      });

      if (currentBroker?.id) {
        fetchProperties(currentBroker.id);
      }
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setPropertyToDelete(null);
    }
  };

  const handleFormSuccess = () => {
    setViewState('list');
    setEditProperty(null);
    if (currentBroker?.id) {
      fetchProperties(currentBroker.id);
    }
  };

  const toggleFeatured = async (property) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ featured: !property.featured })
        .eq('id', property.id);

      if (error) throw error;

      toast({
        title: property.featured ? "Removido dos destaques" : "Adicionado aos destaques",
      });

      if (currentBroker?.id) {
        fetchProperties(currentBroker.id);
      }
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatPrice = (price) => {
    // R$ X.XXX,XX
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <>
      <Helmet>
        <title>Dashboard Corretor | Imóveis SP</title>
      </Helmet>

      <div className="min-h-screen bg-[#f5f7fa] pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-[#1a3a52]">Dashboard</h1>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full h-9 w-9 border-gray-300 hover:bg-gray-100"
                  onClick={() => setIsEditModalOpen(true)}
                  title="Editar Perfil"
                >
                  <Settings className="h-5 w-5 text-gray-600" />
                </Button>
              </div>
              <p className="text-gray-600">Bem-vindo, <span className="font-semibold">{currentBroker?.name || user?.email}</span></p>
            </div>
          </div>

          {/* Stats Cards */}
          {viewState === 'list' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Meus Imóveis</p>
                    <p className="text-3xl font-bold text-[#1a3a52]">{properties.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-[#0d5a7a]/10 rounded-full flex items-center justify-center">
                    <HomeIcon className="w-6 h-6 text-[#0d5a7a]" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Leads Recebidos</p>
                    <p className="text-3xl font-bold text-[#1a3a52]">{leads.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Imóveis em Destaque</p>
                    <p className="text-3xl font-bold text-[#1a3a52]">
                      {properties.filter(p => p.featured).length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Content Area */}
          {viewState === 'create' ? (
             <div className="mb-8">
               <div className="flex items-center justify-between mb-6">
                 <h2 className="text-2xl font-bold text-[#1a3a52]">Novo Imóvel</h2>
                 <Button variant="outline" onClick={() => setViewState('list')}>Cancelar</Button>
               </div>
               <PropertyForm mode="create" onSuccess={handleFormSuccess} />
             </div>
          ) : viewState === 'edit' ? (
             <div className="mb-8">
               <div className="flex items-center justify-between mb-6">
                 <h2 className="text-2xl font-bold text-[#1a3a52]">Editar Imóvel</h2>
                 <Button variant="outline" onClick={() => { setViewState('list'); setEditProperty(null); }}>Cancelar</Button>
               </div>
               <PropertyForm mode="edit" initialData={editProperty} onSuccess={handleFormSuccess} />
             </div>
          ) : (
            /* List View with Tabs */
            <Tabs defaultValue="properties" className="space-y-6">
              <TabsList className="bg-white p-1 rounded-lg shadow-md">
                <TabsTrigger value="properties" className="data-[state=active]:bg-[#0d5a7a] data-[state=active]:text-white">
                  Meus Imóveis
                </TabsTrigger>
                <TabsTrigger value="leads" className="data-[state=active]:bg-[#0d5a7a] data-[state=active]:text-white">
                  Leads
                </TabsTrigger>
              </TabsList>

              <TabsContent value="properties">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-[#1a3a52]">Meus Imóveis</h2>
                    <Button
                      onClick={() => setViewState('create')}
                      className="bg-[#0d5a7a] hover:bg-[#0d5a7a]/90"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Adicionar Imóvel
                    </Button>
                  </div>

                  {loading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d5a7a]"></div>
                    </div>
                  ) : properties.length > 0 ? (
                    <div className="space-y-4">
                      {properties.map((property) => (
                        <motion.div
                          key={property.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex flex-col md:flex-row gap-4">
                            <img
                              src={property.images?.[0] || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914'}
                              alt={property.title}
                              className="w-full md:w-32 h-32 object-cover rounded-lg"
                            />
                            
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="text-lg font-bold text-[#1a3a52]">{property.title}</h3>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant={property.featured ? "default" : "outline"}
                                    onClick={() => toggleFeatured(property)}
                                    title={property.featured ? "Remover destaque" : "Destacar"}
                                  >
                                    <Star className={`w-4 h-4 ${property.featured ? 'fill-current' : ''}`} />
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => handleEditClick(property)}>
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDeleteClick(property.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                              
                              <p className="text-sm text-gray-600 mb-2">
                                {property.neighborhood}, {property.location}
                              </p>
                              
                              <div className="flex flex-wrap gap-4 text-sm">
                                {property.price && (
                                  <span className="font-semibold text-[#0d5a7a]">
                                    Venda: {formatPrice(property.price)}
                                  </span>
                                )}
                                {property.rental_price && (
                                  <span className="font-semibold text-[#0d5a7a]">
                                    Aluguel: {formatPrice(property.rental_price)}/mês
                                  </span>
                                )}
                                <span className="text-gray-600">Status: {property.status}</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-600 mb-4">Você ainda não cadastrou nenhum imóvel.</p>
                      <Button onClick={() => setViewState('create')} className="bg-[#0d5a7a] hover:bg-[#0d5a7a]/90">
                        <Plus className="w-5 h-5 mr-2" />
                        Adicionar Primeiro Imóvel
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="leads">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-2xl font-bold text-[#1a3a52] mb-6">Leads Recebidos</h2>
                  {/* Lead content remains the same */}
                  {leads.length > 0 ? (
                    <div className="space-y-4">
                      {leads.map((lead) => (
                        <div key={lead.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-bold text-[#1a3a52]">{lead.name}</h3>
                              <p className="text-sm text-gray-600">
                                Interesse em: {lead.property?.title || 'Imóvel removido'}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                              lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                              lead.status === 'converted' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {lead.status === 'new' ? 'Novo' :
                               lead.status === 'contacted' ? 'Contatado' :
                               lead.status === 'converted' ? 'Convertido' : 'Perdido'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Recebido em: {new Date(lead.created_at).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-600">Nenhum lead recebido ainda.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>

      <ConfirmationDialog
        isOpen={!!propertyToDelete}
        onClose={() => setPropertyToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Excluir Imóvel"
        description="Tem certeza que deseja excluir este imóvel? Esta ação não pode ser desfeita."
        isLoading={isDeleting}
      />

      {currentBroker && (
        <BrokerProfileEditModal 
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          broker={currentBroker}
          onSuccess={handleProfileUpdateSuccess}
        />
      )}
    </>
  );
};

export default BrokerDashboard;