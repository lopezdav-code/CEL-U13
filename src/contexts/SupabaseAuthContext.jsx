import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext(undefined);

const isEmail = (str) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();

  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleSession = useCallback(async (session) => {
    setSession(session);
    setUser(session?.user ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      handleSession(session);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        handleSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, [handleSession]);

  const signIn = useCallback(async (identifier, password) => {
    const email = isEmail(identifier) ? identifier : `${identifier}@example.com`; // Keep dummy for login flexibility
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
        let description = "Veuillez vérifier votre login et mot de passe.";
        if (!error.message.includes("Invalid login credentials")) {
            description = error.message;
        }
       toast({
        variant: "destructive",
        title: "La connexion a échoué",
        description,
      });
    }

    return { error };
  }, [toast]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Sign out Failed",
        description: error.message || "Something went wrong",
      });
    }
    return { error };
  }, [toast]);
  
  const adminCreateUser = useCallback(async (email, password, name, role) => {
    const { data, error } = await supabase.functions.invoke('create-user-and-profile', {
      body: { email, password, name, role },
    });

    if (error || (data && data.error)) {
      const errorMessage = (data && data.error) || error.message || "Impossible de créer l'utilisateur.";
      toast({
        variant: "destructive",
        title: "Erreur de création",
        description: errorMessage,
      });
      return { data: null, error: new Error(errorMessage) };
    } else {
      toast({
        title: "🎉 Utilisateur créé!",
        description: `Le compte pour "${name}" a été créé avec succès.`,
      });
    }
    
    return { data, error: null };
  }, [toast]);

  const value = useMemo(() => ({
    user,
    session,
    loading,
    supabase,
    signIn,
    signOut,
    adminCreateUser,
  }), [user, session, loading, signIn, signOut, adminCreateUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};