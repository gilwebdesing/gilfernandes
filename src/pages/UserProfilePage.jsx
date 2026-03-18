import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { User, Heart, Calendar, LogOut, Settings, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';

const UserProfilePage = () => {
  const { user, logout, broker } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('favorites');
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch Favorites with Property details
      const { data: favData, error: favError } = await supabase
        .from('favorites')
        .select(`
          id,
          property:properties(*)
        `)
        .eq('user_id', user.id);

      if (favError) throw favError;
      setFavorites(favData?.map(f => f.property) || []);

      // Fetch Scheduled Visits (Leads submitted by this user)
      // Assuming we identify user leads by email since leads table doesn't always strictly link to user_id in all schemas, 
      // but if user is logged in we use email matching for better reliability or assume schema.
      // Based on provided schema, 'leads' has no user_id, only broker_id. We must match by email.
      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .select(`
          *,
          property:properties(*)
        `)
        .eq('email', user.email)
        .order('created_at', { ascending: false });

      if (leadError) throw leadError;
      setLeads(leadData || []);

    } catch (error) {
      console.error('Error fetching profile data:', error);
      toast({
        title: "Erro ao carregar perfil",
        description: "Não foi possível carregar suas informações.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (!user) return null;

  return (
    <>
      <Helmet>
        <title>Meu Perfil | Imóveis SP</title>
      </Helmet>

      <div className="min-h-screen bg-[#f5f7fa] pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Sidebar Profile Card */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 text-center sticky top-24">
                <div className="w-24 h-24 bg-[#1a3a52] rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                  {broker?.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-xl font-bold text-[#1a3a52] mb-1">{broker?.name || 'Usuário'}</h2>
                <p className="text-gray-500 text-sm mb-6">{user.email}</p>
                
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" /> Editar Perfil
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" /> Sair da Conta
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="md:col-span-3 space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div 
                  onClick={() => setActiveTab('favorites')}
                  className={`bg-white p-6 rounded-xl shadow-md cursor-pointer transition-all ${activeTab === 'favorites' ? 'ring-2 ring-[#ff8c42]' : 'hover:shadow-lg'}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">Favoritos</p>
                      <h3 className="text-3xl font-bold text-[#1a3a52]">{favorites.length}</h3>
                    </div>
                    <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                      <Heart className="w-5 h-5 text-red-500" />
                    </div>
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('visits')}
                  className={`bg-white p-6 rounded-xl shadow-md cursor-pointer transition-all ${activeTab === 'visits' ? 'ring-2 ring-[#ff8c42]' : 'hover:shadow-lg'}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">Visitas Agendadas</p>
                      <h3 className="text-3xl font-bold text-[#1a3a52]">{leads.length}</h3>
                    </div>
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-[#1a3a52]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tab Content */}
              <div className="bg-white rounded-2xl shadow-lg p-6 min-h-[400px]">
                <h3 className="text-xl font-bold text-[#1a3a52] mb-6 flex items-center">
                  {activeTab === 'favorites' ? <Heart className="w-5 h-5 mr-2 text-red-500" /> : <Calendar className="w-5 h-5 mr-2 text-[#1a3a52]" />}
                  {activeTab === 'favorites' ? 'Meus Imóveis Favoritos' : 'Minhas Visitas Agendadas'}
                </h3>

                {loading ? (
                   <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a3a52]"></div></div>
                ) : activeTab === 'favorites' ? (
                  favorites.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {favorites.map(prop => (
                        <div key={prop.id} className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                          <img src={prop.images?.[0]} alt={prop.title} className="w-full h-40 object-cover" />
                          <div className="p-4">
                            <h4 className="font-bold text-[#1a3a52] truncate">{prop.title}</h4>
                            <p className="text-[#0d5a7a] font-bold text-sm mt-1">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(prop.price || prop.rental_price)}
                            </p>
                            <Link to={`/imovel/${prop.id}`}>
                              <Button size="sm" variant="outline" className="w-full mt-3">Ver Detalhes</Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">Você ainda não tem imóveis favoritos.</div>
                  )
                ) : (
                  leads.length > 0 ? (
                    <div className="space-y-4">
                      {leads.map(lead => (
                        <div key={lead.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg mr-4 overflow-hidden">
                                {lead.property?.images?.[0] && <img src={lead.property.images[0]} className="w-full h-full object-cover" alt="" />}
                            </div>
                            <div>
                              <p className="font-bold text-[#1a3a52]">{lead.property?.title || 'Imóvel Indisponível'}</p>
                              <p className="text-xs text-gray-500">Solicitado em: {new Date(lead.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                            lead.status === 'new' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {lead.status === 'new' ? 'Aguardando' : lead.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">Nenhuma visita agendada.</div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfilePage;