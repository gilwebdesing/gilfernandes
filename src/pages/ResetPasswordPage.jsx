import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a hash fragment which contains the access_token/refresh_token
    // Supabase usually puts the token in the URL hash for recovery flows
    const hash = window.location.hash;
    
    // We don't strictly need to parse it ourselves if supabase.auth.onAuthStateChange catches it,
    // but checking for its existence is good practice to ensure the user didn't just browse here manually.
    if (!hash && !loading && !success) {
      // If there is no hash and no session, we might want to redirect, 
      // but let's let supabase handle the session recovery first.
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Senhas não conferem",
        description: "Por favor, verifique se as senhas são iguais.",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password: password });

      if (error) {
        throw error;
      }

      setSuccess(true);
      toast({
        title: "Senha atualizada!",
        description: "Sua senha foi redefinida com sucesso.",
        className: "bg-green-50 border-green-200"
      });

      // Redirect after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (error) {
      console.error("Update Password Error:", error);
      toast({
        title: "Erro ao atualizar senha",
        description: error.message || "Ocorreu um erro. O link pode ter expirado.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Redefinir Senha | Imóveis SP</title>
      </Helmet>

      <div className="min-h-screen pt-16 flex items-center justify-center bg-[#f5f7fa] px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="bg-[#1a3a52] p-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Nova Senha</h1>
            <p className="text-blue-100">
              {success ? "Tudo pronto!" : "Digite sua nova senha abaixo"}
            </p>
          </div>

          <div className="p-8">
            {success ? (
              <div className="text-center py-8">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Senha Alterada!</h3>
                <p className="text-gray-600 mb-6">
                  Sua senha foi atualizada com sucesso. Você será redirecionado para o login em instantes.
                </p>
                <Button 
                  onClick={() => navigate('/login')}
                  className="w-full bg-[#1a3a52] hover:bg-[#1a3a52]/90 text-white"
                >
                  Ir para Login agora
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#1a3a52] mb-2">Nova Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1a3a52] focus:border-transparent transition-all outline-none"
                      placeholder="••••••••"
                      minLength={6}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1a3a52] mb-2">Confirmar Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1a3a52] focus:border-transparent transition-all outline-none"
                      placeholder="••••••••"
                      minLength={6}
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
                      Redefinir Senha <ArrowRight className="ml-2 w-5 h-5" />
                    </span>
                  )}
                </Button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default ResetPasswordPage;