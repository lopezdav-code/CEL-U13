import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getTeamStats, getJoueuses, getMatchs, getCoaches, updateCoach } from '@/lib/storage';
import { Loader2, Calendar, Eye, Target, Cake, ExternalLink, Shield, Home, Plane, User, Edit, Camera, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const findNextBirthday = (joueuses) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); 
  
  let nextBirthday = null;
  let minDiff = Infinity;

  joueuses.forEach(joueuse => {
    if (!joueuse.date_de_naissance) return;

    const birthDate = new Date(joueuse.date_de_naissance);
    const birthDay = birthDate.getDate();
    const birthMonth = birthDate.getMonth();

    let nextBirthdayDate = new Date(today.getFullYear(), birthMonth, birthDay);

    if (nextBirthdayDate < today) {
      nextBirthdayDate.setFullYear(today.getFullYear() + 1);
    }
    
    const diff = nextBirthdayDate.getTime() - today.getTime();

    if (diff < minDiff) {
      minDiff = diff;
      nextBirthday = {
        ...joueuse,
        birthdayDate: nextBirthdayDate,
      };
    }
  });

  return nextBirthday;
};

const MatchTable = ({ title, matches, isUpcoming = false, showTypeColumn = false }) => {
  if (matches.length === 0 && !isUpcoming) return <p className="text-sm sm:text-base text-gray-500 italic">Aucun résultat pour le moment.</p>;
  if (matches.length === 0 && isUpcoming) return <p className="text-sm sm:text-base text-gray-500 italic">Aucun match à venir programmé.</p>;

  return (
    <div>
      {title && <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3">{title}</h3>}
      <div className="overflow-x-auto border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs sm:text-sm">Date</TableHead>
              <TableHead className="text-xs sm:text-sm">Adversaire / Titre</TableHead>
              <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Lieu</TableHead>
              {showTypeColumn && <TableHead className="text-xs sm:text-sm hidden md:table-cell">Type</TableHead>}
              {!isUpcoming && <TableHead className="text-xs sm:text-sm">Score</TableHead>}
              {!isUpcoming && <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Résultat</TableHead>}
              <TableHead className="text-right text-xs sm:text-sm">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matches.map(match => (
              <TableRow key={match.id}>
                <TableCell className="text-xs sm:text-sm whitespace-nowrap">{new Date(match.date_match).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}</TableCell>
                <TableCell className="font-medium text-xs sm:text-sm">
                  <div className="flex flex-col gap-1">
                    <span className="line-clamp-2">{match.titre || match.nom_adversaire || 'À définir'}</span>
                    <span className="sm:hidden flex items-center gap-1">
                      {match.is_away ? <Plane className="w-3 h-3 text-blue-500" /> : <Home className="w-3 h-3 text-green-500" />}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {match.is_away ? <Plane className="w-4 h-4 text-blue-500" title="Match à l'extérieur" /> : <Home className="w-4 h-4 text-green-500" title="Match à domicile" />}
                </TableCell>
                {showTypeColumn && (
                  <TableCell className="hidden md:table-cell">
                    {match.is_multi_partie ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 whitespace-nowrap">
                        Plateau
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 whitespace-nowrap">
                        Match simple
                      </span>
                    )}
                  </TableCell>
                )}
                {!isUpcoming && (
                  <>
                    <TableCell className="text-xs sm:text-sm">
                      {match.is_multi_partie ? (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs">
                          <span className="font-bold text-green-600">V:{match.partie_stats.wins}</span>
                          <span className="font-bold text-gray-600">N:{match.partie_stats.draws}</span>
                          <span className="font-bold text-red-600">D:{match.partie_stats.losses}</span>
                        </div>
                      ) : (
                        <span className="whitespace-nowrap">{`${match.score_equipe ?? '-'} - ${match.score_adversaire ?? '-'}`}</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {!match.is_multi_partie && (
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                          match.score_equipe === null || match.score_adversaire === null ? 'bg-gray-100 text-gray-800' :
                          match.score_equipe > match.score_adversaire ? 'bg-green-100 text-green-800' :
                          match.score_equipe < match.score_adversaire ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {match.score_equipe === null || match.score_adversaire === null ? 'À jouer' :
                          match.score_equipe > match.score_adversaire ? 'Victoire' :
                          match.score_equipe < match.score_adversaire ? 'Défaite' : 'Nul'}
                        </span>
                      )}
                    </TableCell>
                  </>
                )}
                <TableCell className="text-right">
                  <Link to={`/matchs/${match.id}`}>
                    <Button variant="ghost" size="sm" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Voir</span>
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

const EditCoachDialog = ({ coach, open, onOpenChange, onCoachUpdate }) => {
    const [formData, setFormData] = useState({ prenom: '', nom: '' });
    const [photoFile, setPhotoFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();
    const fileInputRef = React.useRef(null);
  
    React.useEffect(() => {
      if (coach) {
        setFormData({ prenom: coach.prenom || '', nom: coach.nom || '' });
        setPreviewUrl(coach.photoUrl);
      }
    }, [coach]);
  
    const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setPhotoFile(file);
        setPreviewUrl(URL.createObjectURL(file));
      }
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!coach) return;
      setIsSaving(true);
      try {
        await updateCoach(coach.id, { ...formData, photo_path: coach.photo_path }, photoFile);
        toast({ title: '✅ Succès', description: 'Le coach a été mis à jour.' });
        onCoachUpdate();
        onOpenChange(false);
      } catch (error) {
        toast({ title: '❌ Erreur', description: 'Impossible de mettre à jour le coach.', variant: 'destructive' });
      } finally {
        setIsSaving(false);
      }
    };
  
    if (!coach) return null;
  
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le coach</DialogTitle>
            <DialogDescription>Modifiez les informations et la photo du coach.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-32 h-32">
                <img
                  src={previewUrl || `https://via.placeholder.com/128?text=${formData.prenom?.charAt(0)}`}
                  alt="Aperçu"
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                />
                <Button
                  type="button"
                  size="icon"
                  className="absolute bottom-0 right-0 rounded-full"
                  onClick={() => fileInputRef.current.click()}
                >
                  <Camera className="w-4 h-4" />
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prenom">Prénom</Label>
              <Input
                id="prenom"
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nom">Nom</Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Annuler</Button>
                <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Enregistrer
                </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
};

const CoachesSection = ({ coaches, onCoachUpdate }) => {
    const [editingCoach, setEditingCoach] = useState(null);

    return (
      <div className="bg-white p-4 sm:p-6 rounded-xl border shadow-sm">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Le Staff</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {coaches.map((coach) => (
            <div key={coach.id} className="relative group flex flex-col items-center text-center gap-2 p-3 sm:p-4 bg-gray-50 rounded-lg">
              {coach.photoUrl ? (
                <img src={coach.photoUrl} alt={`${coach.prenom} ${coach.nom || ''}`} className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover shadow-md" />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-300 rounded-full flex items-center justify-center shadow-md">
                  <User className="w-10 h-10 sm:w-12 sm:h-12 text-gray-500" />
                </div>
              )}
              <div>
                <p className="font-semibold text-sm sm:text-base text-gray-800">{coach.prenom}</p>
                <p className="text-xs sm:text-sm text-gray-600">{coach.nom}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setEditingCoach(coach)}
              >
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
        <EditCoachDialog
            coach={editingCoach}
            open={!!editingCoach}
            onOpenChange={(isOpen) => !isOpen && setEditingCoach(null)}
            onCoachUpdate={onCoachUpdate}
        />
      </div>
    );
};
  

const Accueil = () => {
  const [stats, setStats] = React.useState(null);
  const [playedChampionnatMatchs, setPlayedChampionnatMatchs] = React.useState([]);
  const [upcomingChampionnatMatchs, setUpcomingChampionnatMatchs] = React.useState([]);
  const [amicalMatchs, setAmicalMatchs] = React.useState([]);
  const [tournoiMatchs, setTournoiMatchs] = React.useState([]);
  const [coupeMatchs, setCoupeMatchs] = React.useState([]);
  const [championnatTeams, setChampionnatTeams] = React.useState([]);
  const [nextBirthday, setNextBirthday] = React.useState(null);
  const [coaches, setCoaches] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [teamStats, allJoueusesData, champMatchs, amicMatchs, tournMatchs, coupeMatchsData, coachesData] = await Promise.all([
          getTeamStats(),
          getJoueuses(),
          getMatchs({ type: 'championnat' }),
          getMatchs({ type: 'amical' }),
          getMatchs({ type: 'tournoi' }),
          getMatchs({ type: 'coupe' }),
          getCoaches()
      ]);
      
      setStats(teamStats);
      setNextBirthday(findNextBirthday(allJoueusesData));
      setCoaches(coachesData);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const played = champMatchs.filter(m => new Date(m.date_match) <= today).sort((a,b) => new Date(b.date_match) - new Date(a.date_match));
      const upcoming = champMatchs.filter(m => new Date(m.date_match) > today).sort((a,b) => new Date(a.date_match) - new Date(b.date_match));
      
      setPlayedChampionnatMatchs(played);
      setUpcomingChampionnatMatchs(upcoming);
      setAmicalMatchs(amicMatchs.sort((a,b) => new Date(b.date_match) - new Date(a.date_match)));
      setTournoiMatchs(tournMatchs.sort((a,b) => new Date(b.date_match) - new Date(a.date_match)));
      setCoupeMatchs(coupeMatchsData.sort((a,b) => new Date(b.date_match) - new Date(a.date_match)));

      const teamsMap = new Map();
      champMatchs.forEach(match => {
          if (match.adversaire_id) { 
              teamsMap.set(match.adversaire_id, {
                  id: match.adversaire_id,
                  nom: match.nom_adversaire,
                  logoUrl: match.adversaire_logo_url
              });
          }
      });
      setChampionnatTeams(Array.from(teamsMap.values()));


    } catch (error) {
      console.error("Erreur lors du chargement des données de la page d'accueil", error);
      toast({
        title: "❌ Erreur de chargement",
        description: "Impossible de charger les informations de l'équipe.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);


  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-12 h-12 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Accueil - Suivi Équipe Foot</title>
        <meta name="description" content="Tableau de bord de l'équipe, statistiques et matchs de championnat." />
      </Helmet>

      <motion.div 
        className="space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <header className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-lg flex flex-col items-center gap-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-center">Tableau de bord de l'équipe</h1>
            <p className="text-green-100 text-sm sm:text-base lg:text-lg text-center">Statistiques globales et suivi du championnat</p>
        </header>

        <CoachesSection coaches={coaches} onCoachUpdate={loadData} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard icon={<Calendar className="w-8 h-8 text-blue-500" />} label="Matchs joués (total)" value={stats?.totalMatchs} />
            <StatCard icon={<Target className="w-8 h-8 text-red-500" />} label="Buts marqués (total)" value={stats?.totalButs} />
            {nextBirthday ? (
            <StatCard 
                icon={<Cake className="w-8 h-8 text-pink-500" />} 
                label="Prochain anniversaire" 
                value={nextBirthday.prenom}
                subValue={nextBirthday.birthdayDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
            />
            ) : (
                <StatCard 
                icon={<Cake className="w-8 h-8 text-gray-400" />} 
                label="Prochain anniversaire" 
                value="-"
                subValue="Aucune date trouvée"
            />
            )}
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl border shadow-sm space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-between sm:items-center gap-3 sm:gap-4">
              <div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">CHMPT FÉMININ U13 DISTRICT</h2>
                  <p className="text-sm sm:text-base text-gray-600">District de Lyon et du Rhône > Poule E</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <a href="https://epreuves.fff.fr/competition/engagement/439177-chmpt-feminin-u13-district/phase/1/5/resultats-et-calendrier" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="gap-2 w-full sm:w-auto text-xs sm:text-sm">
                        <ExternalLink className="w-4 h-4" />
                        <span className="hidden sm:inline">Voir sur le site FFF</span>
                        <span className="sm:hidden">Site FFF</span>
                    </Button>
                </a>
                <a href="https://epreuves.fff.fr/competition/club/504303-club-est-lyonnais/equipe/2025_2211_U13F_36/statistiques" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="gap-2 w-full sm:w-auto text-xs sm:text-sm">
                        <ExternalLink className="w-4 h-4" />
                        <span className="hidden sm:inline">Voir les stats de notre équipe</span>
                        <span className="sm:hidden">Stats équipe</span>
                    </Button>
                </a>
              </div>
          </div>

          {championnatTeams.length > 0 && (
            <div className="pt-4 border-t">
              <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-3">Équipes de la poule</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2 sm:gap-4">
                {championnatTeams.map(team => (
                  <div key={team.id} className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3 bg-gray-50 rounded-lg border">
                    {team.logoUrl ? (
                      <img src={team.logoUrl} alt={`Logo ${team.nom}`} className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
                    ) : (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                      </div>
                    )}
                    <p className="text-xs text-center font-medium text-gray-600 line-clamp-2">{team.nom}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 sm:pt-6 border-t space-y-4 sm:space-y-6">
            <MatchTable
                title="Matchs à venir"
                matches={upcomingChampionnatMatchs}
                isUpcoming={true}
            />

            <MatchTable
                title="Résultats passés"
                matches={playedChampionnatMatchs}
            />
          </div>

          <p className="text-xs sm:text-sm text-gray-600 pt-4 border-t">
            exempt : Il y a 7 équipes dans la poule F. Chaque journée de match, une équipe est exemptée de jouer. Un plateau est alors organisé pour remplacer le match officiel. Le résultat ne compte pas dans le classement final
          </p>
        </div>


        <div className="bg-white p-4 sm:p-6 rounded-xl border shadow-sm">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-4">Matchs Amicaux</h2>
          {amicalMatchs.length > 0 ? (
            <MatchTable matches={amicalMatchs} showTypeColumn={true} />
          ) : (
            <p className="text-sm sm:text-base text-gray-500 italic">Aucun match amical pour le moment.</p>
          )}
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl border shadow-sm">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-4">Tournois</h2>
          {tournoiMatchs.length > 0 ? (
            <MatchTable matches={tournoiMatchs} showTypeColumn={true} />
          ) : (
            <p className="text-sm sm:text-base text-gray-500 italic">Aucun tournoi pour le moment.</p>
          )}
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl border shadow-sm">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-4">Coupe</h2>
          <p className="text-xs sm:text-sm lg:text-base text-gray-600 mb-4 italic">
            Chaque année, la Fédération Française de Football organise le Festival Foot U13 Pitch qui réunit l'ensemble des licencié(e)s U13, filles et garçons. Cet évènement se déroule sur trois phases : départementales, régionales et nationale. L'objectif consiste à associer le sportif et l'éducatif, en ajoutant, aux matches et aux ateliers techniques, des quiz éducatifs afin de promouvoir les valeurs déclinées dans le Programme Éducatif Fédéral (Plaisir, Respect, Engagement, Tolérance et Solidarité).
          </p>
          {coupeMatchs.length > 0 ? (
            <MatchTable matches={coupeMatchs} showTypeColumn={true} />
          ) : (
            <p className="text-sm sm:text-base text-gray-500 italic">Aucun match de coupe pour le moment.</p>
          )}
        </div>

      </motion.div>
    </>
  );
};

const StatCard = ({ icon, label, value, subValue }) => (
  <motion.div
    className="bg-white p-4 sm:p-6 rounded-xl border shadow-sm flex items-center gap-3 sm:gap-6"
    whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <div className="bg-gray-100 p-3 sm:p-4 rounded-full flex-shrink-0">
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-gray-600 text-xs sm:text-sm lg:text-base truncate">{label}</p>
      <p className="text-2xl sm:text-3xl font-bold text-gray-900">{value ?? '0'}</p>
      {subValue && <p className="text-xs sm:text-sm text-gray-500 truncate">{subValue}</p>}
    </div>
  </motion.div>
);

export default Accueil;