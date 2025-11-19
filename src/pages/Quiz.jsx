import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { getJoueuses } from '@/lib/storage';
import { Loader2, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

// Helper to shuffle an array
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Native Web Audio API solution for victory sound
const playVictorySound = () => {
  try {
    const audio = new Audio('/sounds/victory.mp3');
    audio.volume = 0.5;
    audio.play().catch(err => {
      console.log('Audio playback failed:', err);
    });
  } catch (error) {
    console.log('Audio initialization failed:', error);
  }
};

const Quiz = () => {
  const [allJoueuses, setAllJoueuses] = useState([]);
  const [joueusesWithPhotos, setJoueusesWithPhotos] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadJoueuses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getJoueuses();
      setAllJoueuses(data);
      const filtered = data.filter(j => j.avatarUrl);
      if (filtered.length < 4) {
        toast({
            title: "Pas assez de joueuses",
            description: "Le quiz nécessite au moins 4 joueuses avec une photo.",
            variant: "destructive"
        });
        setJoueusesWithPhotos([]);
      } else {
        setJoueusesWithPhotos(shuffleArray(filtered));
      }
    } catch (error) {
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les données des joueuses.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadJoueuses();
  }, [loadJoueuses]);

  const generateQuestion = useCallback(() => {
    if (joueusesWithPhotos.length < 4) return;

    setSelectedAnswer(null);
    setIsCorrect(null);
    
    // Pick a random player for the question
    const correctJoueuse = joueusesWithPhotos[Math.floor(Math.random() * joueusesWithPhotos.length)];
    
    // Get 3 other random players for incorrect options
    const incorrectJoueuses = allJoueuses
      .filter(j => j.id !== correctJoueuse.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
      
    const nameOptions = shuffleArray([
        `${correctJoueuse.prenom} ${correctJoueuse.nom || ''}`.trim(),
        ...incorrectJoueuses.map(j => `${j.prenom} ${j.nom || ''}`.trim())
    ]);

    setCurrentQuestion(correctJoueuse);
    setOptions(nameOptions);
  }, [joueusesWithPhotos, allJoueuses]);

  useEffect(() => {
    if (joueusesWithPhotos.length > 0) {
      generateQuestion();
    }
  }, [joueusesWithPhotos, generateQuestion]);


  const handleAnswer = (option) => {
    if (selectedAnswer) return;

    setSelectedAnswer(option);
    const correctFullName = `${currentQuestion.prenom} ${currentQuestion.nom || ''}`.trim();
    const result = option === correctFullName;
    setIsCorrect(result);

    if (result) {
      playVictorySound();
    }

    setTimeout(() => {
      generateQuestion();
    }, result ? 1500 : 2000);
  };
  
  const handleRestart = () => {
    setJoueusesWithPhotos(shuffleArray(joueusesWithPhotos));
    generateQuestion();
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-12 h-12 animate-spin text-green-600" />
      </div>
    );
  }

  if (joueusesWithPhotos.length < 4) {
    return (
        <div className="text-center p-8">
            <h1 className="text-3xl font-bold mb-4">Quiz "Qui est-ce ?"</h1>
            <p className="text-xl text-red-500">Le quiz ne peut pas démarrer. Il faut au moins 4 joueuses avec une photo de profil.</p>
            <Button onClick={loadJoueuses} className="mt-4">
                <RefreshCw className="mr-2 h-4 w-4" />
                Recharger les joueuses
            </Button>
        </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Quiz des Joueuses - Qui est-ce ?</title>
        <meta name="description" content="Testez vos connaissances sur les joueuses de l'équipe U13." />
      </Helmet>

      <motion.div
        className="flex flex-col items-center p-4 md:p-8"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Qui est cette joueuse ?</h1>
        <p className="text-gray-600 mb-8">Devinez le nom de la joueuse à partir de sa photo.</p>

        {currentQuestion && (
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border">
            <div className="relative mb-6">
                <motion.div
                    key={currentQuestion.id}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <img
                        src={currentQuestion.avatarUrl}
                        alt="Joueuse à deviner"
                        className="w-48 h-48 md:w-56 md:h-56 mx-auto rounded-full object-cover border-4 border-gray-200 shadow-lg"
                    />
                </motion.div>
                <AnimatePresence>
                {selectedAnswer && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-24 h-24 rounded-full ${
                            isCorrect ? 'bg-green-500/80' : 'bg-red-500/80'
                        }`}
                    >
                        {isCorrect ? <CheckCircle className="w-16 h-16 text-white" /> : <XCircle className="w-16 h-16 text-white" />}
                    </motion.div>
                )}
                </AnimatePresence>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {options.map((option, index) => {
                const isSelected = selectedAnswer === option;
                const isCorrectAnswer = `${currentQuestion.prenom} ${currentQuestion.nom || ''}`.trim() === option;

                let buttonClass = "bg-gray-100 hover:bg-gray-200 text-gray-800";
                if (isSelected) {
                    buttonClass = isCorrect ? "bg-green-500 text-white" : "bg-red-500 text-white";
                } else if (selectedAnswer && isCorrectAnswer) {
                    buttonClass = "bg-green-500 text-white";
                }

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <Button
                      onClick={() => handleAnswer(option)}
                      disabled={!!selectedAnswer}
                      className={`w-full h-16 text-lg justify-center transition-all duration-300 transform ${buttonClass} ${!selectedAnswer ? 'hover:scale-105' : ''}`}
                    >
                      {option}
                    </Button>
                  </motion.div>
                )
              })}
            </div>

            <div className="mt-8 flex justify-center gap-4">
              <Button onClick={handleRestart} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Question suivante
              </Button>
              <Button onClick={loadJoueuses} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Recharger les joueuses
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
};

export default Quiz;