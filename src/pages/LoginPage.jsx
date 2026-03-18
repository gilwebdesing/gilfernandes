import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, ArrowRight, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { debugLogin } from '@/lib/authDebug';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [debugLoading, setDebugLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isDev = import.meta.env.DEV; // Check if in development mode

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha email e senha.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Email is normalized inside the context, but ensuring it here is also fine
      const result = await login({ email: email.trim(), password });
      
      if (result.success) {
        toast({
          title: "Bem-vindo de volta!",
          description: "Login realizado com sucesso.",
          className: "bg-green-50 border-green-200"
        });
        navigate('/imoveis');
      }
      // Errors are handled by toast in context
    } catch (error) {
      console.error("Login Page Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = async () => {
    setDebugLoading(true);
    const testEmail = 'gilfernandesml@gmail.com';
    // Prompt for password or use a known default for testing if applicable, 
    // but for security we should usually just pre-fill the email and let user type password,
    // OR try the debug utility with a password if this is a purely local dev test.
    // The prompt asked to "test the login with email gilfernandesml@gmail.com".
    // I'll assume I should use the current password field if filled, or alert the user.
    
    if (!password) {
      toast({
        title: "Senha necessária",
        description: "Por favor, digite a senha para o teste de debug.",
        variant: "destructive"
      });
      setDebugLoading(false);
      return;
    }

    console.log("--- STARTING DEBUG LOGIN TEST ---");
    try {
      const result = await debugLogin(testEmail, password);
      
      if (result.success) {
        toast({
          title: "Debug Login Success",
          description: "Check console for full details.",
          className: "bg-green-100"
        });
        // We can optionally navigate or just show success
      } else {
        toast({
          title: "Debug Login Failed",
          description: `Error: ${result.error?.message || 'Unknown error'}`,
          variant: "destructive"
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDebugLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Login | Imóveis SP</title>
      </Helmet>

      <div className="min-h-screen pt-16 flex items-center justify-center bg-[#f5f7fa] px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="bg-[#1a3a52] p-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Login</h1>
            <p className="text-blue-100">Acesse sua conta para continuar</p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#1a3a52] mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1a3a52] focus:border-transparent transition-all outline-none"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-[#1a3a52]">Senha</label>
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-[#ff8c42] hover:text-[#ff8c42]/80 font-medium transition-colors"
                  >
                    Esqueci a senha?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1a3a52] focus:border-transparent transition-all outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1a3a52] hover:bg-[#1a3a52]/90 text-white h-12 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span className="flex items-center justify-center">
                    Entrar <ArrowRight className="ml-2 w-5 h-5" />
                  </span>
                )}
              </Button>

              {isDev && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTestLogin}
                  disabled={debugLoading}
                  className="w-full border-dashed border-gray-400 text-gray-600 hover:bg-gray-50 h-10 text-sm font-medium"
                >
                  {debugLoading ? (
                    <span className="animate-pulse">Testing...</span>
                  ) : (
                    <span className="flex items-center">
                      <Bug className="mr-2 w-4 h-4" /> Debug: Test Login (gilfernandesml@gmail.com)
                    </span>
                  )}
                </Button>
              )}
            </form>

            <div className="mt-6 text-center pt-6 border-t border-gray-100">
              <p className="text-gray-600">
                Ainda não tem conta?{' '}
                <Link to="/cadastro" className="text-[#ff8c42] font-semibold hover:underline">
                  Cadastre-se gratuitamente
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default LoginPage;