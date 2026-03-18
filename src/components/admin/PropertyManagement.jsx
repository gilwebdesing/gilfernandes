
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Trash2, MapPin, Home, DollarSign } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import PropertyForm from './PropertyForm';

const PropertyManagement = ({ refreshTrigger }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [editingProperty, setEditingProperty] = useState(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchProperties();
    }
  }, [user, refreshTrigger]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('broker_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus imóveis.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;

      setProperties(properties.filter(p => p.id !== deleteId));
      toast({
        title: "Sucesso",
        description: "Imóvel excluído com sucesso.",
        className: "bg-green-50 border-green-200"
      });
    } catch (error) {
      console.error('Error deleting property:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o imóvel.",
        variant: "destructive"
      });
    } finally {
      setDeleteId(null);
    }
  };

  if (editingProperty) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#1a3a52]">Editar Imóvel</h2>
          <Button variant="outline" onClick={() => setEditingProperty(null)}>
            Voltar para Lista
          </Button>
        </div>
        <PropertyForm 
          mode="edit" 
          initialData={editingProperty} 
          onSuccess={() => {
            setEditingProperty(null);
            fetchProperties();
          }} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-[#1a3a52]">Gerenciar Imóveis</h2>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium">
          Total: {properties.length} Imóveis
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1a3a52]"></div>
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Nenhum imóvel cadastrado</h3>
          <p className="text-gray-500 mt-1">Comece adicionando seu primeiro imóvel na aba "Adicionar Imóvel"</p>
        </div>
      ) : (
        <div className="grid gap-4">
          <AnimatePresence>
            {properties.map((property) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow flex flex-col md:flex-row gap-4 items-start md:items-center"
              >
                <div className="w-full md:w-32 h-32 md:h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {property.images && property.images[0] ? (
                    <img 
                      src={property.images[0]} 
                      alt={property.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Home className="w-8 h-8" />
                    </div>
                  )}
                </div>

                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      property.status === 'active' || property.status === 'available' ? 'bg-green-100 text-green-700' : 
                      property.status === 'sold' ? 'bg-red-100 text-red-700' : 
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {property.status === 'active' || property.status === 'available' ? 'Disponível' : 
                       property.status === 'sold' ? 'Vendido' : 'Alugado/Inativo'}
                    </span>
                    <span className="text-xs text-gray-500 font-medium uppercase">{property.type}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#1a3a52] truncate">{property.title}</h3>
                  <div className="flex items-center text-gray-500 text-sm mt-1">
                    <MapPin className="w-3 h-3 mr-1" />
                    {property.neighborhood}
                  </div>
                  <div className="flex items-center text-[#0d5a7a] font-bold mt-2">
                    <DollarSign className="w-4 h-4 mr-1" />
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(property.price || property.rental_price)}
                  </div>
                </div>

                <div className="flex md:flex-col gap-2 w-full md:w-auto mt-2 md:mt-0">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1 md:flex-none border-gray-300 text-gray-700 hover:bg-gray-50"
                    onClick={() => setEditingProperty(property)}
                  >
                    <Edit2 className="w-4 h-4 mr-2" /> Editar
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    className="flex-1 md:flex-none bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"
                    onClick={() => setDeleteId(property.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Excluir
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <ConfirmationDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Você tem certeza?"
        description="Esta ação não pode ser desfeita. Isso excluirá permanentemente o imóvel e removerá seus dados de nossos servidores."
        isLoading={loading && !!deleteId}
      />
    </div>
  );
};

export default PropertyManagement;
