import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { initialBlogPosts } from '@/lib/blogData';

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const categories = ['Todas', 'Dicas', 'Mercado', 'Investimento', 'Bairros'];

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      // Fetch posts from Supabase database
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      let allPosts = data || [];

      // Fallback to local static data if database is completely empty
      if (allPosts.length === 0) {
        allPosts = initialBlogPosts;
      }

      // Filter by category
      let filteredPosts = allPosts;
      if (selectedCategory !== 'Todas') {
        filteredPosts = allPosts.filter(
          post => post.category?.toLowerCase() === selectedCategory.toLowerCase()
        );
      }

      setPosts(filteredPosts);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Blog Imobiliário | Dicas e Tendências | Imóveis SP</title>
        <meta name="description" content="Fique por dentro das últimas notícias, dicas e tendências do mercado imobiliário de São Paulo." />
      </Helmet>
      
      <div className="min-h-screen bg-[#f5f7fa] pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-[#1a3a52] mb-4">Blog Imóveis SP</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Notícias, tendências, análises de mercado e dicas exclusivas para quem quer comprar, vender ou alugar.
            </p>
          </div>

          {/* Categories */}
          <div className="flex justify-center flex-wrap gap-2 mb-12">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-6 transition-all ${
                  selectedCategory === cat 
                    ? 'bg-[#0d5a7a] hover:bg-[#0b4b66] text-white shadow-md transform scale-105' 
                    : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'
                }`}
              >
                {cat}
              </Button>
            ))}
          </div>

          {loading ? (
             <div className="flex justify-center py-20">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d5a7a]"></div>
             </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-gray-500">Nenhum artigo encontrado nesta categoria.</p>
              <Button 
                variant="link" 
                onClick={() => setSelectedCategory('Todas')}
                className="mt-4 text-[#0d5a7a]"
              >
                Ver todos os artigos
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Link 
                  to={`/blog/${post.slug}`} 
                  key={post.id || post.slug} 
                  className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:border-[#0d5a7a]/20 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="relative h-56 overflow-hidden bg-gray-100">
                    <img 
                      src={post.featured_image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80'} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/95 backdrop-blur-sm text-[#0d5a7a] text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                        {post.category || 'Geral'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col flex-grow p-6">
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> 
                        {new Date(post.created_at).toLocaleDateString('pt-BR')}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      <span>3 min leitura</span>
                    </div>
                    
                    <h2 className="text-xl font-bold text-[#1a3a52] mb-3 group-hover:text-[#0d5a7a] transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    
                    <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-grow leading-relaxed">
                      {post.excerpt}
                    </p>
                    
                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[#0d5a7a] font-semibold text-sm group-hover:underline inline-flex items-center">
                        Ler artigo completo
                        <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BlogPage;