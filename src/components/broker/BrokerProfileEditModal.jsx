import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { Loader2, User, Camera, UploadCloud } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const BrokerProfileEditModal = ({ isOpen, onClose, broker, onSuccess }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    company: '',
    bio: '',
    profile_image: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Sync state when modal opens or broker changes
  useEffect(() => {
    if (broker && isOpen) {
      setFormData({
        name: broker.name || '',
        email: broker.email || '',
        phone: broker.phone || '',
        whatsapp: broker.whatsapp || '',
        company: broker.company || '',
        bio: broker.bio || '',
        profile_image: broker.profile_image || ''
      });
      setImagePreview(broker.profile_image || '');
      setImageFile(null);
    }
  }, [broker, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast({ 
          title: "Formato inválido", 
          description: "Por favor, selecione uma imagem JPG, PNG ou WebP.", 
          variant: "destructive" 
        });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) { 
        toast({
          title: "Arquivo muito grande",
          description: "A imagem deve ter no máximo 5MB.",
          variant: "destructive"
        });
        return;
      }
      
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file, userId) => {
    // Unique filename: timestamp + random string
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`; // Upload directly to root or a folder if preferred

    setUploadingImage(true);
    try {
      // Upload to 'broker-profiles' bucket as requested
      const { error: uploadError } = await supabase.storage
        .from('broker-profiles') 
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('broker-profiles')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Upload Error:', error);
      throw new Error("Falha no upload da imagem. Tente novamente.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (!formData.name.trim() || !formData.email.trim()) {
        throw new Error('Nome e Email são obrigatórios.');
      }

      if (!user || !user.id) {
        throw new Error("Usuário não autenticado.");
      }

      let profileImageUrl = formData.profile_image;

      // Handle Image Upload
      if (imageFile) {
        profileImageUrl = await uploadImage(imageFile, user.id);
      }

      const updates = {
        id: user.id, // Explicit ID for safety
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        company: formData.company,
        bio: formData.bio,
        profile_image: profileImageUrl,
        updated_at: new Date().toISOString()
      };

      // Upsert to handle both insert (if missing) and update
      const { error } = await supabase
        .from('brokers')
        .upsert(updates)
        .eq('id', user.id);

      if (error) throw error;

      // Notify parent component
      if (onSuccess) {
        onSuccess(updates);
      }
      
      onClose();
      toast({
        title: "Sucesso!",
        description: "Perfil atualizado com sucesso.",
        className: "bg-green-50 border-green-200"
      });
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Erro ao atualizar",
        description: error.message || "Ocorreu um erro ao salvar seu perfil.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Image Upload Section */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative group cursor-pointer w-32 h-32">
              <div className="w-full h-full rounded-full overflow-hidden border-4 border-gray-100 bg-gray-100 flex items-center justify-center shadow-md relative">
                {uploadingImage ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                ) : null}
                
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-gray-400" />
                )}
              </div>
              
              <label 
                htmlFor="profile-image-upload" 
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer z-10"
              >
                <Camera className="w-8 h-8 mb-1" />
                <span className="text-xs font-medium">Alterar Foto</span>
              </label>
              
              <input 
                id="profile-image-upload"
                type="file" 
                accept="image/jpeg, image/png, image/webp"
                className="hidden"
                onChange={handleImageChange}
                disabled={loading || uploadingImage}
              />
            </div>
            
            <div className="text-center">
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => document.getElementById('profile-image-upload').click()}
                disabled={loading}
              >
                <UploadCloud className="w-4 h-4 mr-2" />
                Selecionar Foto
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Formatos aceitos: JPG, PNG, WebP (Max 5MB)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(00) 0000-0000"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
                disabled={loading}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="company">Empresa / Imobiliária</Label>
              <Input
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Nome da sua empresa"
                disabled={loading}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="bio">Biografia</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Conte um pouco sobre sua experiência..."
                disabled={loading}
                className="min-h-[100px] resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-[#1a3a52] text-white hover:bg-[#1a3a52]/90">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BrokerProfileEditModal;