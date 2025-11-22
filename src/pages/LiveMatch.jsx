import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { getMatch, getCompositionForMatch, getButsForMatch, addBut, removeBut } from '@/lib/storage';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Goal, Minus, Trophy, Users } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const LiveMatch = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [match, setMatch] = useState(null);
    const [composition, setComposition] = useState([]);
    const [buts, setButs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [butToDelete, setButToDelete] = useState(null);

    const fetchMatchData = async () => {
        try {
            setLoading(true);
            const [matchData, compositionData, butsData] = await Promise.all([
                getMatch(id),
                getCompositionForMatch(id),
                getButsForMatch(id),
            ]);

            if (matchData) {
                setMatch(matchData);
                setComposition(compositionData);
                setButs(butsData);
            }
        } catch (err) {
            console.error(err);
            toast({
                title: "❌ Erreur",
                description: "Impossible de charger les données du match.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMatchData();
    }, [id]);

    const handleAddBut = async (joueuseId) => {
        try {
            await addBut(id, joueuseId, 1);
            await fetchMatchData();
            toast({
                title: "⚽ But marqué !",
                description: "Le but a été ajouté.",
            });
        } catch (err) {
            console.error(err);
            toast({
                title: "❌ Erreur",
                description: "Impossible d'ajouter le but.",
                variant: "destructive",
            });
        }
    };

    const handleRemoveBut = async (butId) => {
        try {
            await removeBut(butId);
            await fetchMatchData();
            setButToDelete(null);
            toast({
                title: "✅ But retiré",
                description: "Le but a été supprimé.",
            });
        } catch (err) {
            console.error(err);
            toast({
                title: "❌ Erreur",
                description: "Impossible de retirer le but.",
                variant: "destructive",
            });
        }
    };

    // Calculer le nombre de buts par joueuse
    const getButsForJoueuse = (joueuseId) => {
        return buts.filter(but => but.joueuse_id === joueuseId);
    };

    const totalButs = buts.reduce((sum, but) => sum + but.nombre_de_buts, 0);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gradient-to-br from-green-600 to-emerald-700">
                <div className="text-white text-xl">Chargement...</div>
            </div>
        );
    }

    if (!match) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center">
                    <p className="text-xl mb-4">Match non trouvé</p>
                    <Link to="/matchs">
                        <Button>Retour aux matchs</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>Live - {match.nom_adversaire}</title>
            </Helmet>

            <div className="min-h-screen bg-gradient-to-br from-green-600 to-emerald-700 pb-20">
                {/* Header fixe */}
                <div className="sticky top-0 z-10 bg-gradient-to-r from-green-700 to-emerald-800 shadow-lg">
                    <div className="px-4 py-3">
                        <Link to={`/matchs/${id}`}>
                            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 mb-2">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Retour
                            </Button>
                        </Link>
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-white mb-1">
                                {match.nom_adversaire}
                            </h1>
                            <p className="text-green-100 text-sm">
                                {new Date(match.date_match).toLocaleDateString('fr-FR', {
                                    weekday: 'short',
                                    day: 'numeric',
                                    month: 'short'
                                })}
                            </p>
                        </div>
                    </div>

                    {/* Score */}
                    <div className="bg-white/10 backdrop-blur-sm py-4 px-4">
                        <div className="flex items-center justify-center gap-6">
                            <div className="text-center">
                                <p className="text-white/80 text-xs uppercase mb-1">Est Lyonnais</p>
                                <p className="text-5xl font-bold text-white">{totalButs}</p>
                            </div>
                            <div className="text-white/60 text-3xl font-light">-</div>
                            <div className="text-center">
                                <p className="text-white/80 text-xs uppercase mb-1">Adversaire</p>
                                <p className="text-5xl font-bold text-white/40">-</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Liste des joueuses */}
                <div className="px-4 py-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-white text-lg font-semibold flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Composition ({composition.length})
                        </h2>
                        <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                            <p className="text-white text-sm font-medium">
                                {totalButs} but{totalButs > 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>

                    {composition.length === 0 ? (
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center">
                            <p className="text-white/80">Aucune joueuse dans la composition</p>
                            <Link to={`/matchs/${id}`}>
                                <Button className="mt-4" variant="secondary">
                                    Ajouter des joueuses
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {composition
                                .sort((a, b) => a.joueuse.prenom.localeCompare(b.joueuse.prenom))
                                .map((comp) => {
                                    const joueusesButs = getButsForJoueuse(comp.joueuse_id);
                                    const totalButsJoueuse = joueusesButs.reduce((sum, but) => sum + but.nombre_de_buts, 0);

                                    return (
                                        <motion.div
                                            key={comp.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-white rounded-xl shadow-lg overflow-hidden"
                                        >
                                            {/* Bouton principal pour ajouter un but */}
                                            <button
                                                onClick={() => handleAddBut(comp.joueuse_id)}
                                                className="w-full p-4 flex items-center gap-4 active:bg-green-50 transition-colors"
                                            >
                                                <Avatar className="w-14 h-14 border-2 border-green-500">
                                                    <AvatarImage src={comp.joueuse.avatarUrl} />
                                                    <AvatarFallback className="bg-green-100 text-green-700 text-lg font-bold">
                                                        {comp.joueuse.prenom.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>

                                                <div className="flex-1 text-left">
                                                    <p className="font-bold text-gray-900 text-lg">
                                                        {comp.joueuse.prenom} {comp.joueuse.nom}
                                                    </p>
                                                    {comp.gardienne && (
                                                        <p className="text-xs text-green-600 font-medium">
                                                            🧤 Gardienne
                                                        </p>
                                                    )}
                                                </div>

                                                {totalButsJoueuse > 0 && (
                                                    <div className="flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full">
                                                        <Goal className="w-5 h-5 text-green-600" />
                                                        <span className="text-2xl font-bold text-green-700">
                                                            {totalButsJoueuse}
                                                        </span>
                                                    </div>
                                                )}
                                            </button>

                                            {/* Liste des buts pour retirer */}
                                            {joueusesButs.length > 0 && (
                                                <div className="border-t border-gray-100 bg-gray-50 px-4 py-2">
                                                    <div className="flex flex-wrap gap-2">
                                                        {joueusesButs.map((but) => (
                                                            <motion.button
                                                                key={but.id}
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                exit={{ scale: 0 }}
                                                                onClick={() => setButToDelete(but)}
                                                                className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-full text-sm font-medium transition-colors"
                                                            >
                                                                <Minus className="w-3 h-3" />
                                                                Retirer {but.nombre_de_buts > 1 ? `${but.nombre_de_buts} buts` : 'le but'}
                                                            </motion.button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                        </div>
                    )}
                </div>

                {/* Résumé en bas */}
                {totalButs > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl border-t-4 border-green-500 p-4"
                    >
                        <div className="flex items-center justify-between max-w-md mx-auto">
                            <div className="flex items-center gap-3">
                                <Trophy className="w-8 h-8 text-yellow-500" />
                                <div>
                                    <p className="text-sm text-gray-600">Total des buts</p>
                                    <p className="text-2xl font-bold text-green-600">{totalButs}</p>
                                </div>
                            </div>
                            <Link to={`/matchs/${id}`}>
                                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                                    Voir le détail
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Dialog de confirmation pour retirer un but */}
            <AlertDialog open={!!butToDelete} onOpenChange={() => setButToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Retirer ce but ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Voulez-vous vraiment retirer ce but ? Cette action est irréversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => butToDelete && handleRemoveBut(butToDelete.id)}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Retirer le but
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default LiveMatch;
