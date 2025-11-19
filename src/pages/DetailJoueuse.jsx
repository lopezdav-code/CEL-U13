import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { getJoueuse, getStatsJoueuse, getMatchsForJoueuse } from '@/lib/storage';
import { ArrowLeft, User, Hash, Calendar, Shield, Star, Loader2, Cake } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DetailJoueuse = () => {
  const { id } = useParams();
  const [joueuse, setJoueuse] = React.useState(null);
  const [stats, setStats] = React.useState(null);
  const [matchs, setMatchs] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const joueuseId = parseInt(id);
      if (joueuseId) {
        try {
          const [joueuseData, statsData, matchsData] = await Promise.all([
            getJoueuse(joueuseId),
            getStatsJoueuse(joueuseId),
            getMatchsForJoueuse(joueuseId)
          ]);
          setJoueuse(joueuseData);
          setStats(statsData);
          setMatchs(matchsData);
        } catch (error) {
          console.error("Failed to load player details", error);
        }
      }
      setLoading(false);
    };
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!joueuse) {
    return <div className="text-center p-8">Joueuse non trouvée.</div>;
  }

  return (
    <>
      <Helmet>
        <title>{`${joueuse.prenom} ${joueuse.nom}`} - Suivi Équipe Foot</title>
        <meta name="description" content={`Détails et statistiques de la joueuse ${joueuse.prenom} ${joueuse.nom}`} />
      </Helmet>

      <div className="space-y-8">
        <Link to="/joueuses">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Retour à la liste
          </Button>
        </Link>

        <header className="flex items-center gap-6">
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-4xl overflow-hidden">
            {joueuse.avatarUrl ? (
              <img src={joueuse.avatarUrl} alt={`Avatar de ${joueuse.prenom}`} className="w-full h-full object-cover" />
            ) : (
              <span>{joueuse.prenom[0]}{joueuse.nom[0]}</span>
            )}
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">{joueuse.prenom} {joueuse.nom}</h1>
            <div className="flex items-center flex-wrap gap-4 text-gray-600 mt-2">
              {joueuse.age && <span className="flex items-center gap-2"><User className="w-4 h-4" /> {joueuse.age} ans</span>}
              {joueuse.date_de_naissance && <span className="flex items-center gap-2"><Cake className="w-4 h-4" /> {new Date(joueuse.date_de_naissance).toLocaleDateString('fr-FR')}</span>}
              {joueuse.classe && <span className="flex items-center gap-2"><Hash className="w-4 h-4" /> {joueuse.classe}</span>}
            </div>
          </div>
        </header>

        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard icon={<Calendar className="w-6 h-6 text-blue-500" />} label="Matchs joués" value={stats.nb_matchs_joues} />
            <StatCard icon={<Star className="w-6 h-6 text-yellow-500" />} label="Buts marqués" value={stats.nb_buts} />
            <StatCard icon={<Shield className="w-6 h-6 text-green-500" />} label="Gardienne" value={`${stats.nb_fois_gardienne} fois`} />
          </div>
        )}

        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Matchs récents</h2>
          <div className="space-y-3">
            {matchs.length > 0 ? (
              matchs.map(match => (
                <Link to={`/matchs/${match.id}`} key={match.id} className="block bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{match.nom_adversaire}</p>
                      <p className="text-sm text-gray-500">{new Date(match.date_match).toLocaleDateString()}</p>
                    </div>
                    <div className={`font-bold text-lg ${match.score_equipe > match.score_adversaire ? 'text-green-600' : match.score_equipe < match.score_adversaire ? 'text-red-600' : 'text-gray-600'}`}>
                      {match.score_equipe} - {match.score_adversaire}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-gray-500">Aucun match joué récemment.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const StatCard = ({ icon, label, value }) => (
  <div className="bg-white p-6 rounded-lg border border-gray-200 flex items-center gap-4">
    <div className="bg-gray-100 p-3 rounded-full">
      {icon}
    </div>
    <div>
      <p className="text-gray-600">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

export default DetailJoueuse;