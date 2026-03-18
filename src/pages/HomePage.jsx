import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Search, Building2, Award, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import ImageOptimizer from '@/components/ImageOptimizer';
import { logBundleInfo } from '@/utils/performanceReporter';
import { trackWhatsAppClick } from '@/utils/analyticsEvents';

// Lazy load components below the fold
const PropertyCard = lazy(() => import('@/components/PropertyCard'));

const DEFAULT_CONTENT = {
  hero_title: 'Encontre o imóvel ideal em São Paulo',
  hero_subtitle: 'Os melhores apartamentos, casas e imóveis residenciais nos bairros mais valorizados de São Paulo',
  hero_image_url: 'https://images.unsplash.com/photo-1583931234481-b7157d20218d?q=80&w=1920&auto=format&fit=crop'
};

const HomePage = () => {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [loadingContent, setLoadingContent] = useState(true);
  
  // Search States
  const [searchType, setSearchType] = useState('sale');
  const [propertyType, setPropertyType] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => { 
    logBundleInfo('HomePage');
    fetchPageSettings();
    setTimeout(fetchProperties, 100); 
  }, []);

  const fetchPageSettings = async () => {
    try {
      const { data } = await supabase.from('home_page_settings').select('*').limit(1).maybeSingle();
      if (data) setContent(prev => ({ ...prev, ...data }));
    } catch (e) { console.error(e); } finally { setLoadingContent(false); }
  };

  const fetchProperties = async () => {
    try {
      const { data } = await supabase.from('properties').select('*').eq('featured', true).eq('status', 'active').limit(6);
      setFeaturedProperties(data || []);
    } catch (e) { console.error(e); } finally { setLoadingProperties(false); }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchType) params.append('businessType', searchType);
    if (propertyType) params.append('type', propertyType);
    if (neighborhood) params.append('location', neighborhood);
    navigate(`/imoveis?${params.toString()}`);
  };

  return (
    <>
      <Helmet>
        <title>{content.hero_title} | Gil Fernandes | Corretor SP</title>
        <meta name="description" content={content.hero_subtitle} />
      </Helmet>

      <main className="min-h-screen">
        {/* HERO - CRITICAL LCP */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
             <ImageOptimizer 
                src={content.hero_image_url} 
                alt="São Paulo Skyline" 
                className="w-full h-full"
                priority={true}
                width={1920}
                height={1080}
                sizes="100vw"
             />
             <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 text-center pt-24">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              {loadingContent ? <Skeleton className="h-14 w-3/4 mx-auto bg-white/20" /> : content.hero_title}
            </h1>
            <p className="text-xl md:text-2xl text-white max-w-3xl mx-auto mb-10 drop-shadow-md font-medium">
              {loadingContent ? <Skeleton className="h-8 w-2/3 mx-auto bg-white/20" /> : content.hero_subtitle}
            </p>

            {/* SEARCH BOX */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 max-w-4xl mx-auto border border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select value={searchType} onChange={e => setSearchType(e.target.value)} className="input border p-3 rounded-lg w-full bg-white text-gray-900">
                  <option value="sale">Comprar</option>
                  <option value="rent">Alugar</option>
                </select>
                <select value={propertyType} onChange={e => setPropertyType(e.target.value)} className="input border p-3 rounded-lg w-full bg-white text-gray-900">
                  <option value="">Todos os Tipos</option>
                  <option value="apartment">Apartamento</option>
                  <option value="house">Casa</option>
                  <option value="commercial">Comercial</option>
                </select>
                <input 
                  value={neighborhood} 
                  onChange={e => setNeighborhood(e.target.value)} 
                  placeholder="Bairro (ex: Pinheiros)" 
                  className="input border p-3 rounded-lg w-full bg-white text-gray-900 placeholder:text-gray-500" 
                />
              </div>
              <Button onClick={handleSearch} className="w-full mt-6 bg-[#0d5a7a] hover:bg-[#0b4a65] text-white py-6 text-lg font-bold shadow-md transition-all hover:scale-[1.01]">
                <Search className="mr-2" /> Buscar Imóveis
              </Button>
            </div>
          </div>
        </section>

        {/* FEATURED PROPERTIES - Lazy Loaded */}
        <section className="py-20 bg-[#f5f7fa]">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-[#1a3a52] mb-12">
              Imóveis em Destaque
            </h2>

            {loadingProperties ? (
              <div className="flex flex-col gap-6">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 rounded-xl w-full" />)}
              </div>
            ) : (
              <Suspense fallback={<div className="flex justify-center p-12"><Loader2 className="animate-spin text-gray-400" /></div>}>
                <div className="flex flex-col gap-6" onClickCapture={(e) => {
                  if (e.target.closest('button') && e.target.closest('button').textContent.toLowerCase().includes('whatsapp')) {
                     trackWhatsAppClick({ page_path: window.location.pathname, deal_type: 'venda', source: 'featured_card' });
                  }
                }}>
                  {featuredProperties.map((p, i) => (
                    <PropertyCard key={p.id} property={p} index={i} layout="list" />
                  ))}
                </div>
                <div className="text-center mt-10">
                    <Link to="/imoveis">
                        <Button variant="outline" size="lg" className="border-gray-400 text-gray-700 hover:bg-white hover:text-[#1a3a52]">Ver todos os imóveis</Button>
                    </Link>
                </div>
              </Suspense>
            )}
          </div>
        </section>

        {/* STATS - Static Content */}
        <section className="py-16 bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 text-center">
            <StatItem icon={Award} value="15+ anos" label="Experiência de Mercado" />
            <StatItem icon={Building2} value="100+" label="Imóveis Vendidos" />
            <StatItem icon={Users} value="500+" label="Clientes Satisfeitos" />
          </div>
        </section>

        <footer className="bg-[#1a3a52] text-white py-12 text-center">
          <div className="max-w-7xl mx-auto px-4">
             <p className="opacity-80">© 2026 Gil Fernandes Corretor SP — CRECI 12345-F</p>
             <p className="text-sm opacity-50 mt-2">Todos os direitos reservados.</p>
          </div>
        </footer>
      </main>
    </>
  );
};

const StatItem = ({ icon: Icon, value, label }) => (
    <div className="p-6 rounded-xl hover:bg-gray-50 transition-colors">
        <Icon className="mx-auto text-[#0d5a7a] w-12 h-12 mb-4" />
        <h3 className="text-3xl font-bold text-gray-900 mb-2">{value}</h3>
        <p className="text-gray-600 font-medium">{label}</p>
    </div>
);

export default HomePage;