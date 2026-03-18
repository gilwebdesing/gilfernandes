import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';

export const useFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setFavorites([]);
      setLoading(false);
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('property_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setFavorites(data.map(f => f.property_id));
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const isFavorited = (propertyId) => {
    return favorites.includes(propertyId);
  };

  const addFavorite = async (propertyId) => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para favoritar imóveis.",
        variant: "destructive"
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('favorites')
        .insert([{ user_id: user.id, property_id: propertyId }]);

      if (error) throw error;
      
      setFavorites([...favorites, propertyId]);
      toast({
        title: "Adicionado aos favoritos",
        description: "Imóvel salvo com sucesso!",
      });
      return true;
    } catch (error) {
      console.error('Error adding favorite:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar aos favoritos.",
        variant: "destructive"
      });
      return false;
    }
  };

  const removeFavorite = async (propertyId) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('property_id', propertyId);

      if (error) throw error;

      setFavorites(favorites.filter(id => id !== propertyId));
      toast({
        title: "Removido dos favoritos",
        description: "Imóvel removido da sua lista.",
      });
      return true;
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover dos favoritos.",
        variant: "destructive"
      });
      return false;
    }
  };

  const toggleFavorite = async (propertyId) => {
    if (isFavorited(propertyId)) {
      await removeFavorite(propertyId);
    } else {
      await addFavorite(propertyId);
    }
  };

  return {
    favorites,
    isFavorited,
    toggleFavorite,
    loading
  };
};