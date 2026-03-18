import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Calendar, User, ArrowLeft, Clock, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { initialBlogPosts } from '@/lib/blogData';

const BlogDetailPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        // Fetch from Supabase directly
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        if (data) {
          setPost(data);
        } else {
          // Fallback to static data if not found in DB
          const foundLocal = initialBlogPosts.find(p => p.slug === slug);
          if (foundLocal) setPost(foundLocal);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f7fa]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d5a7a]"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen pt-32 pb-20 text-center bg-[#f5f7fa]">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Post não encontrado</h2>
        <Link to="/blog">
          <Button>Voltar para o Blog</Button>
        </Link>
      </div>
    );
  }

  // Support for both raw HTML and our old markdown-like syntax
  const isHtml = post.content?.includes('<p>') || post.content?.includes('<h2>');
  
  const formatContent = (content) => {
    if (!content) return null;
    return content.split('\n').map((line, index) => {
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-2xl font-bold text-[#1a3a52] mt-8 mb-4">{line.replace('## ', '')}</h2>;
      }
      if (line.trim() === '') {
        return <br key={index} />;
      }
      return <p key={index} className="mb-4 text-gray-700 leading-relaxed text-lg">{line}</p>;
    });
  };

  return (
    <>
      <Helmet>
        <title>{post.title} | Blog Imóveis SP</title>
        <meta name="description" content={post.excerpt} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:image" content={post.featured_image} />
        <meta property="og:type" content="article" />
      </Helmet>

      <div className="min-h-screen bg-white pt-24 pb-16">
        <article className="max-w-4xl mx-auto px-4 sm:px-6">
          
          <Link 
            to="/blog" 
            className="inline-flex items-center text-gray-600 hover:text-[#0d5a7a] mb-8 group transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" /> 
            Voltar para o blog
          </Link>
          
          <header className="mb-8">
            <div className="flex flex-wrap gap-4 mb-6">
              <span className="bg-[#0d5a7a]/10 text-[#0d5a7a] px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide">
                {post.category || 'Geral'}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold text-[#1a3a52] mb-6 leading-tight">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-gray-600 border-b border-gray-100 pb-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-[#1a3a52]">
                   <User className="w-5 h-5" />
                </div>
                <span className="font-medium">{post.author || 'Equipe Imóveis SP'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4" /> 
                {new Date(post.created_at).toLocaleDateString('pt-BR')}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" />
                3 min de leitura
              </div>
            </div>
          </header>

          <div className="mb-10 rounded-2xl overflow-hidden shadow-lg bg-gray-100">
            <img 
              src={post.featured_image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80'} 
              alt={post.title} 
              className="w-full h-[300px] md:h-[500px] object-cover hover:scale-105 transition-transform duration-700" 
            />
          </div>
          
          {isHtml ? (
            <div 
              className="prose prose-lg prose-headings:text-[#1a3a52] prose-h2:mt-10 prose-h2:mb-4 prose-h3:mt-8 prose-p:text-gray-700 prose-p:mb-6 prose-a:text-[#0d5a7a] max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          ) : (
            <div className="prose prose-lg prose-headings:text-[#1a3a52] prose-a:text-[#0d5a7a] max-w-none text-gray-700">
               {formatContent(post.content)}
            </div>
          )}
          
          <div className="mt-12 pt-8 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50 p-6 rounded-xl">
              <div>
                <h3 className="font-bold text-[#1a3a52] text-lg mb-1">Gostou deste artigo?</h3>
                <p className="text-gray-600 text-sm">Compartilhe com seus amigos e familiares.</p>
              </div>
              <div className="flex gap-3">
                 <Button 
                    className="bg-[#25D366] hover:bg-[#128C7E] text-white border-none"
                    onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(post.title + ' ' + window.location.href)}`)}
                 >
                    <Share2 className="w-4 h-4 mr-2" />
                    WhatsApp
                 </Button>
                 <Button 
                    variant="outline"
                    className="hover:text-[#0077b5] hover:border-[#0077b5]" 
                    onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`)}
                 >
                    LinkedIn
                 </Button>
              </div>
            </div>
          </div>
        </article>
      </div>
    </>
  );
};

export default BlogDetailPage;