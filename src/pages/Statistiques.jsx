import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { getJoueusesStats, getOpponentStats } from '@/lib/storage';
import { Loader2, Trophy, Home, Plane, ArrowUpDown, Target, Shield, User, Users as UsersIcon } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Statistiques = () => {
  const [activeTab, setActiveTab] = useState('joueuses');

  return (
    <>
      <Helmet>
        <title>Statistiques - CEL Pôle Féminin Côtière Est Lyonnais U13</title>
        <meta name="description" content="Consultez les statistiques des joueuses et des adversaires de l'équipe." />
      </Helmet>
      
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Statistiques</h1>
            <p className="text-gray-600 mt-1">Les performances de l'équipe en un coup d'œil.</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="joueuses">
              <User className="mr-2 w-4 h-4" />
              Statistiques des Joueuses
            </TabsTrigger>
            <TabsTrigger value="adversaires">
              <UsersIcon className="mr-2 w-4 h-4" />
              Statistiques par Adversaire
            </TabsTrigger>
          </TabsList>
          <TabsContent value="joueuses" className="mt-6">
            <StatsJoueuses />
          </TabsContent>
          <TabsContent value="adversaires" className="mt-6">
            <StatsAdversaires />
          </TabsContent>
        </Tabs>
      </motion.div>
    </>
  );
};

const StatsJoueuses = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matchType, setMatchType] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'totalGoals', direction: 'desc' });
  const { toast } = useToast();

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getJoueusesStats(matchType);
      setStats(data);
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques", error);
      toast({
        title: "❌ Erreur de chargement",
        description: "Impossible de charger les statistiques.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, matchType]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const sortedStats = useMemo(() => {
    let sortableItems = [...stats];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === 'prenom') {
            aValue = `${a.prenom} ${a.nom || ''}`.trim();
            bValue = `${b.prenom} ${b.nom || ''}`.trim();
        }
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc' 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue);
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        
        // Secondary sort by name
        return a.prenom.localeCompare(b.prenom);
      });
    }
    return sortableItems;
  }, [stats, sortConfig]);

  const requestSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key) {
      direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    } else if (key === 'prenom') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="ml-2 h-4 w-4 opacity-30" />;
    return sortConfig.direction === 'desc' ? '▼' : '▲';
  };

  const matchTypes = [
    { value: 'all', label: 'Global' },
    { value: 'championnat', label: 'Championnat' },
    { value: 'amical', label: 'Amical' },
    { value: 'tournoi', label: 'Tournoi' },
    { value: 'coupe', label: 'Coupe' },
  ];
  
  const columns = [
    { key: 'totalMatches', label: 'Matchs Joués', icon: null },
    { key: 'matchesPlayedHome', label: 'Domicile', icon: Home, color: 'text-green-600' },
    { key: 'matchesPlayedAway', label: 'Extérieur', icon: Plane, color: 'text-blue-600' },
    { key: 'totalGoals', label: 'Buts', icon: Trophy, color: 'text-yellow-500' },
    { key: 'goalsPerMatch', label: 'Buts/Match', icon: Target, color: 'text-red-500' },
    { key: 'nb_fois_gardienne', label: 'Gardienne', icon: Shield, color: 'text-purple-600' },
  ];

  return (
    <div className="space-y-4">
      <Tabs value={matchType} onValueChange={setMatchType} className="w-full">
        <TabsList>
            {matchTypes.map(type => (
              <TabsTrigger key={type.value} value={type.value}>
                {type.label}
              </TabsTrigger>
            ))}
        </TabsList>
      </Tabs>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-12 h-12 animate-spin text-green-600" />
        </div>
      ) : (
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort('prenom')} className="w-full justify-start px-2">
                    <User className="mr-2 w-4 h-4 text-gray-500" />
                    Joueuse
                    <span className="ml-2 w-4">{getSortIndicator('prenom')}</span>
                  </Button>
                </TableHead>
                {columns.map(col => {
                  const Icon = col.icon;
                  return (
                      <TableHead key={col.key} className="text-center">
                          <Button variant="ghost" onClick={() => requestSort(col.key)} className="w-full justify-center">
                              {Icon && <Icon className={`mr-2 w-4 h-4 ${col.color}`} />}
                              {col.label}
                              <span className="ml-2 w-4">{getSortIndicator(col.key)}</span>
                          </Button>
                      </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedStats.length > 0 ? sortedStats.map(joueuse => (
                <TableRow key={joueuse.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={joueuse.avatarUrl} alt={`${joueuse.prenom} ${joueuse.nom}`} />
                        <AvatarFallback>{joueuse.prenom.charAt(0)}{joueuse.nom ? joueuse.nom.charAt(0) : ''}</AvatarFallback>
                      </Avatar>
                      <span>{joueuse.prenom} {joueuse.nom}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-bold text-lg">{joueuse.totalMatches}</TableCell>
                  <TableCell className="text-center">{joueuse.matchesPlayedHome}</TableCell>
                  <TableCell className="text-center">{joueuse.matchesPlayedAway}</TableCell>
                  <TableCell className="text-center font-bold text-lg text-green-700">{joueuse.totalGoals}</TableCell>
                  <TableCell className="text-center font-semibold text-lg text-red-600">{joueuse.goalsPerMatch.toFixed(2)}</TableCell>
                  <TableCell className="text-center font-semibold text-lg text-purple-600">{joueuse.nb_fois_gardienne}</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24">Aucune statistique à afficher pour ce filtre.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

const StatsAdversaires = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: 'totalMatches', direction: 'desc' });
  const { toast } = useToast();

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const data = await getOpponentStats();
        setStats(data);
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques par adversaire", error);
        toast({
          title: "❌ Erreur de chargement",
          description: "Impossible de charger les statistiques par adversaire.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, [toast]);
  
  const sortedStats = useMemo(() => {
    let sortableItems = [...stats];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc' 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue);
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        
        // Secondary sort by name
        return a.nom.localeCompare(b.nom);
      });
    }
    return sortableItems;
  }, [stats, sortConfig]);

  const requestSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key) {
        direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    } else if (key === 'nom') {
        direction = 'asc';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="ml-2 h-4 w-4 opacity-30" />;
    return sortConfig.direction === 'desc' ? '▼' : '▲';
  };

  const columns = [
    { key: 'totalMatches', label: 'Matchs Joués' },
    { key: 'wins', label: 'Victoires', color: 'text-green-600' },
    { key: 'draws', label: 'Nuls', color: 'text-gray-600' },
    { key: 'losses', label: 'Défaites', color: 'text-red-600' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-12 h-12 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button variant="ghost" onClick={() => requestSort('nom')} className="w-full justify-start px-2">
                <UsersIcon className="mr-2 w-4 h-4 text-gray-500" />
                Adversaire
                <span className="ml-2 w-4">{getSortIndicator('nom')}</span>
              </Button>
            </TableHead>
            {columns.map(col => (
              <TableHead key={col.key} className="text-center">
                <Button variant="ghost" onClick={() => requestSort(col.key)} className="w-full justify-center">
                  {col.label}
                  <span className="ml-2 w-4">{getSortIndicator(col.key)}</span>
                </Button>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedStats.length > 0 ? sortedStats.map(adversaire => (
            <TableRow key={adversaire.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <Avatar>
                    {adversaire.logoUrl ? (
                      <AvatarImage src={adversaire.logoUrl} alt={adversaire.nom} />
                    ) : <AvatarFallback><UsersIcon className="w-5 h-5" /></AvatarFallback>}
                  </Avatar>
                  <span>{adversaire.nom}</span>
                </div>
              </TableCell>
              <TableCell className="text-center font-semibold text-lg">{adversaire.totalMatches}</TableCell>
              <TableCell className="text-center font-semibold text-lg text-green-600">{adversaire.wins}</TableCell>
              <TableCell className="text-center font-semibold text-lg text-gray-600">{adversaire.draws}</TableCell>
              <TableCell className="text-center font-semibold text-lg text-red-600">{adversaire.losses}</TableCell>
            </TableRow>
          )) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center h-24">Aucune statistique par adversaire à afficher.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default Statistiques;