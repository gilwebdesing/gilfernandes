import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { ensureBrokerExists } from '@/lib/ensureBrokerExists';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [broker, setBroker] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!supabase || !supabase.auth) {
      console.warn('Supabase client not initialized or invalid configuration.');
      setLoading(false);
      return;
    }

    // Check initial session
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[Auth] Auth state changed: ${event}`);
      if (session?.user) {
        setUser(session.user);
        await handleUserSession(session.user);
      } else {
        setUser(null);
        setBroker(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('[Auth] Error checking session:', error);
      }
      
      if (session?.user) {
        console.log('[Auth] Session restored for user:', session.user.email);
        setUser(session.user);
        await handleUserSession(session.user);
      } else {
        console.log('[Auth] No active session found.');
      }
    } catch (error) {
      console.error('[Auth] Unexpected error checking session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSession = async (currentUser) => {
    try {
      // Ensure broker profile exists (auto-create if needed)
      const brokerData = await ensureBrokerExists(
        currentUser.id, 
        currentUser.email, 
        currentUser.user_metadata?.name
      );
      
      if (brokerData) {
        setBroker(brokerData);
      }
    } catch (error) {
      console.error('[Auth] Failed to load/create broker profile:', error);
      toast({
        title: "Aviso de Perfil",
        description: "Houve um problema ao carregar seu perfil de corretor. Tente recarregar a página.",
        variant: "destructive"
      });
    }
  };

  const register = async ({ name, email, phone, whatsapp, password }) => {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      console.log(`[Auth] Attempting registration for: ${normalizedEmail}`);

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: password,
        options: {
          data: { name, phone, whatsapp }
        }
      });

      if (authError) {
        console.error('[Auth] Registration error:', authError);
        throw authError;
      }

      if (authData.user) {
        console.log('[Auth] User created successfully:', authData.user.id);
        
        // Explicitly create profile (though handleUserSession would do it too)
        // We do it here to ensure data like phone/whatsapp is captured initially
        await ensureBrokerExists(authData.user.id, normalizedEmail, name);
        
        return { success: true };
      }
      
      return { success: true, message: 'Check your email for confirmation link.' };

    } catch (error) {
      let errorMessage = error.message;
      if (error.message.includes('User already registered')) {
        errorMessage = "Este email já está cadastrado.";
      }

      toast({
        title: "Erro no cadastro",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const login = async ({ email, password }) => {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      console.log(`[Auth] Attempting login for: ${normalizedEmail}`);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: password,
      });

      if (error) {
        console.error('[Auth] Login error:', error);
        throw error;
      }

      console.log('[Auth] Login successful for:', data.user.email);
      return { success: true };
    } catch (error) {
      let friendlyMessage = "Erro ao fazer login.";
      
      if (error.message === 'Invalid login credentials') {
        friendlyMessage = "Email ou senha incorretos.";
      } else if (error.message.includes('Email not confirmed')) {
        friendlyMessage = "Por favor, confirme seu email antes de entrar.";
      }

      toast({
        title: "Erro no login",
        description: friendlyMessage,
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setBroker(null);
      toast({ title: "Logout realizado", description: "Até logo!" });
    } catch (error) {
      toast({ title: "Erro ao sair", description: error.message, variant: "destructive" });
    }
  };

  return (
    <AuthContext.Provider value={{ user, broker, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};