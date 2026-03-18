import React, { useState, useEffect } from 'react';
import { Save, Loader2, Globe, Mail, Phone, MapPin, MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const SiteSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [settings, setSettings] = useState({
    site_name: 'Gil Corretor SP',
    site_description: '',
    contact_email: 'gilfernandesml@gmail.com',
    contact_phone: '11971157373',
    whatsapp_number: '11971157373',
    company_address: ''
  });

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      setFetching(true);
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows found"

      if (data) {
        setSettings({
          site_name: data.site_name || '',
          site_description: data.site_description || '',
          contact_email: data.contact_email || '',
          contact_phone: data.contact_phone || '',
          whatsapp_number: data.whatsapp_number || '',
          company_address: data.company_address || ''
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações.",
        variant: "destructive"
      });
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if settings exist
      const { data: existingData } = await supabase
        .from('site_settings')
        .select('id')
        .eq('user_id', user.id)
        .single();

      let error;
      
      if (existingData) {
        // Update
        const { error: updateError } = await supabase
          .from('site_settings')
          .update({ ...settings, updated_at: new Date() })
          .eq('user_id', user.id);
        error = updateError;
      } else {
        // Insert
        const { error: insertError } = await supabase
          .from('site_settings')
          .insert([{ ...settings, user_id: user.id }]);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Configurações atualizadas com sucesso.",
        className: "bg-green-50 border-green-200"
      });

    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Erro ao salvar",
        description: "Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1a3a52]"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
      
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center space-x-2 border-b pb-4">
          <Globe className="w-5 h-5 text-[#1a3a52]" />
          <h3 className="text-lg font-semibold text-[#1a3a52]">Informações Gerais</h3>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Site / Imobiliária</label>
            <input
              type="text"
              name="site_name"
              value={settings.site_name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a52] outline-none"
              placeholder="Minha Imobiliária"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descrição / Sobre</label>
            <textarea
              name="site_description"
              value={settings.site_description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a52] outline-none resize-none"
              placeholder="Breve descrição sobre a imobiliária..."
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center space-x-2 border-b pb-4">
          <Phone className="w-5 h-5 text-[#1a3a52]" />
          <h3 className="text-lg font-semibold text-[#1a3a52]">Contato</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center"><Mail className="w-4 h-4 mr-1 text-gray-400"/> Email de Contato</span>
            </label>
            <input
              type="email"
              name="contact_email"
              value={settings.contact_email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a52] outline-none"
              placeholder="contato@gilcorretorsp.com.br"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center"><Phone className="w-4 h-4 mr-1 text-gray-400"/> Telefone Fixo</span>
            </label>
            <input
              type="text"
              name="contact_phone"
              value={settings.contact_phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a52] outline-none"
              placeholder="(11) 97115-7373"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center"><MessageSquare className="w-4 h-4 mr-1 text-green-500"/> WhatsApp</span>
            </label>
            <input
              type="text"
              name="whatsapp_number"
              value={settings.whatsapp_number}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a52] outline-none"
              placeholder="5511971157373"
            />
            <p className="text-xs text-gray-500 mt-1">5511971157373 (ex: 5511...)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center"><MapPin className="w-4 h-4 mr-1 text-gray-400"/> Endereço da Empresa</span>
            </label>
            <input
              type="text"
              name="company_address"
              value={settings.company_address}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a52] outline-none"
              placeholder="Chucri Zaidan, 111 - SP"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button 
          type="submit" 
          disabled={loading}
          className="bg-[#1a3a52] hover:bg-[#1a3a52]/90 text-white min-w-[150px] h-12 text-lg"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <Save className="w-5 h-5 mr-2" />
          )}
          Salvar Configurações
        </Button>
      </div>
    </form>
  );
};

export default SiteSettings;