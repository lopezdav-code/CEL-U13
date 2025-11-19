import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Loader2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getAllMatchPhotos } from '@/lib/storage';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const Photos = () => {
  const [allPhotos, setAllPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPhotos = async () => {
      setLoading(true);
      try {
        const photos = await getAllMatchPhotos();
        setAllPhotos(photos);
      } catch (error) {
        toast({
          title: "❌ Erreur de chargement",
          description: "Impossible de récupérer les photos.",
          variant: 'destructive'
        });
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [toast]);

  const showNextImage = useCallback(() => {
    if (selectedImageIndex === null) return;
    setSelectedImageIndex((prevIndex) => (prevIndex + 1) % allPhotos.length);
  }, [selectedImageIndex, allPhotos.length]);

  const showPrevImage = useCallback(() => {
    if (selectedImageIndex === null) return;
    setSelectedImageIndex((prevIndex) => (prevIndex - 1 + allPhotos.length) % allPhotos.length);
  }, [selectedImageIndex, allPhotos.length]);
  
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (selectedImageIndex === null) return;
      if (event.key === 'ArrowRight') {
        showNextImage();
      } else if (event.key === 'ArrowLeft') {
        showPrevImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImageIndex, showNextImage, showPrevImage]);


  const selectedImage = selectedImageIndex !== null ? allPhotos[selectedImageIndex] : null;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-12 h-12 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Photos - CEL Pôle Féminin Côtière Est Lyonnais U13</title>
        <meta name="description" content="Galerie photo de tous les matchs de l'équipe." />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Galerie Photos <span className="text-gray-500 text-xl">({allPhotos.length} photos)</span>
          </h1>
          <p className="text-gray-600 mt-1">Tous les moments forts de la saison en images.</p>
        </div>

        {allPhotos.length > 0 ? (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.05
                }
              }
            }}
            initial="hidden"
            animate="visible"
          >
            {allPhotos.map((photo, index) => (
              <motion.div
                key={`${photo.matchId}-${index}`}
                variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } }}
                className="group relative aspect-square overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => setSelectedImageIndex(index)}
              >
                <img
                  src={photo.photoUrl}
                  alt={`Match contre ${photo.nom_adversaire}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-3 text-white">
                  <p className="font-bold text-sm truncate">{photo.nom_adversaire}</p>
                  <p className="text-xs opacity-80">{new Date(photo.date_match).toLocaleDateString('fr-FR')}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-16">
            <Camera className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune photo</h3>
            <p className="mt-1 text-sm text-gray-500">Ajoutez des photos à vos matchs pour les voir ici.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedImage && (
          <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImageIndex(null)}>
            <DialogContent className="p-0 max-w-5xl w-full border-0 bg-transparent shadow-none">
              <motion.div 
                key={selectedImageIndex}
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <img
                  src={selectedImage.photoUrl}
                  alt={`Match contre ${selectedImage.nom_adversaire}`}
                  className="w-full h-auto object-contain rounded-lg max-h-[90vh]"
                />
                <div className="absolute top-2 right-2 text-white bg-black/50 p-2 rounded-lg text-center">
                    <p className="font-bold text-lg">{selectedImage.nom_adversaire}</p>
                    <p className="text-sm opacity-90">{new Date(selectedImage.date_match).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </motion.div>
              
              <Button variant="ghost" size="icon" className="absolute left-2 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50" onClick={showPrevImage}>
                <ChevronLeft className="w-8 h-8"/>
              </Button>
              <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50" onClick={showNextImage}>
                <ChevronRight className="w-8 h-8"/>
              </Button>

            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
};

export default Photos;