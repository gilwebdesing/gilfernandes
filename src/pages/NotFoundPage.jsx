import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Home, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotFoundPage = () => {
  return (
    <>
      <Helmet>
        <title>Página Não Encontrada | Imóveis SP</title>
        <meta name="description" content="Página não encontrada" />
      </Helmet>

      <div className="min-h-screen bg-[#f5f7fa] flex items-center justify-center px-4 pt-20">
        <div className="text-center">
          <h1 className="text-9xl font-bold text-[#0d5a7a] mb-4">404</h1>
          <h2 className="text-3xl font-bold text-[#1a3a52] mb-4">Página Não Encontrada</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
            Desculpe, a página que você está procurando não existe ou foi movida.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button size="lg" className="bg-[#0d5a7a] hover:bg-[#0d5a7a]/90">
                <Home className="w-5 h-5 mr-2" />
                Voltar ao Início
              </Button>
            </Link>
            <Link to="/search">
              <Button size="lg" variant="outline">
                <Search className="w-5 h-5 mr-2" />
                Buscar Imóveis
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;