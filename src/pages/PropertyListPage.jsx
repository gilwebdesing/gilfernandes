import React, { useState, useEffect, Suspense, lazy, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { AnimatePresence } from 'framer-motion';
import { Filter, LayoutGrid, LayoutList, Check, Building2, Key, Loader2, Map as MapIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useSearchParams } from 'react-router-dom';
import { cn, normalizeString } from '@/lib/utils';
import { formatPrice } from '@/utils/seoHelpers';
import { Skeleton } from '@/components/ui/skeleton';
import { trackWhatsAppClick } from '@/utils/analyticsEvents';

// Lazy load heavy components
const PropertyCard = lazy(() => import('@/components/PropertyCard'));
const PropertyMapModal = lazy(() => import('@/components/PropertyMapModal'));
const Slider = lazy(() => import('@/components/ui/slider').then(mod => ({ default: mod.Slider })));

// Debounce utility to avoid lodash dep
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const PropertyListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  const [businessTypeFilter, setBusinessTypeFilter] = useState(searchParams.get('businessType') || 'all');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list');
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  
  // Batch Rendering State for Performance
  const [visibleCount, setVisibleCount] = useState(12);

  // Filters
  const [filters, setFilters] = useState({
    priceRange: [0, Infinity],
    type: searchParams.get('type') || 'all',
    location: searchParams.get('location') || 'all',
    status: 'all'
  });

  // Debounced Filter Values
  const debouncedPrice = useDebounce(filters.priceRange, 300);

  useEffect(() => {
    const savedMode = localStorage.getItem('propertyViewMode');
    if (savedMode) setViewMode(savedMode);
  }, []);

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('propertyViewMode', mode);
  };

  // Sync URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (businessTypeFilter !== 'all') params.set('businessType', businessTypeFilter);
    else params.delete('businessType');
    
    if (filters.type !== 'all') params.set('type', filters.type);
    if (filters.location !== 'all') params.set('location', filters.location);
    
    setSearchParams(params, { replace: true });
    
    // Reset fetch/visible count when main filters change
    setVisibleCount(12);
    fetchProperties();
  }, [businessTypeFilter, filters.type, filters.location]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      let query = supabase.from('properties')
        .select('*, broker:brokers(*)')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (businessTypeFilter !== 'all') {
        query = query.eq('business_type', businessTypeFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error(error);
      toast({ title: 'Erro ao carregar', description: 'Tente novamente.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Filter Logic
  const filteredProperties = properties.filter(property => {
    const price = property.business_type === 'rent' ? property.rental_price : property.price;
    const safePrice = price || 0;

    const propNeighborhood = normalizeString(property.neighborhood);
    const filterLoc = normalizeString(filters.location);

    const matchesType = filters.type === 'all' || property.type === filters.type;
    // Use debounced price for filtering to avoid UI lag while sliding
    const matchesPrice = safePrice >= debouncedPrice[0] && safePrice <= debouncedPrice[1];
    const matchesStatus = filters.status === 'all' || property.property_status === filters.status;
    const matchesLocation = filters.location === 'all' || propNeighborhood.includes(filterLoc);

    return matchesType && matchesPrice && matchesStatus && matchesLocation;
  });

  const uniqueLocations = [...new Set(properties.map(p => p.neighborhood).filter(Boolean))];
  const visibleProperties = filteredProperties.slice(0, visibleCount);

  const handleLoadMore = () => setVisibleCount(prev => prev + 12);

  const handleCardClickCapture = (e, property) => {
    if (e.target.closest('button') && e.target.closest('button').textContent.toLowerCase().includes('whatsapp')) {
      trackWhatsAppClick({
        page_path: window.location.pathname,
        property_slug: property.slug,
        deal_type: property.business_type,
        neighborhood: property.neighborhood,
        property_id: property.id
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Imóveis à Venda e Locação | Imóveis SP</title>
        <meta name="description" content="Encontre imóveis para venda e locação em São Paulo. Apartamentos, casas e comerciais." />
      </Helmet>

      <div className="min-h-screen bg-[#f5f7fa] pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#1a3a52] mb-4">Encontre seu Imóvel</h1>
              <div className="flex flex-wrap gap-2">
                 {['all', 'sale', 'rent'].map(type => (
                   <Button 
                     key={type}
                     onClick={() => setBusinessTypeFilter(type)} 
                     variant="outline" 
                     className={cn(
                       'rounded-full gap-2 transition-all', 
                       businessTypeFilter === type 
                         ? (type === 'sale' ? 'bg-blue-600 text-white border-blue-600' : type === 'rent' ? 'bg-orange-500 text-white border-orange-500' : 'bg-[#1a3a52] text-white border-[#1a3a52]')
                         : 'bg-white hover:bg-gray-50'
                     )}
                   >
                     {type === 'all' && 'Todos'}
                     {type === 'sale' && <><Building2 className="w-4 h-4"/> Venda</>}
                     {type === 'rent' && <><Key className="w-4 h-4"/> Locação</>}
                     {businessTypeFilter === type && type !== 'all' && <Check className="w-3 h-3" />}
                   </Button>
                 ))}
              </div>
            </div>

            <div className="flex gap-2">
              <div className="bg-white rounded-lg shadow-sm p-1 border flex">
                <button onClick={() => handleViewModeChange('list')} className={cn("p-2 rounded transition-colors", viewMode === 'list' ? 'bg-[#1a3a52] text-white' : 'text-gray-500 hover:bg-gray-100')}><LayoutList className="w-5 h-5" /></button>
                <button onClick={() => handleViewModeChange('grid')} className={cn("p-2 rounded transition-colors", viewMode === 'grid' ? 'bg-[#1a3a52] text-white' : 'text-gray-500 hover:bg-gray-100')}><LayoutGrid className="w-5 h-5" /></button>
              </div>
              <Button onClick={() => setIsMapModalOpen(true)} className="bg-[#1a3a52] text-white gap-2">
                <MapIcon className="w-4 h-4" /> Mapa
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                <select className="input-field w-full" value={filters.type} onChange={e => setFilters(prev => ({ ...prev, type: e.target.value }))}>
                  <option value="all">Todos</option>
                  <option value="house">Casa</option>
                  <option value="apartment">Apartamento</option>
                  <option value="commercial">Comercial</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bairro</label>
                <select className="input-field w-full" value={filters.location} onChange={e => setFilters(prev => ({ ...prev, location: e.target.value }))}>
                  <option value="all">Todos</option>
                  {uniqueLocations.map(loc => (<option key={loc} value={loc}>{loc}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select className="input-field w-full" value={filters.status} onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}>
                  <option value="all">Todos</option>
                  <option value="ready">Pronto</option>
                  <option value="construction">Em Obras</option>
                  <option value="launch">Lançamento</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                   Max Preço: {filters.priceRange[1] < 20000000 ? formatPrice(filters.priceRange[1]) : 'Sem limite'}
                </label>
                <Suspense fallback={<div className="h-2 bg-gray-200 rounded animate-pulse" />}>
                   <Slider 
                     defaultValue={[filters.priceRange[1]]} 
                     max={20000000} 
                     step={100000} 
                     onValueChange={val => setFilters(prev => ({ ...prev, priceRange: [0, val[0]] }))} 
                     className="py-2" 
                   />
                </Suspense>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin mx-auto text-gray-400" /><p className="mt-2 text-gray-500">Buscando imóveis...</p></div>
          ) : filteredProperties.length > 0 ? (
            <>
               <div className={cn("grid gap-6", viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1")}>
                 <Suspense fallback={<Skeleton className="h-64" />}>
                   {visibleProperties.map((property, index) => (
                     <div key={property.id} onClickCapture={(e) => handleCardClickCapture(e, property)}>
                       <PropertyCard property={property} index={index} layout={viewMode} />
                     </div>
                   ))}
                 </Suspense>
               </div>
               
               {visibleCount < filteredProperties.length && (
                 <div className="mt-10 text-center">
                    <Button onClick={handleLoadMore} variant="outline" className="min-w-[200px]">
                       Carregar Mais Imóveis
                    </Button>
                    <p className="text-xs text-gray-400 mt-2">
                       Exibindo {visibleProperties.length} de {filteredProperties.length}
                    </p>
                 </div>
               )}
            </>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
              <Filter className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-bold text-gray-700">Nenhum imóvel encontrado</h3>
              <Button variant="link" onClick={() => setFilters({ priceRange: [0, Infinity], type: 'all', location: 'all', status: 'all' })} className="mt-2 text-blue-600">Limpar Filtros</Button>
            </div>
          )}

          <Suspense fallback={null}>
            {isMapModalOpen && (
              <PropertyMapModal isOpen={isMapModalOpen} onClose={() => setIsMapModalOpen(false)} properties={filteredProperties} />
            )}
          </Suspense>
        </div>
      </div>
    </>
  );
};

export default PropertyListPage;