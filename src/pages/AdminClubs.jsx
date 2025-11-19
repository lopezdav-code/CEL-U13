import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { getClubs, createClub, updateClub, deleteClub } from '@/lib/storage';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Edit, Trash2, Shield, MapPin, Image as ImageIcon, Upload } from 'lucide-react';

const AdminClubs = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClub, setEditingClub] = useState(null);
  const { toast } = useToast();

  const fetchClubs = useCallback(async () => {
    setLoading(true);
    try {
      const clubsData = await getClubs();
      setClubs(clubsData);
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de charger les clubs.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchClubs();
  }, [fetchClubs]);

  const handleSave = async (clubData, logoFile) => {
    try {
      if (editingClub) {
        await updateClub(editingClub.id, clubData, logoFile);
        toast({ title: '✅ Club mis à jour !' });
      } else {
        await createClub(clubData, logoFile);
        toast({ title: '✅ Club créé !' });
      }
      setDialogOpen(false);
      setEditingClub(null);
      fetchClubs();
    } catch (error) {
      toast({ title: '❌ Erreur', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce club ? Cette action est irréversible.')) {
      try {
        await deleteClub(id);
        toast({ title: '🗑️ Club supprimé.' });
        fetchClubs();
      } catch (error) {
        toast({ title: '❌ Erreur', description: error.message, variant: 'destructive' });
      }
    }
  };

  const openDialog = (club = null) => {
    setEditingClub(club);
    setDialogOpen(true);
  };

  return (
    <>
      <Helmet>
        <title>Gestion des Clubs - Admin</title>
        <meta name="description" content="Gérer les clubs adverses." />
      </Helmet>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Gestion des Clubs</h1>
            <p className="text-gray-600">Ajoutez, modifiez ou supprimez les clubs adverses.</p>
          </div>
          <Button onClick={() => openDialog()} className="gap-2">
            <Plus className="w-4 h-4" />
            Nouveau Club
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {clubs.map(club => (
              <motion.div
                key={club.id}
                className="bg-white border rounded-lg shadow-sm p-5 flex flex-col justify-between"
                whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
              >
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border">
                      {club.logoUrl ? (
                        <img src={club.logoUrl} alt={`Logo de ${club.nom}`} className="w-full h-full object-cover" />
                      ) : (
                        <Shield className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 flex-1">{club.nom}</h2>
                  </div>
                  {club.stade && (
                    <p className="text-gray-600 text-sm flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {club.stade}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={() => openDialog(club)}>
                    <Edit className="w-4 h-4" /> Modifier
                  </Button>
                  <Button variant="destructive" size="sm" className="flex-1 gap-2" onClick={() => handleDelete(club.id)}>
                    <Trash2 className="w-4 h-4" /> Supprimer
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingClub ? 'Modifier le Club' : 'Nouveau Club'}</DialogTitle>
          </DialogHeader>
          <ClubForm club={editingClub} onSave={handleSave} onCancel={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};

const ClubForm = ({ club, onSave, onCancel }) => {
  const [nom, setNom] = useState(club?.nom || '');
  const [stade, setStade] = useState(club?.stade || '');
  const [logoFile, setLogoFile] = useState(null);
  const [preview, setPreview] = useState(club?.logoUrl || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nom) return;
    setIsSubmitting(true);
    await onSave({ nom, stade, logo: club?.logo }, logoFile);
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nom">Nom du club *</Label>
        <Input id="nom" value={nom} onChange={e => setNom(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="stade">Stade principal</Label>
        <Input id="stade" value={stade} onChange={e => setStade(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Logo</Label>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border">
            {preview ? (
              <img src={preview} alt="Aperçu du logo" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <Button asChild variant="outline">
            <label htmlFor="logo-upload" className="cursor-pointer gap-2">
              <Upload className="w-4 h-4" />
              {preview ? 'Changer' : 'Choisir'}
              <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          </Button>
        </div>
      </div>
      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>
      </div>
    </form>
  );
};

export default AdminClubs;