import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe seu email.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const normalizedEmail = email.toLowerCase().trim();
      
      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      setSubmitted(true);
      toast({
        title: "Email enviado",
        description: "Verifique sua caixa de entrada para instruções de recuperação.",
        className: "bg-green-50 border-green-200"
      });

    } catch (error) {
      console.error("Reset Password Error:", error);
      toast({
        title: "Erro ao enviar email",
        description: error.message || "Não foi possível enviar o email de recuperação. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Recuperar Senha | Imóveis SP</title>
      </Helmet>

      <div className="min-h-screen pt-16 flex items-center justify-center bg-[#f5f7fa] px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="bg-[#1a3a52] p-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Recuperar Senha</h1>
            <p className="text-blue-100">
              {submitted 
                ? "Email enviado com sucesso!" 
                : "Digite seu email para receber o link de redefinição"
              }
            </p>
          </div>

          <div className="p-8">
            {submitted ? (
              <div className="text-center space-y-6">
                <div className="bg-green-50 text-green-700 p-4 rounded-lg border border-green-100">
                  <p className="text-sm">
                    Enviamos um email para <strong>{email}</strong> com instruções para redefinir sua senha. 
                    Verifique sua caixa de entrada e também a pasta de spam.
                  </p>
                </div>
                
                <Link to="/login">
                  <Button className="w-full bg-[#1a3a52] hover:bg-[#1a3a52]/90 text-white">
                    Voltar para Login
                  </Button>
                </Link>
              </div>
            ) : (
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

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1a3a52] hover:bg-[#1a3a52]/90 text-white h-12 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span className="flex items-center justify-center">
                      Enviar Link <ArrowRight className="ml-2 w-5 h-5" />
                    </span>
                  )}
                </Button>

                <div className="text-center pt-2">
                  <Link to="/login" className="inline-flex items-center text-gray-600 hover:text-[#1a3a52] transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Login
                  </Link>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default ForgotPasswordPage;