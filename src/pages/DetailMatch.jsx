import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    getMatch,
    getJoueuses,
    getClubs,
    updateMatch,
    deleteMatch,
    createPartie,
    updatePartie,
    deletePartie,
    getCompositionForMatch,
    addComposition,
    removeComposition,
    updateComposition,
    getButsForMatch,
    addBut,
    removeBut,
    uploadMatchPhotos,
    deleteMatchPhotoFromMatch,
    getMatchPhotoUrl,
} from '@/lib/storage';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
    DialogTrigger, // Added DialogTrigger
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
    Loader2,
    Calendar,
    Clock,
    MapPin,
    Shield,
    Users,
    PlusCircle,
    Trash2,
    Edit,
    Save,
    X,
    Goal,
    Award,
    Trophy,
    Plane,
    Home,
    Camera,
    Upload,
    ArrowLeft,
    ChevronsUpDown,
    ChevronLeft,
    ChevronRight,
    Expand,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const DetailMatch = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [match, setMatch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isEditing, setIsEditing] = useState(false);
    const [editedMatch, setEditedMatch] = useState(null);
    const [clubs, setClubs] = useState([]);

    const [composition, setComposition] = useState([]);
    const [buts, setButs] = useState([]);
    const [joueuses, setJoueuses] = useState([]);

    const [isCompositionOpen, setIsCompositionOpen] = useState(false);
    const [isButsOpen, setIsButsOpen] = useState(false);
    const [isPartieOpen, setIsPartieOpen] = useState(false);
    const [isPhotoOpen, setIsPhotoOpen] = useState(false);

    const [selectedPartie, setSelectedPartie] = useState(null);

    const fetchMatchData = useCallback(async () => {
        try {
            setLoading(true);
            const [matchData, joueusesData, clubsData, compositionData, butsData] = await Promise.all([
                getMatch(id),
                getJoueuses(),
                getClubs(),
                getCompositionForMatch(id),
                getButsForMatch(id),
            ]);

            if (matchData) {
                setMatch(matchData);
                setEditedMatch(matchData);
                setComposition(compositionData);
                setButs(butsData);
            } else {
                setError("Match non trouvé.");
            }
            setJoueuses(joueusesData);
            setClubs(clubsData);
        } catch (err) {
            console.error(err);
            setError("Erreur lors du chargement du match.");
            toast({
                title: "❌ Erreur de chargement",
                description: "Impossible de récupérer les détails du match.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [id, toast]);

    useEffect(() => {
        fetchMatchData();
    }, [fetchMatchData]);

    const handleEditToggle = () => {
        if (isEditing) {
            setEditedMatch(match); // Reset changes
        }
        setIsEditing(!isEditing);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditedMatch(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSelectChange = (name, value) => {
        const newEditedMatch = { ...editedMatch, [name]: value };
        if (name === 'type_match') {
            if (value === 'tournoi' || value === 'coupe') {
                newEditedMatch.adversaire_id = null;
                newEditedMatch.is_multi_partie = true;
            } else {
                newEditedMatch.titre = '';
            }
        }
        setEditedMatch(newEditedMatch);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateMatch(id, editedMatch);
            setMatch(editedMatch);
            setIsEditing(false);
            toast({ title: "✅ Succès", description: "Le match a été mis à jour." });
        } catch (err) {
            console.error(err);
            toast({ title: "❌ Erreur", description: "Impossible de mettre à jour le match.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteMatch(id);
            toast({ title: "✅ Succès", description: "Le match a été supprimé." });
            navigate('/matchs');
        } catch (err) {
            console.error(err);
            toast({ title: "❌ Erreur", description: "Impossible de supprimer le match.", variant: "destructive" });
        }
    };

    const openPartieDialog = (partie) => {
        setSelectedPartie(partie);
        setIsPartieOpen(true);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="w-16 h-16 animate-spin text-green-600" /></div>;
    }

    if (error) {
        return <div className="text-center py-10 text-red-500">{error}</div>;
    }

    if (!match) {
        return <div className="text-center py-10">Aucun match trouvé.</div>;
    }

    const isSpecialType = editedMatch.type_match === 'tournoi' || editedMatch.type_match === 'coupe';
    const matchDate = new Date(match.date_match);
    const isPastMatch = matchDate < new Date();

    return (
        <>
            <Helmet>
                <title>Détail du match - {match.nom_adversaire || 'Titre'}</title>
            </Helmet>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
            >
                <div className="flex justify-between items-start">
                    <Link to="/matchs">
                        <Button variant="ghost" className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" /> Retour aux matchs</Button>
                    </Link>
                    <Link to={`/matchs/${id}/live`}>
                        <Button className="mb-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg">
                            <Goal className="mr-2 h-4 w-4" /> Lancer le match
                        </Button>
                    </Link>
                </div>

                <HeaderMatch match={match} onEdit={handleEditToggle} isEditing={isEditing} />

                {isEditing ? (
                    <EditMatchForm
                        editedMatch={editedMatch}
                        onInputChange={handleInputChange}
                        onSelectChange={handleSelectChange}
                        clubs={clubs}
                        isSpecialType={isSpecialType}
                        onSave={handleSave}
                        onCancel={handleEditToggle}
                        onDelete={handleDelete}
                    />
                ) : (
                    <DisplayMatchInfo match={match} />
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <CompositionSection
                        composition={composition}
                        joueuses={joueuses}
                        matchId={id}
                        onCompositionUpdate={fetchMatchData}
                        isPastMatch={isPastMatch}
                        onOpenChange={setIsCompositionOpen}
                    />
                    <ButsSection
                        buts={buts}
                        composition={composition}
                        matchId={id}
                        onButsUpdate={fetchMatchData}
                        isPastMatch={isPastMatch}
                        onOpenChange={setIsButsOpen}
                    />
                </div>

                <PartiesSection
                    match={match}
                    onPartieUpdate={fetchMatchData}
                    openPartieDialog={openPartieDialog}
                    isPastMatch={isPastMatch}
                    onOpenChange={setIsPartieOpen}
                />

                <PhotosSection
                    match={match}
                    onPhotosUpdate={fetchMatchData}
                    onOpenChange={setIsPhotoOpen}
                />
            </motion.div>

            <PartieDialog
                isOpen={isPartieOpen}
                onOpenChange={setIsPartieOpen}
                partie={selectedPartie}
                matchId={id}
                clubs={clubs}
                onPartieUpdate={fetchMatchData}
                isMultiPartie={match.is_multi_partie}
            />
        </>
    );
};

const HeaderMatch = ({ match, onEdit, isEditing }) => (
    <div className="p-6 bg-gradient-to-br from-green-600 to-emerald-700 rounded-lg text-white shadow-lg">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm uppercase tracking-widest text-green-200 flex items-center gap-2">
                    {match.type_match === 'championnat' && <Trophy className="w-4 h-4" />}
                    {match.type_match === 'amical' && <Users className="w-4 h-4" />}
                    {match.type_match === 'tournoi' && <Award className="w-4 h-4" />}
                    {match.type_match === 'coupe' && <Shield className="w-4 h-4" />}
                    {match.type_match}
                </p>
                <h1 className="text-4xl font-bold mt-2">{match.nom_adversaire}</h1>
                <div className="flex items-center gap-4 mt-3 text-green-100">
                    <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {new Date(match.date_match).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    {match.heure && <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {match.heure}</span>}
                    {match.is_away ? <span className="flex items-center gap-1 font-semibold"><Plane className="w-4 h-4" />Extérieur</span> : <span className="flex items-center gap-1 font-semibold"><Home className="w-4 h-4" />Domicile</span>}
                </div>
            </div>
            <Button onClick={onEdit} variant="ghost" className="text-white hover:bg-white/20">
                {isEditing ? <><X className="mr-2 h-4 w-4" /> Annuler</> : <><Edit className="mr-2 h-4 w-4" /> Modifier</>}
            </Button>
        </div>
    </div>
);

const EditMatchForm = ({ editedMatch, onInputChange, onSelectChange, clubs, isSpecialType, onSave, onCancel, onDelete }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-6 rounded-lg border shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <Label htmlFor="type_match">Type de match</Label>
                <Select value={editedMatch.type_match} onValueChange={(value) => onSelectChange('type_match', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="championnat">Championnat</SelectItem>
                        <SelectItem value="amical">Amical</SelectItem>
                        <SelectItem value="tournoi">Tournoi</SelectItem>
                        <SelectItem value="coupe">Coupe</SelectItem>
                        <SelectItem value="futsal">Futsal</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {isSpecialType ? (
                <div>
                    <Label htmlFor="titre">Titre</Label>
                    <Input id="titre" name="titre" value={editedMatch.titre || ''} onChange={onInputChange} />
                </div>
            ) : (
                <div>
                    <Label htmlFor="adversaire_id">Adversaire</Label>
                    <Select value={editedMatch.adversaire_id?.toString()} onValueChange={(value) => onSelectChange('adversaire_id', value)}>
                        <SelectTrigger><SelectValue placeholder="Sélectionner un club" /></SelectTrigger>
                        <SelectContent>
                            {clubs.map(club => <SelectItem key={club.id} value={club.id.toString()}>{club.nom}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><Label htmlFor="date_match">Date</Label><Input id="date_match" name="date_match" type="date" value={editedMatch.date_match} onChange={onInputChange} /></div>
            <div><Label htmlFor="heure">Heure</Label><Input id="heure" name="heure" type="time" value={editedMatch.heure || ''} onChange={onInputChange} /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><Label htmlFor="ville">Ville</Label><Input id="ville" name="ville" value={editedMatch.ville || ''} onChange={onInputChange} /></div>
            <div><Label htmlFor="stade">Stade</Label><Input id="stade" name="stade" value={editedMatch.stade || ''} onChange={onInputChange} /></div>
        </div>
        <div><Label htmlFor="commentaire">Commentaire</Label><Textarea id="commentaire" name="commentaire" value={editedMatch.commentaire || ''} onChange={onInputChange} /></div>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2"><Checkbox id="is_away" name="is_away" checked={editedMatch.is_away} onCheckedChange={(checked) => onSelectChange('is_away', checked)} /><Label htmlFor="is_away">Extérieur</Label></div>
                <div className="flex items-center gap-2"><Checkbox id="is_multi_partie" name="is_multi_partie" checked={editedMatch.is_multi_partie} onCheckedChange={(checked) => onSelectChange('is_multi_partie', checked)} disabled={isSpecialType} /><Label htmlFor="is_multi_partie">Plateau</Label></div>
            </div>
            <div className="flex gap-2">
                <Button onClick={onCancel} variant="outline">Annuler</Button>
                <Button onClick={onSave}><Save className="mr-2 h-4 w-4" /> Enregistrer</Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" /> Supprimer</Button></AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle><AlertDialogDescription>Cette action est irréversible et supprimera définitivement le match et toutes ses données.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={onDelete}>Supprimer</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    </motion.div>
);

const DisplayMatchInfo = ({ match }) => (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <InfoBlock icon={<MapPin />} label="Lieu" value={`${match.ville || 'Non défini'}${match.stade ? `, ${match.stade}` : ''}`} />
            <InfoBlock icon={match.is_away ? <Plane /> : <Home />} label="Statut" value={match.is_away ? "Extérieur" : "Domicile"} />
            <InfoBlock icon={<ChevronsUpDown />} label="Format" value={match.is_multi_partie ? 'Plateau' : 'Match simple'} />
            <InfoBlock icon={
                match.type_match === 'championnat' ? <Trophy /> :
                    match.type_match === 'amical' ? <Users /> :
                        match.type_match === 'tournoi' ? <Award /> :
                            <Shield />
            } label="Type" value={match.type_match} />
        </div>
        {match.commentaire && (
            <div className="mt-6 border-t pt-6">
                <h3 className="font-semibold text-gray-800 mb-2">Commentaires</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{match.commentaire}</p>
            </div>
        )}
    </div>
);

const InfoBlock = ({ icon, label, value }) => (
    <div className="flex items-start gap-4">
        <div className="text-green-600 bg-green-50 p-3 rounded-full">{React.cloneElement(icon, { className: "w-6 h-6" })}</div>
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="font-semibold text-gray-800 capitalize">{value}</p>
        </div>
    </div>
);

const CompositionSection = ({ composition, joueuses, matchId, onCompositionUpdate, isPastMatch, onOpenChange }) => {
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedJoueuse, setSelectedJoueuse] = useState('');
    const [isGardienne, setIsGardienne] = useState(false);

    const availableJoueuses = joueuses
        .filter(j => !composition.some(c => c.joueuse_id === j.id))
        .sort((a, b) => a.prenom.localeCompare(b.prenom));

    const handleAddJoueuse = async () => {
        if (!selectedJoueuse) return;
        try {
            await addComposition(matchId, parseInt(selectedJoueuse), true, isGardienne);
            await onCompositionUpdate();
            setIsDialogOpen(false);
            setSelectedJoueuse('');
            setIsGardienne(false);
            toast({ title: "✅ Succès", description: "Joueuse ajoutée à la composition." });
        } catch (err) {
            console.error(err);
            toast({ title: "❌ Erreur", description: "Impossible d'ajouter la joueuse.", variant: "destructive" });
        }
    };

    const handleRemoveJoueuse = async (compositionId) => {
        try {
            await removeComposition(compositionId);
            await onCompositionUpdate();
            toast({ title: "✅ Succès", description: "Joueuse retirée de la composition." });
        } catch (err) {
            console.error(err);
            toast({ title: "❌ Erreur", description: "Impossible de retirer la joueuse.", variant: "destructive" });
        }
    };

    const toggleGardienne = async (comp) => {
        try {
            await updateComposition(comp.id, { gardienne: !comp.gardienne });
            await onCompositionUpdate();
            toast({ title: "✅ Succès", description: "Statut de gardienne mis à jour." });
        } catch (err) {
            console.error(err);
            toast({ title: "❌ Erreur", description: "Impossible de mettre à jour le statut.", variant: "destructive" });
        }
    };

    return (
        <Card title="Composition de l'équipe" count={composition.length}>
            <div className="space-y-3">
                {composition.sort((a, b) => a.joueuse.prenom.localeCompare(b.joueuse.prenom)).map(comp => (
                    <div key={comp.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                        <div className="flex items-center gap-3">
                            <Avatar><AvatarImage src={comp.joueuse.avatarUrl} /><AvatarFallback>{comp.joueuse.prenom.charAt(0)}</AvatarFallback></Avatar>
                            <span className="font-medium">{comp.joueuse.prenom} {comp.joueuse.nom}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button size="icon" variant={comp.gardienne ? "default" : "outline"} onClick={() => toggleGardienne(comp)}>
                                <Shield className={`w-4 h-4 ${comp.gardienne ? 'text-white' : ''}`} />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => handleRemoveJoueuse(comp.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                        </div>
                    </div>
                ))}
            </div>
            {composition.length === 0 && <p className="text-gray-500 italic text-center py-4">Aucune joueuse dans la composition.</p>}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button className="w-full mt-4" variant="outline"><PlusCircle className="mr-2 h-4 w-4" /> Ajouter une joueuse</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ajouter une joueuse à la composition</DialogTitle>
                        <DialogDescription>Sélectionnez une joueuse et indiquez si elle est gardienne.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Select onValueChange={setSelectedJoueuse} value={selectedJoueuse}>
                            <SelectTrigger><SelectValue placeholder="Sélectionner une joueuse" /></SelectTrigger>
                            <SelectContent>
                                {availableJoueuses.map(j => <SelectItem key={j.id} value={j.id.toString()}>{j.prenom} {j.nom}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <div className="flex items-center space-x-2"><Checkbox id="isGardienne" checked={isGardienne} onCheckedChange={setIsGardienne} /><Label htmlFor="isGardienne">Gardienne</Label></div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Annuler</Button></DialogClose>
                        <Button onClick={handleAddJoueuse}>Ajouter</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
};

const ButsSection = ({ buts, composition, matchId, onButsUpdate, isPastMatch, onOpenChange }) => {
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedJoueuse, setSelectedJoueuse] = useState('');
    const [nombreDeButs, setNombreDeButs] = useState(1);

    const handleAddBut = async () => {
        if (!selectedJoueuse || nombreDeButs < 1) return;
        try {
            await addBut(matchId, parseInt(selectedJoueuse), nombreDeButs);
            await onButsUpdate();
            setIsDialogOpen(false);
            setSelectedJoueuse('');
            setNombreDeButs(1);
            toast({ title: "✅ Succès", description: "But(s) ajouté(s)." });
        } catch (err) {
            console.error(err);
            toast({ title: "❌ Erreur", description: "Impossible d'ajouter le(s) but(s).", variant: "destructive" });
        }
    };

    const handleRemoveBut = async (butId) => {
        try {
            await removeBut(butId);
            await onButsUpdate();
            toast({ title: "✅ Succès", description: "But supprimé." });
        } catch (err) {
            console.error(err);
            toast({ title: "❌ Erreur", description: "Impossible de supprimer le but.", variant: "destructive" });
        }
    };

    const totalButs = buts.reduce((sum, but) => sum + but.nombre_de_buts, 0);

    return (
        <Card title="Buteuses" count={totalButs}>
            <div className="space-y-3">
                {buts.map(but => (
                    <div key={but.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                        <div className="flex items-center gap-3">
                            <Goal className="w-5 h-5 text-yellow-500" />
                            <span className="font-medium">{but.joueuse.prenom} {but.joueuse.nom}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold">{but.nombre_de_buts} but(s)</span>
                            <Button size="icon" variant="ghost" onClick={() => handleRemoveBut(but.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                        </div>
                    </div>
                ))}
            </div>
            {buts.length === 0 && <p className="text-gray-500 italic text-center py-4">Aucun but enregistré pour ce match.</p>}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button className="w-full mt-4" variant="outline"><PlusCircle className="mr-2 h-4 w-4" /> Ajouter une buteuse</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ajouter une buteuse</DialogTitle>
                        <DialogDescription>Sélectionnez une joueuse et le nombre de buts marqués.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Select onValueChange={setSelectedJoueuse} value={selectedJoueuse}>
                            <SelectTrigger><SelectValue placeholder="Sélectionner une joueuse" /></SelectTrigger>
                            <SelectContent>
                                {composition.map(c => <SelectItem key={c.joueuse.id} value={c.joueuse.id.toString()}>{c.joueuse.prenom} {c.joueuse.nom}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Input type="number" value={nombreDeButs} onChange={e => setNombreDeButs(parseInt(e.target.value))} min="1" />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Annuler</Button></DialogClose>
                        <Button onClick={handleAddBut}>Ajouter</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
};

const PartiesSection = ({ match, onPartieUpdate, openPartieDialog, isPastMatch, onOpenChange }) => {
    const { toast } = useToast();

    const handleCreatePartie = async () => {
        try {
            await createPartie({ match_id: match.id, score_equipe: 0, score_adversaire: 0 });
            await onPartieUpdate();
            toast({ title: "✅ Succès", description: "Nouvelle partie ajoutée." });
        } catch (err) {
            console.error(err);
            toast({ title: "❌ Erreur", description: "Impossible d'ajouter la partie.", variant: "destructive" });
        }
    };

    return (
        <Card title={match.is_multi_partie ? 'Scores des parties' : 'Score Final'}>
            {match.is_multi_partie ? (
                <>
                    <Table>
                        <TableHeader><TableRow><TableHead>Adversaire</TableHead><TableHead>Score</TableHead><TableHead>Commentaire</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {match.parties.map(partie => (
                                <TableRow key={partie.id}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        {/* <Avatar className="w-8 h-8"><AvatarImage src={partie.adversaire?.logoUrl} /><AvatarFallback>{partie.adversaire?.nom.charAt(0)}</AvatarFallback></Avatar> */} {/* Corrected to use optional chaining for partie.adversaire */}
                                        {partie.adversaire?.nom} {/* Corrected to use optional chaining for partie.adversaire */}
                                    </TableCell>
                                    <TableCell>
                                        <ScoreBadge score1={partie.score_equipe} score2={partie.score_adversaire} />
                                    </TableCell>
                                    <TableCell>{partie.commentaire}</TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm" variant="ghost" onClick={() => openPartieDialog(partie)}>Modifier</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <Button onClick={handleCreatePartie} className="w-full mt-4" variant="outline"><PlusCircle className="mr-2 h-4 w-4" /> Ajouter une partie</Button>
                </>
            ) : (
                <div className="flex justify-center items-center p-8">
                    {match.score_equipe !== null && match.score_adversaire !== null ? (
                        <div className="text-center">
                            <div className="flex items-center gap-4">
                                <span className="text-4xl font-bold">EST LYONNAIS</span>
                                <ScoreBadge score1={match.score_equipe} score2={match.score_adversaire} large />
                                <span className="text-4xl font-bold">{match.adversaire?.nom.toUpperCase()}</span> {/* Corrected to use optional chaining for match.adversaire */}
                            </div>
                            <Button onClick={() => openPartieDialog(match.parties[0])} className="mt-6" variant="outline"><Edit className="mr-2 h-4 w-4" /> Modifier le score</Button>
                        </div>
                    ) : (
                        <div className="text-center">
                            <p className="text-gray-500 italic">Le score n'a pas encore été enregistré.</p>
                            <Button onClick={() => openPartieDialog(match.parties[0])} className="mt-4"><PlusCircle className="mr-2 h-4 w-4" /> Ajouter le score</Button>
                        </div>
                    )}
                </div>
            )}
        </Card>
    )
};

const PartieDialog = ({ isOpen, onOpenChange, partie, matchId, clubs, onPartieUpdate, isMultiPartie }) => {
    const { toast } = useToast();
    const [editedPartie, setEditedPartie] = useState(partie);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setEditedPartie(partie);
    }, [partie]);

    if (!editedPartie) return null;

    const handleSave = async () => {
        setLoading(true);
        try {
            await updatePartie(editedPartie.id, {
                score_equipe: editedPartie.score_equipe,
                score_adversaire: editedPartie.score_adversaire,
                adversaire_id: isMultiPartie ? editedPartie.adversaire_id : null,
                commentaire: isMultiPartie ? editedPartie.commentaire : null
            });
            await onPartieUpdate();
            onOpenChange(false);
            toast({ title: "✅ Succès", description: "La partie a été mise à jour." });
        } catch (err) {
            console.error(err);
            toast({ title: "❌ Erreur", description: "Impossible de mettre à jour la partie.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await deletePartie(editedPartie.id);
            await onPartieUpdate();
            onOpenChange(false);
            toast({ title: "✅ Succès", description: "Partie supprimée." });
        } catch (err) {
            console.error(err);
            toast({ title: "❌ Erreur", description: "Impossible de supprimer la partie.", variant: "destructive" });
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isMultiPartie ? 'Modifier la partie' : 'Modifier le score'}</DialogTitle>
                    <DialogDescription>Modifiez les scores et les informations de la partie.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="score_equipe">Score Est Lyonnais</Label>
                            <Input id="score_equipe" type="number" value={editedPartie.score_equipe} onChange={e => setEditedPartie({ ...editedPartie, score_equipe: parseInt(e.target.value) })} />
                        </div>
                        <div>
                            <Label htmlFor="score_adversaire">Score Adversaire</Label>
                            <Input id="score_adversaire" type="number" value={editedPartie.score_adversaire} onChange={e => setEditedPartie({ ...editedPartie, score_adversaire: parseInt(e.target.value) })} />
                        </div>
                    </div>
                    {isMultiPartie && (
                        <>
                            <div>
                                <Label htmlFor="adversaire_id_partie">Adversaire de la partie</Label>
                                <Select value={editedPartie.adversaire_id?.toString()} onValueChange={value => setEditedPartie({ ...editedPartie, adversaire_id: value ? parseInt(value) : null })}>
                                    <SelectTrigger><SelectValue placeholder="Sélectionner un club" /></SelectTrigger>
                                    <SelectContent>
                                        {clubs.map(club => <SelectItem key={club.id} value={club.id.toString()}>{club.nom}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="commentaire_partie">Commentaire</Label>
                                <Textarea id="commentaire_partie" value={editedPartie.commentaire || ''} onChange={e => setEditedPartie({ ...editedPartie, commentaire: e.target.value })} />
                            </div>
                        </>
                    )}
                </div>
                <DialogFooter className="justify-between">
                    {isMultiPartie ? (
                        <AlertDialog>
                            <AlertDialogTrigger asChild><Button variant="destructive" disabled={loading}>Supprimer</Button></AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>Supprimer la partie ?</AlertDialogTitle><AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={handleDelete}>Supprimer</AlertDialogAction></AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    ) : <div></div>}
                    <div className="flex gap-2">
                        <DialogClose asChild><Button variant="outline" disabled={loading}>Annuler</Button></DialogClose>
                        <Button onClick={handleSave} disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : 'Enregistrer'}</Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const PhotosSection = ({ match, onPhotosUpdate, onOpenChange }) => {
    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);
    const [photoUrls, setPhotoUrls] = useState([]);
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
    const fileInputRef = React.useRef(null);

    // Load photo URLs when match photos change
    useEffect(() => {
        const loadPhotoUrls = async () => {
            if (!match.photos || match.photos.length === 0) {
                setPhotoUrls([]);
                return;
            }

            const urls = await Promise.all(
                match.photos.map(photoPath => getMatchPhotoUrl(photoPath))
            );
            setPhotoUrls(urls);
        };

        loadPhotoUrls();
    }, [match.photos]);

    const handlePreviousPhoto = () => {
        setSelectedPhotoIndex((prev) => (prev > 0 ? prev - 1 : photoUrls.length - 1));
    };

    const handleNextPhoto = () => {
        setSelectedPhotoIndex((prev) => (prev < photoUrls.length - 1 ? prev + 1 : 0));
    };

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Validate file sizes (5MB max per file)
        const maxSize = 5 * 1024 * 1024; // 5MB
        const oversizedFiles = files.filter(file => file.size > maxSize);
        if (oversizedFiles.length > 0) {
            toast({
                title: "❌ Fichier(s) trop lourd(s)",
                description: `${oversizedFiles.length} photo(s) dépassent la limite de 5MB. Veuillez réduire la taille des images.`,
                variant: "destructive"
            });
            e.target.value = null;
            return;
        }

        setIsUploading(true);
        try {
            await uploadMatchPhotos(match.id, files);
            await onPhotosUpdate();
            toast({ title: "✅ Succès", description: "Photo(s) ajoutée(s)." });
        } catch (err) {
            console.error('Error uploading match photo:', err);
            toast({ title: "❌ Erreur", description: "Impossible d'ajouter la/les photo(s).", variant: "destructive" });
        } finally {
            setIsUploading(false);
            e.target.value = null; // Clear the input so same files can be selected again
        }
    };

    const handleDeletePhoto = async (photoPath) => {
        try {
            await deleteMatchPhotoFromMatch(match.id, photoPath);
            await onPhotosUpdate();
            toast({ title: "✅ Succès", description: "Photo supprimée." });
        } catch (err) {
            console.error(err);
            toast({ title: "❌ Erreur", description: "Impossible de supprimer la photo.", variant: "destructive" });
        }
    };

    return (
        <>
            <Card title="Photos du match" count={match.photos?.length || 0}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {match.photos?.map((photoPath, index) => (
                        <div key={index} className="relative group">
                            {photoUrls[index] ? (
                                <img
                                    src={photoUrls[index]}
                                    alt={`Match photo ${index + 1}`}
                                    className="w-full h-32 object-cover rounded-md cursor-pointer"
                                    onClick={() => setSelectedPhotoIndex(index)}
                                />
                            ) : (
                                <div className="w-full h-32 bg-gray-200 rounded-md flex items-center justify-center">
                                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button size="icon" variant="secondary" onClick={() => setSelectedPhotoIndex(index)}>
                                    <Expand className="w-4 h-4" />
                                </Button>
                                <Button size="icon" variant="destructive" onClick={() => handleDeletePhoto(photoPath)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
                {(!match.photos || match.photos.length === 0) && (
                    <p className="text-gray-500 italic text-center py-4">Aucune photo pour ce match.</p>
                )}
                <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                <Button onClick={() => fileInputRef.current.click()} className="w-full mt-4" variant="outline" disabled={isUploading}>
                    {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                    Ajouter des photos
                </Button>
            </Card>

            {/* Photo viewer dialog */}
            <Dialog open={selectedPhotoIndex !== null} onOpenChange={(open) => !open && setSelectedPhotoIndex(null)}>
                <DialogContent className="max-w-4xl w-full p-0">
                    <div className="relative">
                        {selectedPhotoIndex !== null && photoUrls[selectedPhotoIndex] && (
                            <>
                                <img
                                    src={photoUrls[selectedPhotoIndex]}
                                    alt={`Match photo ${selectedPhotoIndex + 1}`}
                                    className="w-full max-h-[80vh] object-contain"
                                />

                                {/* Navigation buttons */}
                                {photoUrls.length > 1 && (
                                    <>
                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            className="absolute left-4 top-1/2 -translate-y-1/2"
                                            onClick={handlePreviousPhoto}
                                        >
                                            <ChevronLeft className="w-6 h-6" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            className="absolute right-4 top-1/2 -translate-y-1/2"
                                            onClick={handleNextPhoto}
                                        >
                                            <ChevronRight className="w-6 h-6" />
                                        </Button>

                                        {/* Photo counter */}
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                                            {selectedPhotoIndex + 1} / {photoUrls.length}
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

const Card = ({ title, count, children }) => (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            {count !== undefined && <span className="bg-green-100 text-green-800 text-sm font-semibold px-2.5 py-0.5 rounded-full">{count}</span>}
        </div>
        {children}
    </div>
);

const ScoreBadge = ({ score1, score2, large = false }) => {
    let resultClass = 'bg-gray-200 text-gray-800';
    if (score1 > score2) resultClass = 'bg-green-200 text-green-800';
    else if (score1 < score2) resultClass = 'bg-red-200 text-red-800';

    return (
        <span className={`font-bold rounded-md ${resultClass} ${large ? 'px-4 py-2 text-3xl' : 'px-2 py-1 text-base'}`}>
            {score1} - {score2}
        </span>
    );
};


export default DetailMatch;