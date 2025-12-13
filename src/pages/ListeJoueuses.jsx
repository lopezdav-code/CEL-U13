import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Eye, Loader2, Image as ImageIcon, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { getJoueuses, createJoueuse, updateJoueuse, deleteJoueuse, deleteAvatar, getAvatarUrl } from '@/lib/storage';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ListeJoueuses = () => {
  const [joueuses, setJoueuses] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingJoueuse, setEditingJoueuse] = React.useState(null);
  const { toast } = useToast();

  React.useEffect(() => {
    loadJoueuses();
  }, []);

  const loadJoueuses = async () => {
    setLoading(true);
    try {
      const data = await getJoueuses();
      setJoueuses(data);
    } catch (error) {
      toast({
        title: '❌ Erreur de chargement',
        description: "Impossible de récupérer la liste des joueuses.",
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredJoueuses = joueuses.filter(j =>
    `${j.nom} ${j.prenom}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedJoueuses = filteredJoueuses.reduce((acc, joueuse) => {
    const key = joueuse.classe || 'Non classé';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(joueuse);
    return acc;
  }, {});
  
  const classOrder = ['CM1', 'CM2', '6eme', '5eme', '4eme', 'Non classé'];

  const sortedGroups = Object.entries(groupedJoueuses).sort(([a], [b]) => {
    const indexA = classOrder.indexOf(a);
    const indexB = classOrder.indexOf(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  const handleSave = async (formData, avatarFile) => {
    try {
      if (editingJoueuse) {
        await updateJoueuse(editingJoueuse.id, formData, avatarFile);
        toast({ title: '✅ Joueuse modifiée avec succès!' });
      } else {
        await createJoueuse(formData, avatarFile);
        toast({ title: '✅ Joueuse ajoutée avec succès!' });
      }
      loadJoueuses();
      setDialogOpen(false);
      setEditingJoueuse(null);
    } catch (error) {
      toast({
        title: '❌ Erreur',
        description: error.message || "L'opération a échoué.",
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette joueuse ?')) {
      try {
        await deleteJoueuse(id);
        loadJoueuses();
        toast({ title: '✅ Joueuse supprimée' });
      } catch (error) {
        toast({
          title: '❌ Erreur',
          description: "Impossible de supprimer la joueuse.",
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>Joueuses - Suivi Équipe Foot</title>
        <meta name="description" content="Gestion des joueuses de l'équipe - Ajout, modification et suivi des joueuses" />
      </Helmet>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Joueuses</h1>
            <p className="text-gray-600 mt-1">{joueuses.length} joueuse{joueuses.length > 1 ? 's' : ''} enregistrée{joueuses.length > 1 ? 's' : ''}</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingJoueuse(null)} className="gap-2">
                <Plus className="w-4 h-4" />
                Ajouter une joueuse
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingJoueuse ? 'Modifier' : 'Ajouter'} une joueuse</DialogTitle>
                <DialogDescription>Remplissez les informations de la joueuse.</DialogDescription>
              </DialogHeader>
              <FormJoueuse
                initial={editingJoueuse}
                onSave={handleSave}
                onCancel={() => { setDialogOpen(false); setEditingJoueuse(null); }}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Rechercher une joueuse..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : (
          <>
            {filteredJoueuses.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    {searchTerm ? 'Aucune joueuse trouvée' : 'Aucune joueuse enregistrée'}
                  </p>
                </div>
            ) : (
                sortedGroups.map(([classe, joueusesInClasse]) => (
                <div key={classe}>
                  <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-800 border-b pb-2">{classe}</h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {joueusesInClasse.map((joueuse, index) => (
                      <motion.div
                        key={joueuse.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {joueuse.prenom} {joueuse.nom}
                            </h3>
                            {joueuse.age && (
                              <p className="text-sm text-gray-600">{joueuse.age} ans</p>
                            )}
                          </div>
                          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                             {joueuse.avatarUrl ? (
                              <img src={joueuse.avatarUrl} alt={`Avatar de ${joueuse.prenom}`} className="w-full h-full object-cover" />
                            ) : (
                              <span>{joueuse.prenom[0]}{joueuse.nom[0]}</span>
                            )}
                          </div>
                        </div>

                        {joueuse.nom_parents && (
                          <p className="text-sm text-gray-600 mb-4">
                            Parents: {joueuse.nom_parents}
                          </p>
                        )}

                        <div className="flex gap-2">
                          <Link to={`/joueuses/${joueuse.id}`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full gap-2">
                              <Eye className="w-4 h-4" />
                              Voir
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingJoueuse(joueuse);
                              setDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(joueuse.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </>
  );
};

const FormJoueuse = ({ initial, onSave, onCancel }) => {
  const [nom, setNom] = React.useState(initial?.nom || '');
  const [prenom, setPrenom] = React.useState(initial?.prenom || '');
  const [dateDeNaissance, setDateDeNaissance] = React.useState(initial?.date_de_naissance || '');
  const [nomParents, setNomParents] = React.useState(initial?.nom_parents || '');
  const [classe, setClasse] = React.useState(initial?.classe || undefined);
  const [avatarFile, setAvatarFile] = React.useState(null);
  const [avatarPreview, setAvatarPreview] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();
  
  const [joueuseData, setJoueuseData] = React.useState(initial);

  React.useEffect(() => {
    const fetchAvatar = async () => {
      if (initial?.photo_principale) {
        const url = await getAvatarUrl(initial.photo_principale);
        setAvatarPreview(url);
        setJoueuseData(prev => ({...prev, avatarUrl: url}));
      }
    };
    fetchAvatar();
  }, [initial]);


  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast({ title: "Fichier trop lourd", description: "L'avatar ne doit pas dépasser 5MB.", variant: "destructive" });
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveAvatar = async () => {
    if (!joueuseData?.photo_principale) return;

    setLoading(true);
    try {
      await deleteAvatar(joueuseData.photo_principale);
      await updateJoueuse(joueuseData.id, { ...joueuseData, photo_principale: null });
      
      setAvatarFile(null);
      setAvatarPreview(null);
      setJoueuseData(prev => ({...prev, photo_principale: null, avatarUrl: null}));
      
      toast({ title: "✅ Avatar supprimé" });
    } catch (error) {
      toast({ title: "❌ Erreur", description: "Impossible de supprimer l'avatar.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nom || !prenom) {
      alert('Le nom et le prénom sont obligatoires');
      return;
    }
    setLoading(true);
    await onSave({
      nom,
      prenom,
      date_de_naissance: dateDeNaissance || null, // Convert empty string to null
      nom_parents: nomParents,
      classe: classe || null, // Convert undefined to null
      photo_principale: joueuseData?.photo_principale,
    }, avatarFile);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Avatar</Label>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Aperçu de l'avatar" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <div className="flex-1 space-y-2">
            <Input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            <Button type="button" onClick={() => document.getElementById('avatar-upload').click()} disabled={loading} variant="outline">
              Changer
            </Button>
            {avatarPreview && (
              <Button type="button" onClick={handleRemoveAvatar} disabled={loading} variant="destructive">
                <X className="w-4 h-4 mr-2" /> Supprimer
              </Button>
            )}
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="prenom">Prénom *</Label>
        <Input id="prenom" value={prenom} onChange={(e) => setPrenom(e.target.value)} required disabled={loading} />
      </div>
      <div>
        <Label htmlFor="nom">Nom *</Label>
        <Input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} required disabled={loading} />
      </div>
      <div>
        <Label htmlFor="date_de_naissance">Date de naissance</Label>
        <Input id="date_de_naissance" type="date" value={dateDeNaissance} onChange={(e) => setDateDeNaissance(e.target.value)} disabled={loading} />
      </div>
      <div>
        <Label htmlFor="classe">Classe</Label>
        <Select onValueChange={setClasse} value={classe} disabled={loading}>
          <SelectTrigger id="classe">
            <SelectValue placeholder="Laisser pour calcul auto." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CM1">CM1</SelectItem>
            <SelectItem value="CM2">CM2</SelectItem>
            <SelectItem value="6eme">6ème</SelectItem>
            <SelectItem value="5eme">5ème</SelectItem>
            <SelectItem value="4eme">4ème</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="nomParents">Nom des parents</Label>
        <Input id="nomParents" value={nomParents} onChange={(e) => setNomParents(e.target.value)} disabled={loading} />
      </div>
      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1 gap-2" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Enregistrer
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Annuler</Button>
      </div>
    </form>
  );
};

export default ListeJoueuses;