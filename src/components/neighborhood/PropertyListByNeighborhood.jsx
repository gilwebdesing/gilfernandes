import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PropertyCard from '@/components/PropertyCard';
import { Button } from '@/components/ui/button';
import { ArrowRight, Home, Building2 } from 'lucide-react';
import { useNeighborhoodTracking } from '@/hooks/useNeighborhoodTracking';

const PropertySection = ({ title, icon: Icon, properties, businessType, onLoadMore, hasMore, neighborhoodData }) => {
    const { trackPropertyClick } = useNeighborhoodTracking(neighborhoodData);

    if (!properties || properties.length === 0) return null;

    return (
        <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-[#1a3a52] flex items-center">
                    <Icon className="w-6 h-6 mr-3 text-[#ff8c42]" />
                    {title}
                </h2>
                <Link to={`/imoveis?business_type=${businessType}`} className="text-sm font-semibold text-blue-600 hover:text-blue-800 hidden sm:flex items-center">
                    Ver todos <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {properties.map((p, i) => (
                    <div key={p.id} onClick={() => trackPropertyClick(p.id, businessType)}>
                        <PropertyCard property={p} index={i} />
                    </div>
                ))}
            </div>

            {hasMore && (
                <div className="mt-8 text-center">
                    <Button variant="outline" onClick={onLoadMore} className="min-w-[200px]">
                        Carregar Mais
                    </Button>
                </div>
            )}
        </section>
    );
};

const PropertyListByNeighborhood = ({ properties, neighborhoodData }) => {
    const [limitSale, setLimitSale] = useState(6);
    const [limitRent, setLimitRent] = useState(6);

    const saleProperties = properties.filter(p => p.business_type === 'sale');
    const rentProperties = properties.filter(p => p.business_type === 'rent');

    if (properties.length === 0) {
        return (
            <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <Home className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900">Nenhum imóvel encontrado neste momento</h3>
                <p className="text-gray-500 mt-2">Estamos captando novas oportunidades em {neighborhoodData?.name}.</p>
                <Link to="/contact">
                    <Button className="mt-6">Fale com um corretor</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="py-8">
            <PropertySection 
                title={`Imóveis à Venda em ${neighborhoodData?.name || ''}`}
                icon={Home}
                properties={saleProperties.slice(0, limitSale)}
                businessType="sale"
                onLoadMore={() => setLimitSale(prev => prev + 6)}
                hasMore={limitSale < saleProperties.length}
                neighborhoodData={neighborhoodData}
            />

            <PropertySection 
                title={`Imóveis para Locação em ${neighborhoodData?.name || ''}`}
                icon={Building2}
                properties={rentProperties.slice(0, limitRent)}
                businessType="rent"
                onLoadMore={() => setLimitRent(prev => prev + 6)}
                hasMore={limitRent < rentProperties.length}
                neighborhoodData={neighborhoodData}
            />
        </div>
    );
};

export default PropertyListByNeighborhood;