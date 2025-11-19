import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, LogIn } from 'lucide-react';
import { Helmet } from 'react-helmet';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(identifier, password);
    if (!error) {
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <>
     <Helmet>
        <title>Connexion - Suivi Équipe Foot</title>
        <meta name="description" content="Page de connexion pour l'application de suivi d'équipe." />
      </Helmet>
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center">
            <motion.img
                src="https://horizons-cdn.hostinger.com/0f1614a9-17b3-439c-be8c-df5572adf30d/8fc831d80c179bbab7acc06ef276b849.png"
                alt="CEL Pôle Féminin Logo"
                className="mx-auto h-24 w-auto"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
            />
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Connexion à votre espace
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Bienvenue sur l'application de suivi de l'équipe U13.
            </p>
          </div>
          <motion.form
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mt-8 space-y-6 bg-white dark:bg-gray-900 p-8 shadow-xl rounded-lg border border-gray-200 dark:border-gray-800"
            onSubmit={handleLogin}
          >
            <div className="space-y-4">
              <div>
                <Label htmlFor="identifier" className="text-gray-700 dark:text-gray-300">Login</Label>
                <Input
                  id="identifier"
                  name="identifier"
                  type="text"
                  required
                  className="mt-1"
                  placeholder="Votre nom d'utilisateur"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="mt-1"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Button type="submit" className="w-full gap-2" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4" />
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Se connecter
                  </>
                )}
              </Button>
            </div>
          </motion.form>
        </motion.div>
      </div>
    </>
  );
};

export default Login;