import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext(undefined);

const isEmail = (str) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();

  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleSession = useCallback(async (session) => {
    setSession(session);
    setUser(session?.user ?? null);

    // Fetch user profile from profiles table
    if (session?.user) {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (!error && profileData) {
        setProfile(profileData);
      } else {
        setProfile(null);
      }
    } else {
      setProfile(null);
    }

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

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    if (!user) {
      const error = new Error("Aucun utilisateur connecté");
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Vous devez être connecté pour changer votre mot de passe.",
      });
      return { error };
    }

    // First verify the current password by attempting to sign in
    const email = user.email;
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });

    if (verifyError) {
      toast({
        variant: "destructive",
        title: "Mot de passe incorrect",
        description: "Le mot de passe actuel que vous avez saisi est incorrect.",
      });
      return { error: verifyError };
    }

    // If verification successful, update to new password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      toast({
        variant: "destructive",
        title: "Erreur de mise à jour",
        description: updateError.message || "Impossible de changer le mot de passe.",
      });
      return { error: updateError };
    }

    toast({
      title: "✅ Mot de passe modifié!",
      description: "Votre mot de passe a été changé avec succès.",
    });

    return { error: null };
  }, [user, toast]);

  const value = useMemo(() => ({
    user,
    session,
    profile,
    loading,
    supabase,
    signIn,
    signOut,
    adminCreateUser,
    changePassword,
  }), [user, session, profile, loading, signIn, signOut, adminCreateUser, changePassword]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};