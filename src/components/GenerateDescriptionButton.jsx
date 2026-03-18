import React, { useState } from 'react';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { generatePropertyDescription } from '@/utils/aiDescriptionGenerator';

const GenerateDescriptionButton = ({ propertyData, onDescriptionGenerated }) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    // Basic validation to ensure we have enough data to generate something useful
    if (!propertyData.title && !propertyData.type && !propertyData.neighborhood) {
      toast({
        title: "Dados insuficientes",
        description: "Preencha o título, tipo e bairro antes de gerar a descrição.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const description = await generatePropertyDescription(propertyData);
      onDescriptionGenerated(description);
      toast({
        title: "Descrição gerada!",
        description: "A descrição foi criada com sucesso. Revise e ajuste conforme necessário.",
        className: "bg-green-50 border-green-200"
      });
    } catch (error) {
      toast({
        title: "Erro na geração",
        description: "Não foi possível gerar a descrição. Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleGenerate}
      disabled={loading}
      variant="outline"
      className="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200 hover:border-purple-300 transition-all shadow-sm hover:shadow group"
      aria-label="Gerar descrição com IA"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Gerando...
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
          Gerar descrição com IA
        </>
      )}
    </Button>
  );
};

export default GenerateDescriptionButton;