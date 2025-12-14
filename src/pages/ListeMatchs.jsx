import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getMatchs, getJoueuses } from '@/lib/storage';
import { Loader2, Plus, Eye, Shield, Home, Plane, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/components/ui/use-toast';

const MatchList = ({ matches }) => {
  if (matches.length === 0) {
    return <p className="text-center text-gray-500 py-12">Aucun match ne correspond à vos filtres.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs sm:text-sm">Date</TableHead>
            <TableHead className="text-xs sm:text-sm">Adversaire</TableHead>
            <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Lieu</TableHead>
            <TableHead className="text-xs sm:text-sm hidden md:table-cell">Type</TableHead>
            <TableHead className="text-xs sm:text-sm">Score</TableHead>
            <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Composition</TableHead>
            <TableHead className="text-right text-xs sm:text-sm">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {matches.map(match => (
            <TableRow key={match.id}>
              <TableCell className="text-xs sm:text-sm whitespace-nowrap">
                {new Date(match.date_match).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
              </TableCell>
              <TableCell className="font-medium text-xs sm:text-sm">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    <span className="line-clamp-2">{match.nom_adversaire || 'À définir'}</span>
                    {match.adversaire_id && <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" title="Club enregistré" />}
                  </div>
                  <div className="flex items-center gap-2 sm:hidden">
                    {match.is_away ? <Plane className="w-3 h-3 text-blue-500" /> : <Home className="w-3 h-3 text-green-500" />}
                    <span className={`px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                        match.type_match === 'championnat' ? 'bg-orange-100 text-orange-800' :
                        match.type_match === 'amical' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                    }`}>
                        {match.type_match}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                {match.is_away ? <Plane className="w-4 h-4 text-blue-500" title="Match à l'extérieur" /> : <Home className="w-4 h-4 text-green-500" title="Match à domicile" />}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                    match.type_match === 'championnat' ? 'bg-orange-100 text-orange-800' :
                    match.type_match === 'amical' ? 'bg-blue-100 text-blue-800' :
                    'bg-purple-100 text-purple-800'
                }`}>
                    {match.type_match}
                </span>
              </TableCell>
              <TableCell className="text-xs sm:text-sm">
                {match.is_multi_partie ? (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs">
                    <span className="font-bold text-green-600">V:{match.partie_stats.wins}</span>
                    <span className="font-bold text-gray-600">N:{match.partie_stats.draws}</span>
                    <span className="font-bold text-red-600">D:{match.partie_stats.losses}</span>
                  </div>
                ) : (
                    <span className={`font-bold whitespace-nowrap ${
                      match.score_equipe > match.score_adversaire ? 'text-green-600' :
                      match.score_equipe < match.score_adversaire ? 'text-red-600' : ''
                    }`}>
                      {match.score_equipe ?? '-'} - {match.score_adversaire ?? '-'}
                    </span>
                )}
              </TableCell>
              <TableCell className="hidden lg:table-cell text-xs sm:text-sm">{match.composition_count} joueuse(s)</TableCell>
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
  );
};

const ListeMatchs = () => {
  const [allMatchs, setAllMatchs] = useState([]);
  const [joueuses, setJoueuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJoueuse, setSelectedJoueuse] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [matchData, joueusesData] = await Promise.all([
          getMatchs(),
          getJoueuses()
        ]);
        setAllMatchs(matchData);
        setJoueuses(joueusesData);
      } catch (error) {
        console.error("Erreur lors du chargement des données", error);
        toast({
          title: "❌ Erreur de chargement",
          description: "Impossible de charger les données des matchs ou des joueuses.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [toast]);
  
  const filteredMatches = useMemo(() => {
    let matches = allMatchs;
    
    // Filter by match type (tab)
    if (activeTab !== 'all') {
      matches = matches.filter(m => m.type_match === activeTab);
    }

    // Filter by player
    if (selectedJoueuse !== 'all') {
      matches = matches.filter(m => m.composition.includes(parseInt(selectedJoueuse)));
    }
    
    return matches;
  }, [allMatchs, activeTab, selectedJoueuse]);
  
  const types = ['all', 'championnat', 'amical', 'tournoi', 'futsal'];

  return (
    <>
      <Helmet>
        <title>Liste des Matchs - Suivi Équipe Foot</title>
        <meta name="description" content="Consultez tous les matchs passés et à venir de l'équipe." />
      </Helmet>
      
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Liste des Matchs</h1>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
            <div className="w-full sm:w-56">
                <Select value={selectedJoueuse} onValueChange={setSelectedJoueuse}>
                    <SelectTrigger className="text-xs sm:text-sm">
                        <User className="w-3 h-3 sm:w-4 sm:h-4 mr-2"/>
                        <SelectValue placeholder="Filtrer par joueuse" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Toutes les joueuses</SelectItem>
                        {joueuses.map(joueuse => (
                            <SelectItem key={joueuse.id} value={joueuse.id.toString()}>
                                {joueuse.prenom} {joueuse.nom}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <Link to="/matchs/creer" className="w-full sm:w-auto">
              <Button className="gap-2 w-full sm:w-auto text-xs sm:text-sm">
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                Créer un match
              </Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-12 h-12 animate-spin text-green-600" />
          </div>
        ) : (
          <motion.div
            className="bg-white rounded-lg border shadow-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Tabs defaultValue="all" onValueChange={setActiveTab}>
              <TabsList className="p-1 sm:p-2 m-2 bg-gray-100 rounded-lg flex-wrap h-auto">
                {types.map(type => (
                  <TabsTrigger key={type} value={type} className="capitalize text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2">{type === 'all' ? 'Tous' : type}</TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={activeTab}>
                <MatchList matches={filteredMatches} />
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default ListeMatchs;