import React, { useState, useMemo, Suspense, lazy, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Bed, Bath, Car, Maximize, MapPin, ArrowLeft, Loader2, Map as MapIcon, Video, Rotate3D, Phone, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import PropertyDescription from '@/components/PropertyDescription';
import WhatsAppButton from '@/components/WhatsAppButton';
import useProperty from '@/hooks/useProperty';
import { useTidioChat } from '@/hooks/useTidioChat';
import { cn } from '@/lib/utils';
import { generatePropertyTitle, generatePropertyDescription } from '@/utils/seoHelpers';
import { generatePropertySchema } from '@/utils/generatePropertySchema';
import { Skeleton } from '@/components/ui/skeleton';
import { trackPropertyView, trackWhatsAppClick, trackPhoneClick } from '@/utils/analyticsEvents';

// Lazy Loaded Components
const PhotoCarousel = lazy(() => import('@/components/PhotoCarousel'));
const PhotoModal = lazy(() => import('@/components/PhotoModal'));
const FloorPlansModal = lazy(() => import('@/components/FloorPlansModal'));
const PropertyMapModal = lazy(() => import('@/components/PropertyMapModal'));
const VideoEmbed = lazy(() => import('@/components/property/VideoEmbed'));
const VirtualTourEmbed = lazy(() => import('@/components/property/VirtualTourEmbed'));

const PropertyDetailPage = () => {
  const { slug } = useParams();
  const { property, loading, error } = useProperty(slug);
  const { setPropertyContext } = useTidioChat();

  const [photoModalIndex, setPhotoModalIndex] = useState(0);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isFloorPlanModalOpen, setIsFloorPlanModalOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  
  const [showVideo, setShowVideo] = useState(false);
  const [showTour, setShowTour] = useState(false);

  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', message: '' });

  const isRent = useMemo(() => property?.business_type === 'rent', [property]);
  
  const seoTitle = useMemo(() => property?.meta_title || generatePropertyTitle(property), [property]);
  const seoDesc = useMemo(() => property?.meta_description || generatePropertyDescription(property), [property]);
  const schema = useMemo(() => generatePropertySchema(property), [property]);

  useEffect(() => {
    if (property) {
      setPropertyContext({
        id: property.id,
        title: property.title,
        price: property.starting_from_price || property.price || property.rental_price,
      });

      trackPropertyView({
        property_slug: property.slug,
        deal_type: property.business_type,
        neighborhood: property.neighborhood,
        property_id: property.id
      });
    }
  }, [property]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8" /></div>;
  if (error || !property) return <Navigate to="/404" />;

  const displayPrice = property.starting_from_price || (isRent ? property.rental_price : property.price) || 0;
  const formattedPrice = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(displayPrice);

  const handlePhoneAction = () => {
    trackPhoneClick({
      property_slug: property.slug
    });
  };

  const handleWhatsAppAction = () => {
    trackWhatsAppClick({
      property_slug: property.slug,
      deal_type: property.business_type,
      neighborhood: property.neighborhood,
      property_id: property.id
    });
  };

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>

      <div className="bg-[#f5f7fa] min-h-screen pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <Link to="/imoveis" className="inline-flex items-center mb-6 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <header>
                <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
                <p className="flex items-center text-gray-600 mt-2">
                   <MapPin className="w-4 h-4 mr-2" /> {property.address}, {property.neighborhood}
                   {property.lat && (
                     <button onClick={() => setIsMapOpen(true)} className="ml-4 text-blue-600 text-sm hover:underline flex items-center">
                       <MapIcon className="w-3 h-3 mr-1"/> Ver no mapa
                     </button>
                   )}
                </p>
                <div className="flex flex-wrap gap-4 mt-6">
                  <Info icon={Bed} value={property.bedrooms} label="Quartos" />
                  <Info icon={Bath} value={property.bathrooms} label="Banheiros" />
                  <Info icon={Car} value={property.parking_spaces} label="Vagas" />
                  <Info icon={Maximize} value={`${property.area} m²`} label="Área" />
                  {property.floor_plans?.length > 0 && (
                    <Button variant="outline" size="sm" onClick={() => setIsFloorPlanModalOpen(true)} className="h-[38px]">
                      <FileText className="w-4 h-4 mr-2" /> Plantas
                    </Button>
                  )}
                </div>
              </header>

              <Suspense fallback={<Skeleton className="w-full aspect-video rounded-xl" />}>
                 <PhotoCarousel 
                   images={property.images} 
                   onPhotoClick={(i) => { setPhotoModalIndex(i); setIsPhotoModalOpen(true); }}
                   hasFloorPlans={property.floor_plans?.length > 0}
                   onFloorPlansClick={() => setIsFloorPlanModalOpen(true)}
                 />
              </Suspense>

              {property.video_url && (
                <div className="space-y-3">
                  <h3 className="font-bold flex items-center gap-2"><Video className="w-5 h-5"/> Vídeo</h3>
                  {!showVideo ? (
                    <div className="w-full aspect-video bg-black/10 rounded-xl flex items-center justify-center cursor-pointer hover:bg-black/20 transition-colors" onClick={() => setShowVideo(true)}>
                      <Button variant="secondary">Carregar Vídeo</Button>
                    </div>
                  ) : (
                    <Suspense fallback={<Skeleton className="w-full aspect-video" />}>
                      <VideoEmbed url={property.video_url} title={property.title} />
                    </Suspense>
                  )}
                </div>
              )}

              {property.virtual_tour_url && (
                <div className="space-y-3">
                   <h3 className="font-bold flex items-center gap-2"><Rotate3D className="w-5 h-5"/> Tour Virtual</h3>
                   {!showTour ? (
                      <div className="w-full aspect-video bg-black/10 rounded-xl flex items-center justify-center cursor-pointer hover:bg-black/20" onClick={() => setShowTour(true)}>
                        <Button variant="secondary">Carregar Tour 360º</Button>
                      </div>
                   ) : (
                      <Suspense fallback={<Skeleton className="w-full aspect-video" />}>
                        <VirtualTourEmbed url={property.virtual_tour_url} />
                      </Suspense>
                   )}
                </div>
              )}

              <section className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
                <h2 className="text-xl font-bold mb-4 border-b pb-2">Descrição</h2>
                <PropertyDescription html={property.description} />
              </section>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 text-center">
                  <span className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase", isRent ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700")}>
                    {isRent ? 'Locação' : 'Venda'}
                  </span>
                  <div className="mt-4 text-3xl font-bold text-gray-900">{formattedPrice}</div>
                  <p className="text-sm text-gray-500 mb-6">{isRent ? '/ mês' : ''}</p>
                  
                  <div onClickCapture={handleWhatsAppAction}>
                    <WhatsAppButton property={property} className="w-full" />
                  </div>
                  
                  <a href="tel:+5511971157373" onClick={handlePhoneAction} className="mt-4 flex items-center justify-center text-gray-600 hover:text-[#0d5a7a] transition-colors font-semibold text-lg">
                     <Phone className="w-5 h-5 mr-2" /> (11) 97115-7373
                  </a>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                   <h3 className="font-bold mb-4">Tenho Interesse</h3>
                   <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); alert('Mensagem enviada! Entraremos em contato em breve.'); }}>
                      <Input placeholder="Nome" value={contactForm.name} onChange={e => setContactForm({...contactForm, name: e.target.value})} />
                      <Input placeholder="Email" value={contactForm.email} onChange={e => setContactForm({...contactForm, email: e.target.value})} />
                      <Input placeholder="Telefone" value={contactForm.phone} onChange={e => setContactForm({...contactForm, phone: e.target.value})} />
                      <Textarea placeholder="Mensagem" value={contactForm.message} onChange={e => setContactForm({...contactForm, message: e.target.value})} />
                      <Button type="submit" className="w-full bg-[#0d5a7a] text-white hover:bg-[#0b4a65]">Enviar Mensagem</Button>
                   </form>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Suspense fallback={null}>
          {isPhotoModalOpen && <PhotoModal isOpen={isPhotoModalOpen} images={property.images} initialIndex={photoModalIndex} onClose={() => setIsPhotoModalOpen(false)} />}
          {isFloorPlanModalOpen && <FloorPlansModal isOpen={isFloorPlanModalOpen} plans={property.floor_plans} onClose={() => setIsFloorPlanModalOpen(false)} />}
          {isMapOpen && <PropertyMapModal isOpen={isMapOpen} property={property} onClose={() => setIsMapOpen(false)} />}
        </Suspense>
      </div>
    </>
  );
};

const Info = ({ icon: Icon, value, label }) => (
  <div className="flex items-center px-3 py-2 bg-white rounded-lg border shadow-sm text-sm">
    <Icon className="w-4 h-4 text-gray-400 mr-2" />
    <span className="font-bold mr-1">{value}</span> {label}
  </div>
);

export default PropertyDetailPage;