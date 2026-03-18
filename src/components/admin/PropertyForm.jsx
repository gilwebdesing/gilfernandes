import React, { useState, useEffect } from 'react';
import { 
  Save, Loader2, AlertCircle, 
  Layout, Home, Image as ImageIcon, ListChecks, Contact, FileText, Search, Sparkles
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ensureBrokerExists } from '@/lib/ensureBrokerExists';
import ImageGalleryDragDrop from '@/components/admin/ImageGalleryDragDrop';
import FileUpload from '@/components/admin/FileUpload';
import PropertyDescriptionEditor from '@/components/PropertyDescriptionEditor';
import GenerateDescriptionButton from '@/components/GenerateDescriptionButton';
import SEOPreview from '@/components/admin/SEOPreview';
import { generateSlug } from '@/lib/slugGenerator';
import { validatePropertyForm, validateSEOFields } from '@/lib/propertyFormValidation';
import { useSEOGeneration } from '@/hooks/useSEOGeneration';
import { cn } from '@/lib/utils';

const AMENITIES_LIST = [
  "Piscina adulto",
  "Piscina infantil",
  "Piscina Aquecida (coberta)",
  "Academia",
  "Salão de Festas",
  "Espaço Gourmet",
  "Coworking",
  "Spa",
  "Sauna",
  "Sala de massagem",
  "Sala de Jogos",
  "Lavanderia",
  "Espaço Pet",
  "Lazer no Rooftop",
  "Espaço Mulher",
  "Quadra",
  "Quadra de Tênis",
  "Mini Mercadinho",
  "Churrasqueira"
];

const PropertyForm = ({ mode = 'create', initialData = null, onSuccess }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { generateSEOForProperty } = useSEOGeneration();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [slugStatus, setSlugStatus] = useState('idle');
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingPlans, setUploadingPlans] = useState(false);
  const [imageInput, setImageInput] = useState('');
  
  // Real-time SEO Feedback
  const [seoWarnings, setSeoWarnings] = useState([]);

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    neighborhood: initialData?.neighborhood || '',
    address: initialData?.address || '',
    location: initialData?.location || '', 
    lat: initialData?.lat || '',
    lng: initialData?.lng || '',
    
    business_type: initialData?.business_type || '', 
    price: initialData?.price || '',
    rental_price: initialData?.rental_price || '',
    starting_from_price: initialData?.starting_from_price || '',
    type: initialData?.type || 'apartment',
    property_status: initialData?.property_status || 'ready',
    bedrooms: initialData?.bedrooms || '',
    bathrooms: initialData?.bathrooms || '',
    suites: initialData?.suites || '',
    parking_spaces: initialData?.parking_spaces || '',
    area: initialData?.area || '',
    
    images: initialData?.images || [],
    video_url: initialData?.video_url || initialData?.youtube_url || '',
    virtual_tour_url: initialData?.virtual_tour_url || '',
    plans_urls: initialData?.plans_urls || initialData?.floor_plans || [],
    featured: initialData?.featured || false,
    
    amenities: initialData?.amenities || [],
    status: initialData?.status || 'active',

    // SEO Fields
    meta_title: initialData?.meta_title || '',
    meta_description: initialData?.meta_description || ''
  });

  // Ensure plans_urls is always an array of strings
  useEffect(() => {
    if (formData.plans_urls && formData.plans_urls.length > 0) {
      const normalizedPlans = formData.plans_urls.map(p => (typeof p === 'string' ? p : p.url));
      if (JSON.stringify(normalizedPlans) !== JSON.stringify(formData.plans_urls)) {
         setFormData(prev => ({ ...prev, plans_urls: normalizedPlans }));
      }
    }
  }, []);

  // Update SEO Warnings in real-time
  useEffect(() => {
    const { warnings } = validateSEOFields(formData.meta_title, formData.meta_description);
    setSeoWarnings(warnings);
  }, [formData.meta_title, formData.meta_description]);

  // Generate slug automatically
  useEffect(() => {
    if (mode === 'create' && formData.title && !formData.slug) {
       const newSlug = generateSlug(formData.title);
       setFormData(prev => ({ ...prev, slug: newSlug }));
    }
  }, [formData.title, mode]);

  // Check slug availability
  useEffect(() => {
    const checkSlug = async () => {
      if (!formData.slug) return;
      setSlugStatus('checking');
      try {
        const { data, error } = await supabase.from('properties').select('id').eq('slug', formData.slug).neq('id', initialData?.id || '00000000-0000-0000-0000-000000000000').maybeSingle();
        if (error) throw error;
        setSlugStatus(data ? 'taken' : 'available');
      } catch (err) { console.error(err); }
    };
    const timeoutId = setTimeout(() => { if (formData.slug) checkSlug(); }, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.slug, initialData?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBusinessTypeChange = (value) => {
    setFormData(prev => ({ ...prev, business_type: value }));
  };

  const handleDescriptionChange = (content) => {
    setFormData(prev => ({ ...prev, description: content }));
  };

  const handleAmenityChange = (amenity, isChecked) => {
    setFormData(prev => {
      const current = prev.amenities || [];
      if (isChecked) {
        return { ...prev, amenities: [...current, amenity] };
      } else {
        return { ...prev, amenities: current.filter(a => a !== amenity) };
      }
    });
  };

  // SEO Generation Handler
  const handleGenerateSEO = () => {
    const { title, description, errors } = generateSEOForProperty(formData);
    
    if (errors.length > 0) {
      toast({
        title: "Impossível gerar SEO",
        description: `Faltam dados: ${errors.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      meta_title: title,
      meta_description: description
    }));

    toast({
      title: "SEO Gerado",
      description: "Título e descrição atualizados com sucesso.",
      className: "bg-blue-50 border-blue-200"
    });
  };

  const handleImageUpload = async (e, field = 'images') => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    const isPlans = field === 'plans_urls';
    isPlans ? setUploadingPlans(true) : setUploadingImages(true);

    try {
      const newImages = [];
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${isPlans ? 'plan_' : 'prop_'}${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const { error } = await supabase.storage.from('property-images').upload(fileName, file);
        if (error) throw error;
        const { data } = supabase.storage.from('property-images').getPublicUrl(fileName);
        newImages.push(data.publicUrl);
      }
      setFormData(prev => ({ ...prev, [field]: [...prev[field], ...newImages] }));
    } catch (error) {
      toast({ title: "Erro no upload", description: "Falha ao enviar arquivos.", variant: "destructive" });
    } finally {
      isPlans ? setUploadingPlans(false) : setUploadingImages(false);
    }
  };

  const addImageUrl = () => {
    if (imageInput.trim()) {
      setFormData(prev => ({ ...prev, images: [...prev.images, imageInput.trim()] }));
      setImageInput('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) return;
    
    if (slugStatus === 'taken') {
        toast({ title: "Slug indisponível", variant: "destructive" });
        return;
    }

    // Auto-generate SEO if empty before validating
    let payload = { ...formData };
    if (!payload.meta_title || !payload.meta_description) {
        const { title, description } = generateSEOForProperty(payload);
        if (title && description) {
           payload.meta_title = payload.meta_title || title;
           payload.meta_description = payload.meta_description || description;
           toast({ title: "SEO Automático", description: "Campos de SEO vazios foram preenchidos." });
        }
    }

    const { isValid, errors } = validatePropertyForm(payload);
    if (!isValid) {
        toast({ 
            title: "Erro de validação", 
            description: (
                <ul className="list-disc pl-4">
                    {errors.map((err, i) => <li key={i}>{err}</li>)}
                </ul>
            ), 
            variant: "destructive" 
        });
        return;
    }

    setLoading(true);

    try {
      await ensureBrokerExists(user.id, user.email, user.user_metadata?.name);

      const dbPayload = {
        ...payload,
        broker_id: user.id,
        price: payload.price ? parseFloat(payload.price) : null,
        rental_price: payload.rental_price ? parseFloat(payload.rental_price) : null,
        starting_from_price: payload.starting_from_price ? parseFloat(payload.starting_from_price) : null,
        bedrooms: parseInt(payload.bedrooms) || 0,
        bathrooms: parseInt(payload.bathrooms) || 0,
        suites: parseInt(payload.suites) || 0,
        parking_spaces: parseInt(payload.parking_spaces) || 0,
        area: parseFloat(payload.area) || 0,
        lat: payload.lat ? parseFloat(payload.lat) : null,
        lng: payload.lng ? parseFloat(payload.lng) : null,
        youtube_url: payload.video_url,
        floor_plans: payload.plans_urls,
        amenities: payload.amenities || [],
        meta_title: payload.meta_title,
        meta_description: payload.meta_description
      };

      if (mode === 'create') {
        const { error } = await supabase.from('properties').insert([dbPayload]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('properties').update(dbPayload).eq('id', initialData.id);
        if (error) throw error;
      }

      toast({ title: "Sucesso!", description: "Imóvel salvo com sucesso.", className: "bg-green-50 border-green-200" });
      if (mode === 'create') {
          setFormData({ ...formData, title: '', slug: '' });
      }
      if (onSuccess) onSuccess();

    } catch (error) {
      console.error(error);
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6">
      
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{mode === 'create' ? 'Novo Imóvel' : 'Editar Imóvel'}</h1>
        <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => window.history.back()}>Cancelar</Button>
            <Button type="submit" disabled={loading} className="bg-gray-900 text-white min-w-[140px]">
                {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 w-4 h-4" />}
                Salvar Imóvel
            </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 h-auto bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
          <TabsTrigger value="basic" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white py-3"><Layout className="w-4 h-4 mr-2" /> Básico</TabsTrigger>
          <TabsTrigger value="details" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white py-3"><Home className="w-4 h-4 mr-2" /> Detalhes</TabsTrigger>
          <TabsTrigger value="media" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white py-3"><ImageIcon className="w-4 h-4 mr-2" /> Mídia</TabsTrigger>
          <TabsTrigger value="infra" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white py-3"><ListChecks className="w-4 h-4 mr-2" /> Infra</TabsTrigger>
          <TabsTrigger value="seo" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white py-3"><Search className="w-4 h-4 mr-2" /> SEO</TabsTrigger>
          <TabsTrigger value="contact" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white py-3"><Contact className="w-4 h-4 mr-2" /> Contato</TabsTrigger>
        </TabsList>

        <div className="mt-6">
            {/* SECTION 1: BASIC INFO */}
            <TabsContent value="basic" className="space-y-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <Label>Título do Anúncio *</Label>
                        <input name="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg mt-1" required placeholder="Ex: Apartamento de Luxo na Vila Mariana" />
                        <p className="text-xs text-gray-500 mt-1">Mínimo 10 caracteres.</p>
                    </div>
                    
                    <div className="md:col-span-2">
                        <Label>Slug (URL) * {slugStatus === 'taken' && <span className="text-red-500 ml-2 text-xs">Indisponível</span>}</Label>
                        <div className="flex items-center mt-1">
                            <span className="bg-gray-100 border border-r-0 rounded-l-lg px-3 py-2 text-gray-500 text-sm">/imovel/</span>
                            <input name="slug" value={formData.slug} onChange={handleChange} className={cn("flex-1 px-4 py-2 border rounded-r-lg", slugStatus === 'taken' ? "border-red-500 bg-red-50" : "")} required />
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <div className="flex justify-end mb-2">
                          <GenerateDescriptionButton 
                            propertyData={formData} 
                            onDescriptionGenerated={handleDescriptionChange} 
                          />
                        </div>
                        <PropertyDescriptionEditor 
                          value={formData.description}
                          onChange={handleDescriptionChange}
                          placeholder="Descreva o imóvel em detalhes... Use títulos e listas para destacar as características."
                          error={formData.description && formData.description.replace(/<[^>]*>/g, '').trim().length < 50}
                        />
                    </div>

                    <div>
                        <Label>Bairro *</Label>
                        <input name="neighborhood" value={formData.neighborhood} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg mt-1" required />
                    </div>
                    <div>
                         <Label>Endereço *</Label>
                         <input name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg mt-1" required />
                    </div>
                    <div>
                         <Label>Latitude</Label>
                         <input type="number" step="any" name="lat" value={formData.lat} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg mt-1" />
                    </div>
                    <div>
                         <Label>Longitude</Label>
                         <input type="number" step="any" name="lng" value={formData.lng} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg mt-1" />
                    </div>
                </div>
            </TabsContent>

            {/* SECTION 2: DETAILS */}
            <TabsContent value="details" className="space-y-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-6">
                    <Label className="mb-3 block font-bold text-gray-900">Tipo de Negócio *</Label>
                    <RadioGroup value={formData.business_type} onValueChange={handleBusinessTypeChange} className="flex gap-6">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="sale" id="sale" />
                            <Label htmlFor="sale">Venda</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="rent" id="rent" />
                            <Label htmlFor="rent">Locação</Label>
                        </div>
                    </RadioGroup>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {formData.business_type === 'sale' && (
                        <div>
                            <Label>Preço de Venda (R$)</Label>
                            <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg mt-1" />
                        </div>
                    )}
                    {formData.business_type === 'rent' && (
                        <div>
                            <Label>Valor do Aluguel (R$/mês)</Label>
                            <input type="number" name="rental_price" value={formData.rental_price} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg mt-1" />
                        </div>
                    )}
                    <div>
                        <Label className="text-gray-600">Preço "A partir de" (Opcional)</Label>
                        <input type="number" name="starting_from_price" value={formData.starting_from_price} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg mt-1 bg-gray-50" placeholder="Ex: 500000" />
                        <p className="text-xs text-gray-400 mt-1">Use para lançamentos ou preços base.</p>
                    </div>
                </div>

                <div className="h-px bg-gray-100 my-4" />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                        <Label>Tipo de Imóvel *</Label>
                        <select name="type" value={formData.type} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg mt-1">
                            <option value="apartment">Apartamento</option>
                            <option value="house">Casa</option>
                            <option value="commercial">Comercial</option>
                            <option value="land">Terreno</option>
                        </select>
                    </div>
                     <div>
                        <Label>Estágio</Label>
                        <select name="property_status" value={formData.property_status} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg mt-1">
                            <option value="ready">Pronto</option>
                            <option value="construction">Em Obras</option>
                            <option value="launch">Lançamento</option>
                        </select>
                    </div>
                    <div><Label>Área (m²) *</Label><input type="number" name="area" value={formData.area} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg mt-1" required /></div>
                    <div><Label>Quartos *</Label><input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg mt-1" required /></div>
                    <div><Label>Banheiros *</Label><input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg mt-1" required /></div>
                    <div><Label>Suítes</Label><input type="number" name="suites" value={formData.suites} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg mt-1" /></div>
                    <div><Label>Vagas</Label><input type="number" name="parking_spaces" value={formData.parking_spaces} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg mt-1" /></div>
                </div>
            </TabsContent>

            {/* SECTION 3: MEDIA */}
            <TabsContent value="media" className="space-y-8 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                
                {/* Images */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-2">
                        <h3 className="font-semibold text-lg">Galeria de Fotos</h3>
                        <div className="flex gap-2">
                            <input type="text" value={imageInput} onChange={(e) => setImageInput(e.target.value)} placeholder="URL..." className="px-3 py-1 border rounded text-sm w-40" />
                            <Button type="button" size="sm" variant="outline" onClick={addImageUrl}>Add URL</Button>
                        </div>
                    </div>
                    <ImageGalleryDragDrop 
                        images={formData.images} 
                        onReorder={(imgs) => setFormData(prev => ({ ...prev, images: imgs }))} 
                        onDelete={(idx) => setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                        onUpload={(e) => handleImageUpload(e, 'images')}
                        uploading={uploadingImages}
                    />
                </div>

                {/* Floor Plans Section */}
                <div className="space-y-4 pt-6 border-t">
                    <div className="flex items-center justify-between border-b pb-2">
                        <div className="flex items-center gap-2">
                           <FileText className="w-5 h-5 text-blue-600" />
                           <h3 className="font-semibold text-lg">Plantas Humanizadas</h3>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      Faça upload das imagens das plantas (JPG/PNG). Arraste para reordenar.
                    </p>
                    <ImageGalleryDragDrop 
                        images={formData.plans_urls} 
                        onReorder={(plans) => setFormData(prev => ({ ...prev, plans_urls: plans }))} 
                        onDelete={(idx) => setFormData(prev => ({ ...prev, plans_urls: prev.plans_urls.filter((_, i) => i !== idx) }))}
                        onUpload={(e) => handleImageUpload(e, 'plans_urls')}
                        uploading={uploadingPlans}
                    />
                </div>

                {/* Video & Tour */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                    <div>
                        <Label>URL do Vídeo (YouTube)</Label>
                        <input name="video_url" value={formData.video_url} onChange={handleChange} placeholder="https://youtube.com/watch?v=..." className="w-full px-4 py-2 border rounded-lg mt-1" />
                        <p className="text-xs text-gray-500 mt-1">Insira o link completo do YouTube.</p>
                    </div>
                    <div>
                        <Label>URL do Tour Virtual (Matterport/Outros)</Label>
                        <input name="virtual_tour_url" value={formData.virtual_tour_url} onChange={handleChange} placeholder="https://my.matterport.com/..." className="w-full px-4 py-2 border rounded-lg mt-1" />
                    </div>
                </div>
            </TabsContent>

            {/* SECTION 4: INFRASTRUCTURE */}
            <TabsContent value="infra" className="space-y-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <ListChecks className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Lazer e Infraestrutura</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {AMENITIES_LIST.map((item) => (
                      <div key={item} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`amenity-${item}`} 
                          checked={(formData.amenities || []).includes(item)}
                          onCheckedChange={(checked) => handleAmenityChange(item, checked)}
                        />
                        <label 
                          htmlFor={`amenity-${item}`} 
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer select-none text-gray-700"
                        >
                          {item}
                        </label>
                      </div>
                    ))}
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-4 pt-4 border-t">
                    Selecione todas as opções que se aplicam ao condomínio ou imóvel. Essas informações serão exibidas nos cards e na página de detalhes.
                  </p>
                </div>
            </TabsContent>

            {/* SECTION 5: SEO (With Auto-Generation) */}
            <TabsContent value="seo" className="space-y-8 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="space-y-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-lg font-semibold mb-1">Otimização para Mecanismos de Busca (SEO)</h3>
                            <p className="text-sm text-gray-500 mb-6">Configure como o seu imóvel aparecerá no Google e redes sociais.</p>
                        </div>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={handleGenerateSEO}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          Gerar SEO Automático
                        </Button>
                    </div>

                    <div className="grid gap-6">
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <Label>Meta Title (Título SEO) *</Label>
                                <span className={cn("text-xs font-medium", formData.meta_title.length > 60 ? "text-red-500" : "text-gray-500")}>
                                    {formData.meta_title.length}/60
                                </span>
                            </div>
                            <input 
                                name="meta_title" 
                                value={formData.meta_title} 
                                onChange={handleChange} 
                                placeholder="Ex: Apartamento 3 quartos em Vila Mariana - São Paulo"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none" 
                                maxLength={60}
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <Label>Meta Description *</Label>
                                <span className={cn("text-xs font-medium", formData.meta_description.length > 160 ? "text-red-500" : "text-gray-500")}>
                                    {formData.meta_description.length}/160
                                </span>
                            </div>
                            <Textarea 
                                name="meta_description" 
                                value={formData.meta_description} 
                                onChange={handleChange} 
                                placeholder="Ex: Apartamento moderno com 3 quartos, 2 banheiros, varanda e vista para o parque. Localizado em bairro nobre."
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none min-h-[100px]" 
                                maxLength={160}
                            />
                        </div>

                        {seoWarnings.length > 0 && (
                            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                <div className="flex items-center gap-2 mb-2 text-yellow-800 font-medium">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>Atenção:</span>
                                </div>
                                <ul className="list-disc pl-5 space-y-1 text-sm text-yellow-700">
                                    {seoWarnings.map((warn, i) => <li key={i}>{warn}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className="pt-6 border-t">
                        <SEOPreview 
                            title={formData.meta_title} 
                            description={formData.meta_description}
                            slug={formData.slug}
                        />
                    </div>
                </div>
            </TabsContent>

            {/* SECTION 6: CONTACT & STATUS */}
            <TabsContent value="contact" className="space-y-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
                    <Checkbox 
                        id="featured" 
                        checked={formData.featured} 
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))} 
                    />
                    <label htmlFor="featured" className="font-medium cursor-pointer">Destacar este imóvel na Home</label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <Label>Status do Anúncio</Label>
                        <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg mt-1">
                            <option value="active">Ativo (Visível)</option>
                            <option value="inactive">Inativo (Oculto)</option>
                            <option value="sold">Vendido/Alugado</option>
                        </select>
                    </div>
                </div>
            </TabsContent>
        </div>
      </Tabs>
    </form>
  );
};

export default PropertyForm;