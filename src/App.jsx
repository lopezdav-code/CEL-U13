import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Layout from '@/components/Layout';
import Accueil from '@/pages/Accueil';
import ListeJoueuses from '@/pages/ListeJoueuses';
import DetailJoueuse from '@/pages/DetailJoueuse';
import ListeMatchs from '@/pages/ListeMatchs';
import CreerMatch from '@/pages/CreerMatch';
import DetailMatch from '@/pages/DetailMatch';
import Photos from '@/pages/Photos';
import Statistiques from '@/pages/Statistiques';
import AdminClubs from '@/pages/AdminClubs';
import AdminUsers from '@/pages/AdminUsers';
import Quiz from '@/pages/Quiz';
import Profile from '@/pages/Profile';
import AdminDocs from '@/pages/AdminDocs';
import AdminSpecs from '@/pages/AdminSpecs';
import Login from '@/pages/Login';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { AnimatePresence } from 'framer-motion';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-green-600"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>CEL Pôle Féminin Côtière Est Lyonnais U13 - Gestion d'équipe</title>
        <meta name="description" content="Application de gestion et suivi d'équipe de football féminin U13 - CEL Pôle Féminin Côtière Est Lyonnais" />
      </Helmet>
      <Router basename={import.meta.env.BASE_URL}>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Accueil />} />
                      <Route path="/joueuses" element={<ListeJoueuses />} />
                      <Route path="/joueuses/:id" element={<DetailJoueuse />} />
                      <Route path="/matchs" element={<ListeMatchs />} />
                      <Route path="/matchs/creer" element={<CreerMatch />} />
                      <Route path="/matchs/:id" element={<DetailMatch />} />
                      <Route path="/photos" element={<Photos />} />
                      <Route path="/statistiques" element={<Statistiques />} />
                      <Route path="/quiz" element={<Quiz />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/admin-clubs" element={<AdminClubs />} />
                      <Route path="/admin-users" element={<AdminUsers />} />
                      <Route path="/admin-docs" element={<AdminDocs />} />
                      <Route path="/admin-specs" element={<AdminSpecs />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AnimatePresence>
        <Toaster />
      </Router>
    </>
  );
}

export default App;