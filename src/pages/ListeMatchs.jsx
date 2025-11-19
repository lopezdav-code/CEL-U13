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
            <TableHead>Date</TableHead>
            <TableHead>Adversaire</TableHead>
            <TableHead>Lieu</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Score / Résultat plateau</TableHead>
            <TableHead>Composition</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {matches.map(match => (
            <TableRow key={match.id}>
              <TableCell>{new Date(match.date_match).toLocaleDateString('fr-FR')}</TableCell>
              <TableCell className="font-medium flex items-center gap-2">
                {match.nom_adversaire || 'À définir'}
                {match.adversaire_id && <Shield className="w-4 h-4 text-green-600" title="Club enregistré" />}
              </TableCell>
              <TableCell>
                  {match.is_away ? <Plane className="w-4 h-4 text-blue-500" title="Match à l'extérieur" /> : <Home className="w-4 h-4 text-green-500" title="Match à domicile" />}
              </TableCell>
              <TableCell>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    match.type_match === 'championnat' ? 'bg-orange-100 text-orange-800' :
                    match.type_match === 'amical' ? 'bg-blue-100 text-blue-800' :
                    'bg-purple-100 text-purple-800'
                }`}>
                    {match.type_match}
                </span>
              </TableCell>
              <TableCell>
                {match.is_multi_partie ? (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-green-600">V:{match.partie_stats.wins}</span>
                    <span className="font-bold text-gray-600">N:{match.partie_stats.draws}</span>
                    <span className="font-bold text-red-600">D:{match.partie_stats.losses}</span>
                  </div>
                ) : (
                    <span className={`font-bold ${
                      match.score_equipe > match.score_adversaire ? 'text-green-600' :
                      match.score_equipe < match.score_adversaire ? 'text-red-600' : ''
                    }`}>
                      {match.score_equipe ?? '-'} - {match.score_adversaire ?? '-'}
                    </span>
                )}
              </TableCell>
              <TableCell>{match.composition_count} joueuse(s)</TableCell>
              <TableCell className="text-right">
                <Link to={`/matchs/${match.id}`}>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Eye className="w-4 h-4" />
                    Voir
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
      
      <div className="space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Liste des Matchs</h1>
          <div className="flex items-center gap-4">
            <div className="w-56">
                <Select value={selectedJoueuse} onValueChange={setSelectedJoueuse}>
                    <SelectTrigger>
                        <User className="w-4 h-4 mr-2"/>
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
            <Link to="/matchs/creer">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
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
              <TabsList className="p-2 m-2 bg-gray-100 rounded-lg">
                {types.map(type => (
                  <TabsTrigger key={type} value={type} className="capitalize">{type === 'all' ? 'Tous' : type}</TabsTrigger>
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