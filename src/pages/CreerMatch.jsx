import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { getClubs, createMatch } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Calendar, Clock, MapPin, Shield, Trophy, Users, FileText, Save, Loader2, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const CreerMatch = () => {
    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();
    const [clubs, setClubs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();
    const matchType = watch('type_match');

    useEffect(() => {
        const fetchClubs = async () => {
            try {
                const clubsData = await getClubs();
                setClubs(clubsData);
            } catch (error) {
                toast({
                    title: "Erreur",
                    description: "Impossible de charger la liste des clubs.",
                    variant: "destructive"
                });
            }
        };
        fetchClubs();
    }, [toast]);

    const onSubmit = async (data) => {
        setIsLoading(true);
        const matchData = {
            ...data,
            adversaire_id: data.adversaire_id ? parseInt(data.adversaire_id) : null,
            is_multi_partie: data.is_multi_partie || false,
            is_away: data.is_away || false,
            titre: matchType === 'coupe' ? data.titre : null,
        };

        if (matchType === 'coupe') {
            matchData.adversaire_id = null; // Ensure opponent is null for cup matches
        }

        try {
            const newMatch = await createMatch(matchData);
            toast({
                title: "✅ Match créé !",
                description: "Le nouveau match a été ajouté avec succès."
            });
            navigate(`/matchs/${newMatch.id}`);
        } catch (error) {
            toast({
                title: "❌ Erreur de création",
                description: "Impossible de créer le match. Veuillez réessayer.",
                variant: "destructive"
            });
            setIsLoading(false);
        }
    };
    
    return (
        <>
            <Helmet>
                <title>Créer un nouveau match</title>
                <meta name="description" content="Formulaire pour créer un nouveau match." />
            </Helmet>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto p-4 sm:p-6"
            >
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Créer un nouveau match</h1>
                    <p className="text-gray-600 mt-1">Remplissez les informations ci-dessous pour planifier un nouveau match.</p>
                </header>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    <div className="bg-white p-8 rounded-lg shadow-md border space-y-6">
                        <h2 className="text-xl font-semibold text-gray-700 border-b pb-3">Informations Générales</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="type_match" className="flex items-center mb-2"><Info className="w-4 h-4 mr-2" />Type de match</Label>
                                <Select onValueChange={(value) => setValue('type_match', value, { shouldValidate: true })} >
                                    <SelectTrigger id="type_match" {...register('type_match', { required: 'Le type de match est obligatoire' })}>
                                        <SelectValue placeholder="Sélectionner un type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="championnat">Championnat</SelectItem>
                                        <SelectItem value="amical">Amical</SelectItem>
                                        <SelectItem value="tournoi">Tournoi</SelectItem>
                                        <SelectItem value="coupe">Coupe</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.type_match && <p className="text-sm text-red-600 mt-1">{errors.type_match.message}</p>}
                            </div>

                            {matchType === 'coupe' && (
                                <div className="md:col-span-2">
                                    <Label htmlFor="titre" className="flex items-center mb-2"><Trophy className="w-4 h-4 mr-2" />Titre de la coupe</Label>
                                    <Input id="titre" {...register('titre', { required: 'Le titre est obligatoire pour un match de coupe' })} placeholder="Ex: Festival Foot U13 Pitch - 1er tour" />
                                    {errors.titre && <p className="text-sm text-red-600 mt-1">{errors.titre.message}</p>}
                                </div>
                            )}

                            {matchType !== 'coupe' && (
                                <div>
                                    <Label htmlFor="adversaire_id" className="flex items-center mb-2"><Shield className="w-4 h-4 mr-2" />Adversaire</Label>
                                    <Select onValueChange={(value) => setValue('adversaire_id', value, { shouldValidate: true })}>
                                        <SelectTrigger id="adversaire_id" {...register('adversaire_id', { required: matchType !== 'coupe' ? 'L\'adversaire est obligatoire' : false })}>
                                            <SelectValue placeholder="Sélectionner un club" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {clubs.map(club => (
                                                <SelectItem key={club.id} value={club.id.toString()}>{club.nom}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.adversaire_id && <p className="text-sm text-red-600 mt-1">{errors.adversaire_id.message}</p>}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="date_match" className="flex items-center mb-2"><Calendar className="w-4 h-4 mr-2" />Date du match</Label>
                                <Input type="date" id="date_match" {...register('date_match', { required: 'La date est obligatoire' })} />
                                {errors.date_match && <p className="text-sm text-red-600 mt-1">{errors.date_match.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="heure" className="flex items-center mb-2"><Clock className="w-4 h-4 mr-2" />Heure (facultatif)</Label>
                                <Input type="time" id="heure" {...register('heure')} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div>
                                <Label htmlFor="ville" className="flex items-center mb-2"><MapPin className="w-4 h-4 mr-2" />Ville (facultatif)</Label>
                                <Input id="ville" {...register('ville')} placeholder="Ex: Lyon" />
                            </div>
                            <div>
                                <Label htmlFor="stade" className="flex items-center mb-2"><MapPin className="w-4 h-4 mr-2" />Stade (facultatif)</Label>
                                <Input id="stade" {...register('stade')} placeholder="Ex: Groupama Stadium" />
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="flex items-center gap-2">
                                <Checkbox id="is_away" {...register('is_away')} onCheckedChange={(checked) => setValue('is_away', checked)} />
                                <Label htmlFor="is_away" className="cursor-pointer">Match à l'extérieur</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox id="is_multi_partie" {...register('is_multi_partie')} onCheckedChange={(checked) => setValue('is_multi_partie', checked)} />
                                <Label htmlFor="is_multi_partie" className="cursor-pointer">Plateau (plusieurs mini-matchs)</Label>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-lg shadow-md border space-y-6">
                         <h2 className="text-xl font-semibold text-gray-700 border-b pb-3">Détails Supplémentaires</h2>
                        <div>
                            <Label htmlFor="commentaire" className="flex items-center mb-2"><FileText className="w-4 h-4 mr-2" />Commentaire (facultatif)</Label>
                            <Textarea id="commentaire" {...register('commentaire')} placeholder="Informations sur le lieu, l'organisation, etc." />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Création en cours...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Créer le match
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </motion.div>
        </>
    );
};

export default CreerMatch;