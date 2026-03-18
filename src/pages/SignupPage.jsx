import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, MessageSquare, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Senhas não conferem",
        description: "Por favor, verifique a confirmação da senha.",
        variant: "destructive"
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    // Normalize email before sending, keep password raw
    const normalizedEmail = formData.email.toLowerCase().trim();
    
    console.log(`[Signup] Starting signup process for: ${normalizedEmail}`);

    try {
      const result = await register({
        name: formData.name,
        email: normalizedEmail,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        password: formData.password // Password sent EXACTLY as typed
      });
      
      if (result.success) {
        toast({
          title: "Conta criada com sucesso!",
          description: "Faça login para continuar.",
          className: "bg-green-50 border-green-200"
        });
        navigate('/login');
      } else {
        // Error handling is mostly done inside register() via toast, 
        // but we can catch edge cases here if register returns { success: false }
        console.error('[Signup] Register returned failure:', result.error);
      }
    } catch (error) {
      console.error('[Signup] Uncaught error:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao processar o cadastro.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Cadastro | Imóveis SP</title>
      </Helmet>

      <div className="min-h-screen pt-20 flex items-center justify-center bg-[#f5f7fa] px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="bg-[#1a3a52] p-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Criar Conta</h1>
            <p className="text-blue-100">Junte-se a nós e encontre seu imóvel ideal</p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1a3a52] mb-2">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1a3a52] focus:border-transparent transition-all outline-none"
                    placeholder="Seu nome"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1a3a52] mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1a3a52] focus:border-transparent transition-all outline-none"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1a3a52] mb-2">Telefone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1a3a52] focus:border-transparent transition-all outline-none"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1a3a52] mb-2">WhatsApp</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1a3a52] focus:border-transparent transition-all outline-none"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1a3a52] mb-2">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1a3a52] focus:border-transparent transition-all outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1a3a52] mb-2">Confirmar Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1a3a52] focus:border-transparent transition-all outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#ff8c42] hover:bg-[#ff8c42]/90 text-white h-12 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all mt-4"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span className="flex items-center justify-center">
                    Criar Conta <ArrowRight className="ml-2 w-5 h-5" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center pt-6 border-t border-gray-100">
              <p className="text-gray-600">
                Já tem uma conta?{' '}
                <Link to="/login" className="text-[#1a3a52] font-semibold hover:underline">
                  Fazer login
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default SignupPage;