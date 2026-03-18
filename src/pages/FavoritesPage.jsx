import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/hooks/useFavorites';
import PropertyCard from '@/components/PropertyCard';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FavoritesPage = () => {
  const { user } = useAuth();
  const { favorites, loading: favoritesLoading } = useFavorites();
  const [favoriteProperties, setFavoriteProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavoriteProperties = async () => {
      if (!user || favorites.length === 0) {
        setFavoriteProperties([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*, broker:brokers(*)')
          .in('id', favorites);

        if (error) throw error;
        setFavoriteProperties(data || []);
      } catch (error) {
        console.error('Error fetching favorite properties:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!favoritesLoading) {
      fetchFavoriteProperties();
    }
  }, [user, favorites, favoritesLoading]);

  return (
    <>
      <Helmet>
        <title>Meus Favoritos | Imóveis SP</title>
      </Helmet>

      <div className="min-h-screen bg-[#f5f7fa] pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-8">
            <Heart className="w-8 h-8 text-[#0d5a7a] fill-[#0d5a7a]" />
            <h1 className="text-3xl font-bold text-[#1a3a52]">Meus Favoritos</h1>
            <span className="bg-[#0d5a7a] text-white text-sm font-bold px-3 py-1 rounded-full">
              {favoriteProperties.length}
            </span>
          </div>

          {loading || favoritesLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d5a7a]"></div>
            </div>
          ) : favoriteProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {favoriteProperties.map((property, index) => (
                <PropertyCard key={property.id} property={property} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl shadow-sm">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Sua lista está vazia</h2>
              <p className="text-gray-600 mb-6">Você ainda não salvou nenhum imóvel nos favoritos.</p>
              <Link to="/search">
                <Button className="bg-[#0d5a7a]">
                  Buscar Imóveis
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FavoritesPage;