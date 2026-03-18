import React, { useState, useEffect } from 'react';
import { Save, Loader2, Upload, Layout, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const HomePageSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const [settings, setSettings] = useState({
    hero_title: '',
    hero_subtitle: '',
    hero_description: '',
    hero_image_url: '',
    cta_button_text: '',
    cta_button_link: ''
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
        .from('home_page_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          hero_title: data.hero_title || '',
          hero_subtitle: data.hero_subtitle || '',
          hero_description: data.hero_description || '',
          hero_image_url: data.hero_image_url || '',
          cta_button_text: data.cta_button_text || '',
          cta_button_link: data.cta_button_link || ''
        });
      }
    } catch (error) {
      console.error('Error fetching home page settings:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações da página inicial.",
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

  const handleImageUpload = async (e) => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('home-page-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('home-page-images')
        .getPublicUrl(filePath);

      setSettings(prev => ({ ...prev, hero_image_url: publicUrl }));
      
      toast({
        title: "Sucesso",
        description: "Imagem enviada com sucesso!",
        className: "bg-green-50 border-green-200"
      });

    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar a imagem. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if settings exist for this user
      const { data: existingData } = await supabase
        .from('home_page_settings')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      let error;
      
      const payload = {
        ...settings,
        user_id: user.id,
        updated_at: new Date()
      };

      if (existingData) {
        const { error: updateError } = await supabase
          .from('home_page_settings')
          .update(payload)
          .eq('user_id', user.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('home_page_settings')
          .insert([payload]);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Página inicial atualizada com sucesso.",
        className: "bg-green-50 border-green-200"
      });

    } catch (error) {
      console.error('Error saving home page settings:', error);
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
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
      
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center space-x-2 border-b pb-4">
          <Layout className="w-5 h-5 text-[#1a3a52]" />
          <h3 className="text-lg font-semibold text-[#1a3a52]">Seção Hero (Topo)</h3>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Título Principal</label>
            <input
              type="text"
              name="hero_title"
              value={settings.hero_title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a52] outline-none"
              placeholder="Ex: Encontre o imóvel ideal em São Paulo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subtítulo / Slogan</label>
            <input
              type="text"
              name="hero_subtitle"
              value={settings.hero_subtitle}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a52] outline-none"
              placeholder="Ex: Os melhores apartamentos nos bairros mais valorizados"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descrição Adicional</label>
            <textarea
              name="hero_description"
              value={settings.hero_description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a52] outline-none resize-none"
              placeholder="Texto de apoio abaixo do título..."
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center space-x-2 border-b pb-4">
          <ImageIcon className="w-5 h-5 text-[#1a3a52]" />
          <h3 className="text-lg font-semibold text-[#1a3a52]">Imagem de Fundo</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-4">
             <div className="flex-grow">
                <label className="block text-sm font-medium text-gray-700 mb-2">URL da Imagem</label>
                <input
                  type="text"
                  name="hero_image_url"
                  value={settings.hero_image_url}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a52] outline-none"
                  placeholder="https://..."
                />
             </div>
             <div className="flex-shrink-0 pt-7">
                <div className="relative">
                  <input
                    type="file"
                    id="hero-image-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                  <label 
                    htmlFor="hero-image-upload"
                    className={`flex items-center justify-center px-4 py-2 border border-[#1a3a52] rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    Upload
                  </label>
                </div>
             </div>
          </div>

          {settings.hero_image_url && (
            <div className="mt-4 relative w-full h-48 rounded-lg overflow-hidden border border-gray-200">
              <img 
                src={settings.hero_image_url} 
                alt="Preview Hero" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <p className="text-white font-medium bg-black/50 px-3 py-1 rounded">Pré-visualização</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center space-x-2 border-b pb-4">
          <LinkIcon className="w-5 h-5 text-[#1a3a52]" />
          <h3 className="text-lg font-semibold text-[#1a3a52]">Botão de Ação (CTA)</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Texto do Botão</label>
            <input
              type="text"
              name="cta_button_text"
              value={settings.cta_button_text}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a52] outline-none"
              placeholder="Ex: Fale com o Corretor"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Link do Botão</label>
            <input
              type="text"
              name="cta_button_link"
              value={settings.cta_button_link}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a3a52] outline-none"
              placeholder="Ex: /imoveis ou https://wa.me/..."
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
          Salvar Alterações
        </Button>
      </div>
    </form>
  );
};

export default HomePageSettings;