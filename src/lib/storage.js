import { supabase } from '@/lib/customSupabaseClient';

const AVATAR_BUCKET_NAME = 'avatars';
const MATCH_PHOTO_BUCKET_NAME = 'Match_Photo';
const CLUB_LOGO_BUCKET_NAME = 'club_logos';
const COACH_AVATAR_BUCKET_NAME = 'coach_avatars';


// --- Helpers ---
const calculateAge = (birthDate) => {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDifference = today.getMonth() - birth.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const determineClasse = (age) => {
  if (age === 9) return 'CM1';
  if (age === 10) return 'CM2';
  if (age === 11) return '6eme';
  if (age === 12) return '5eme';
  if (age === 13) return '4eme';
  return null;
};

const sanitizeFileName = (fileName) => {
  return fileName
    .normalize('NFD') // Decompose combined graphemes into base characters and diacritics
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-zA-Z0-9.\-_]/g, '_') // Replace invalid characters with underscore
    .replace(/\s+/g, '_'); // Replace spaces with underscore
};


// --- Coachs ---
export const getCoaches = async () => {
  const { data, error } = await supabase
    .from('coachs')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('Error fetching coaches:', error);
    throw error;
  }
  return data.map(coach => ({
    ...coach,
    photoUrl: coach.photo_path
      ? supabase.storage.from(COACH_AVATAR_BUCKET_NAME).getPublicUrl(coach.photo_path).data.publicUrl
      : null,
  }));
};

export const updateCoach = async (id, data, photoFile) => {
  let photoPath = data.photo_path;

  if (photoFile) {
    const { data: currentCoach } = await supabase.from('coachs').select('photo_path').eq('id', id).single();
    if (currentCoach?.photo_path) {
      await supabase.storage.from(COACH_AVATAR_BUCKET_NAME).remove([currentCoach.photo_path]);
    }
    const sanitizedFileNameForUpload = sanitizeFileName(photoFile.name);
    photoPath = `${id}-${Date.now()}-${sanitizedFileNameForUpload}`;
    const { error: uploadError } = await supabase.storage
      .from(COACH_AVATAR_BUCKET_NAME)
      .upload(photoPath, photoFile);
    if (uploadError) {
      console.error("Error uploading coach photo:", uploadError)
      throw uploadError;
    }
  }

  const dataToUpdate = {
    prenom: data.prenom,
    nom: data.nom,
    photo_path: photoPath,
  };

  const { data: updatedCoach, error } = await supabase
    .from('coachs')
    .update(dataToUpdate)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating coach:', error.message);
    throw error;
  }
  return updatedCoach;
};


// --- Clubs (Supabase) ---
export const getClubs = async () => {
  const { data, error } = await supabase
    .from('foot_club')
    .select('*')
    .order('nom', { ascending: true });
  if (error) throw error;

  return data.map(club => ({
    ...club,
    logoUrl: club.logo ? supabase.storage.from(CLUB_LOGO_BUCKET_NAME).getPublicUrl(club.logo).data.publicUrl : null
  }));
};

export const createClub = async (data, logoFile) => {
  let logoPath = null;
  if (logoFile) {
    const sanitizedFileNameForUpload = sanitizeFileName(logoFile.name);
    logoPath = `${Date.now()}-${sanitizedFileNameForUpload}`;
    const { error: uploadError } = await supabase.storage
      .from(CLUB_LOGO_BUCKET_NAME)
      .upload(logoPath, logoFile);
    if (uploadError) throw uploadError;
  }

  const { data: newClub, error: createError } = await supabase
    .from('foot_club')
    .insert([{ nom: data.nom, stade: data.stade, logo: logoPath }])
    .select()
    .single();

  if (createError) throw createError;
  return newClub;
};

export const updateClub = async (id, data, logoFile) => {
  let logoPath = data.logo;

  if (logoFile) {
    const { data: currentClub } = await supabase.from('foot_club').select('logo').eq('id', id).single();
    if (currentClub?.logo) {
      await supabase.storage.from(CLUB_LOGO_BUCKET_NAME).remove([currentClub.logo]);
    }
    const sanitizedFileNameForUpload = sanitizeFileName(logoFile.name);
    logoPath = `${Date.now()}-${sanitizedFileNameForUpload}`;
    const { error: uploadError } = await supabase.storage.from(CLUB_LOGO_BUCKET_NAME).upload(logoPath, logoFile);
    if (uploadError) throw uploadError;
  }

  const { data: updatedClub, error } = await supabase
    .from('foot_club')
    .update({ nom: data.nom, stade: data.stade, logo: logoPath })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return updatedClub;
};

export const deleteClub = async (id) => {
  const { data: club } = await supabase.from('foot_club').select('logo').eq('id', id).single();
  if (club?.logo) {
    await supabase.storage.from(CLUB_LOGO_BUCKET_NAME).remove([club.logo]);
  }

  const { error } = await supabase.from('foot_club').delete().eq('id', id);
  if (error) throw error;
};


// --- Avatars (Supabase Storage) ---
export const uploadAvatar = async (file, joueuseId) => {
  const sanitizedFileNameForUpload = sanitizeFileName(file.name);
  const filePath = `${joueuseId}/${Date.now()}-${sanitizedFileNameForUpload}`;
  const { error } = await supabase.storage
    .from(AVATAR_BUCKET_NAME)
    .upload(filePath, file);
  if (error) {
    console.error('Error uploading avatar:', error.message);
    throw error;
  }
  return filePath;
};

export const getAvatarUrl = async (path) => {
  if (!path) return null;
  try {
    const { data, error } = await supabase.storage
      .from(AVATAR_BUCKET_NAME)
      .createSignedUrl(path, 60 * 60); // URL valide pour 1 heure
    if (error) {
      throw error;
    }
    return data.signedUrl;
  } catch (error) {
    console.error('Error creating signed URL for avatar:', error.message);
    return null;
  }
};

export const deleteAvatar = async (path) => {
  if (!path) return;
  const { error } = await supabase.storage
    .from(AVATAR_BUCKET_NAME)
    .remove([path]);
  if (error) {
    console.error('Error deleting avatar:', error.message);
    throw error;
  }
};

// --- Match Photos (Supabase Storage) ---

export const uploadMatchPhoto = async (file, matchId) => {
  const sanitizedFileNameForUpload = sanitizeFileName(file.name);
  const filePath = `${matchId}/${Date.now()}-${sanitizedFileNameForUpload}`;
  const { error } = await supabase.storage
    .from(MATCH_PHOTO_BUCKET_NAME)
    .upload(filePath, file);
  if (error) {
    console.error('Error uploading match photo:', error.message);
    throw error;
  }
  return filePath;
};

export const getMatchPhotoUrl = async (path) => {
  if (!path) return null;
  try {
    const { data, error } = await supabase.storage
      .from(MATCH_PHOTO_BUCKET_NAME)
      .createSignedUrl(path, 60 * 60); // URL valide pour 1 heure
    if (error) {
      throw error;
    }
    return data.signedUrl;
  } catch (error) {
    console.error('Error creating signed URL for match photo:', error.message);
    return null;
  }
};

export const deleteMatchPhoto = async (path) => {
  if (!path) return;
  const { error } = await supabase.storage
    .from(MATCH_PHOTO_BUCKET_NAME)
    .remove([path]);
  if (error) {
    console.error('Error deleting match photo:', error.message);
    throw error;
  }
};

// Upload multiple photos and update match photos array
export const uploadMatchPhotos = async (matchId, files) => {
  const uploadedPaths = [];

  for (const file of files) {
    const photoPath = await uploadMatchPhoto(file, matchId);
    uploadedPaths.push(photoPath);
  }

  // Get current match photos
  const { data: currentMatch } = await supabase
    .from('matchs')
    .select('photos')
    .eq('id', matchId)
    .single();

  const currentPhotos = currentMatch?.photos || [];
  const updatedPhotos = [...currentPhotos, ...uploadedPaths];

  // Update match with new photos array
  const { error } = await supabase
    .from('matchs')
    .update({ photos: updatedPhotos })
    .eq('id', matchId);

  if (error) {
    console.error('Error updating match photos:', error.message);
    throw error;
  }

  return uploadedPaths;
};

// Delete photo from storage and update match photos array
export const deleteMatchPhotoFromMatch = async (matchId, photoPath) => {
  // Delete from storage
  await deleteMatchPhoto(photoPath);

  // Get current match photos
  const { data: currentMatch } = await supabase
    .from('matchs')
    .select('photos')
    .eq('id', matchId)
    .single();

  const currentPhotos = currentMatch?.photos || [];
  const updatedPhotos = currentPhotos.filter(p => p !== photoPath);

  // Update match with new photos array
  const { error } = await supabase
    .from('matchs')
    .update({ photos: updatedPhotos })
    .eq('id', matchId);

  if (error) {
    console.error('Error updating match photos after deletion:', error.message);
    throw error;
  }
};

export const getAllMatchPhotos = async () => {
  const { data: matchs, error } = await supabase
    .from('matchs')
    .select('id, date_match, adversaire:adversaire_id(nom), is_multi_partie, photos, titre, type_match')
    .not('photos', 'is', null)
    .order('date_match', { ascending: false });

  if (error) {
    console.error('Error fetching matches with photos:', error);
    throw error;
  }

  const allPhotos = await Promise.all(
    matchs
      .filter(match => match.photos && match.photos.length > 0)
      .flatMap(match =>
        match.photos.map(async (photoPath) => {
          const photoUrl = await getMatchPhotoUrl(photoPath);
          return {
            matchId: match.id,
            date_match: match.date_match,
            nom_adversaire: match.type_match === 'tournoi' || match.type_match === 'coupe' ? match.titre : match.adversaire?.nom,
            is_multi_partie: match.is_multi_partie,
            photoUrl,
            photoPath,
          };
        })
      )
  );

  return allPhotos.filter(p => p.photoUrl);
};


// --- Joueuses (Supabase) ---
export const getJoueuses = async () => {
  const { data, error } = await supabase
    .from('joueuse')
    .select('id, nom, prenom, photo_principale, date_de_naissance, nom_parents, classe, date_creation')
    .order('prenom', { ascending: true });
  if (error) {
    console.error('Error fetching joueuses:', error.message);
    throw error;
  }

  const joueusesWithDetails = await Promise.all(
    data.map(async (j) => {
      const avatarUrl = await getAvatarUrl(j.photo_principale);
      const age = calculateAge(j.date_de_naissance);
      return { ...j, age, avatarUrl };
    })
  );
  return joueusesWithDetails;
};

export const getJoueuse = async (id) => {
  const { data, error } = await supabase
    .from('joueuse')
    .select('*')
    .eq('id', id)
    .single();
  if (error) {
    console.error('Error fetching joueuse:', error.message);
    throw error;
  }
  const avatarUrl = await getAvatarUrl(data.photo_principale);
  const age = calculateAge(data.date_de_naissance);
  return { ...data, age, avatarUrl };
};

export const createJoueuse = async (data, avatarFile) => {
  const age = calculateAge(data.date_de_naissance);
  const classe = data.classe || (age ? determineClasse(age) : null);

  const { data: newJoueuse, error: createError } = await supabase
    .from('joueuse')
    .insert([{
      nom: data.nom,
      prenom: data.prenom,
      date_de_naissance: data.date_de_naissance,
      nom_parents: data.nom_parents,
      classe: classe,
      date_creation: new Date().toISOString()
    }])
    .select()
    .single();

  if (createError) {
    console.error('Error creating joueuse:', createError.message);
    throw createError;
  }

  if (avatarFile) {
    const avatarPath = await uploadAvatar(avatarFile, newJoueuse.id);
    const { data: updatedJoueuse, error: updateError } = await updateJoueuse(newJoueuse.id, { photo_principale: avatarPath }, null);
    if (updateError) throw updateError;
    return updatedJoueuse;
  }

  return newJoueuse;
};

export const updateJoueuse = async (id, data, avatarFile) => {
  let avatarPath = data.photo_principale;

  if (avatarFile) {
    const { data: currentJoueuse } = await supabase.from('joueuse').select('photo_principale').eq('id', id).single();
    if (currentJoueuse?.photo_principale) {
      await deleteAvatar(currentJoueuse.photo_principale);
    }
    avatarPath = await uploadAvatar(avatarFile, id);
  }

  const age = calculateAge(data.date_de_naissance);
  const classe = data.classe || (age ? determineClasse(age) : data.classe);

  const dataToUpdate = {
    ...data,
    classe,
    photo_principale: avatarPath,
  };

  const { data: updatedJoueuse, error } = await supabase
    .from('joueuse')
    .update(dataToUpdate)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating joueuse:', error.message);
    throw error;
  }
  return updatedJoueuse;
};

export const deleteJoueuse = async (id) => {
  const { data: currentJoueuse, error: fetchError } = await supabase.from('joueuse').select('photo_principale').eq('id', id).single();
  if (fetchError) {
    console.error("Could not fetch player to delete avatar", fetchError);
  }
  if (currentJoueuse?.photo_principale) {
    await deleteAvatar(currentJoueuse.photo_principale);
  }

  await supabase.from('buts').delete().eq('joueuse_id', id);
  await supabase.from('composition').delete().eq('joueuse_id', id);

  const { error } = await supabase
    .from('joueuse')
    .delete()
    .eq('id', id);
  if (error) {
    console.error('Error deleting joueuse:', error.message);
    throw error;
  }
};


// --- Matchs (Supabase) ---
export const getMatchs = async (filter = {}) => {
  let query = supabase
    .from('matchs')
    .select(`
        *,
        adversaire:adversaire_id ( nom, logo ),
        composition(joueuse_id),
        parties:match_partie!match_partie_match_id_fkey(score_equipe, score_adversaire, adversaire_id)
      `);

  if (filter.type && filter.type !== 'all') {
    query = query.eq('type_match', filter.type);
  }

  const { data: matchs, error } = await query.order('date_match', { ascending: false });

  if (error) {
    console.error('Error fetching matchs with composition:', error);
    throw error;
  }

  return matchs.map(match => {
    let wins = 0, losses = 0, draws = 0;
    if (match.parties) {
      match.parties.forEach(partie => {
        if (partie.score_equipe > partie.score_adversaire) {
          wins++;
        } else if (partie.score_equipe < partie.score_adversaire) {
          losses++;
        } else {
          draws++;
        }
      });
    }

    const composition_joueuse_ids = match.composition.map(c => c.joueuse_id);

    const nom_adversaire = match.type_match === 'tournoi' || match.type_match === 'coupe'
      ? match.titre || (match.type_match === 'tournoi' ? 'Tournoi' : 'Coupe')
      : match.adversaire?.nom || 'Adversaire';

    const adversaireLogoUrl = match.adversaire?.logo ? supabase.storage.from(CLUB_LOGO_BUCKET_NAME).getPublicUrl(match.adversaire.logo).data.publicUrl : null;

    // For simple matches, derive score from the first (and only) partie
    let score_equipe = null;
    let score_adversaire = null;
    if (!match.is_multi_partie && match.parties && match.parties.length > 0) {
      score_equipe = match.parties[0].score_equipe;
      score_adversaire = match.parties[0].score_adversaire;
    }

    return {
      ...match,
      nom_adversaire,
      adversaire_logo_url: adversaireLogoUrl,
      composition: composition_joueuse_ids,
      composition_count: composition_joueuse_ids.length,
      partie_stats: { wins, losses, draws },
      score_equipe,
      score_adversaire
    };
  });
};

export const getMatch = async (id) => {
  const { data, error } = await supabase
    .from('matchs')
    .select(`
      *,
      adversaire:adversaire_id ( nom, stade, logo ),
      parties:match_partie!match_partie_match_id_fkey(*, adversaire:adversaire_id(nom, logo))
    `)
    .eq('id', id)
    .single();
  if (error) {
    console.error('Error fetching match:', error.message);
    throw error;
  }

  const nom_adversaire = data.type_match === 'tournoi' || data.type_match === 'coupe'
    ? data.titre || (data.type_match === 'tournoi' ? 'Tournoi' : 'Coupe')
    : data.adversaire?.nom || 'Adversaire';

  const adversaireLogoUrl = data.adversaire?.logo ? supabase.storage.from(CLUB_LOGO_BUCKET_NAME).getPublicUrl(data.adversaire.logo).data.publicUrl : null;

  const parties = (data.parties || []).map(p => {
    const partieAdversaireNom = p.adversaire ? p.adversaire.nom : 'Adversaire';
    const partieAdversaireLogoUrl = p.adversaire?.logo ? supabase.storage.from(CLUB_LOGO_BUCKET_NAME).getPublicUrl(p.adversaire.logo).data.publicUrl : null;
    return { ...p, nom_equipe_adverse: partieAdversaireNom, adversaire_logo_url: partieAdversaireLogoUrl };
  }).sort((a, b) => a.id - b.id);

  let finalData = { ...data, nom_adversaire, adversaire_logo_url: adversaireLogoUrl, parties };

  // For simple matches, derive score from the first (and only) partie
  if (!finalData.is_multi_partie && finalData.parties && finalData.parties.length > 0) {
    finalData.score_equipe = finalData.parties[0].score_equipe;
    finalData.score_adversaire = finalData.parties[0].score_adversaire;
  } else {
    finalData.score_equipe = null;
    finalData.score_adversaire = null;
  }

  if (finalData && finalData.photos) {
    const photoUrls = await Promise.all(
      (finalData.photos || []).map(path => getMatchPhotoUrl(path))
    );
    return { ...finalData, photoUrls: photoUrls.filter(Boolean) };
  }

  return { ...finalData, photoUrls: [] };
};

export const createMatch = async (data) => {
  // 1. Prepare data
  const dataToInsert = {
    date_match: data.date_match,
    heure: data.heure,
    ville: data.ville,
    stade: data.stade,
    commentaire: data.commentaire,
    is_multi_partie: data.is_multi_partie,
    type_match: data.type_match,
    adversaire_id: data.type_match === 'tournoi' || data.type_match === 'coupe' ? null : data.adversaire_id,
    titre: data.type_match === 'tournoi' || data.type_match === 'coupe' ? data.titre : null,
    is_away: data.is_away,
    photos: [],
  };

  // 2. Create the match
  const { data: newMatch, error: matchError } = await supabase
    .from('matchs')
    .insert([dataToInsert])
    .select()
    .single();
  if (matchError) {
    console.error('Error creating match:', matchError.message);
    throw matchError;
  }

  // 3. Create the initial match_partie
  const { data: newPartie, error: partieError } = await supabase
    .from('match_partie')
    .insert([{
      match_id: newMatch.id,
      adversaire_id: newMatch.adversaire_id,
      score_equipe: 0,
      score_adversaire: 0,
    }])
    .select()
    .single();

  if (partieError) {
    console.error('Error creating initial match_partie:', partieError.message);
    await supabase.from('matchs').delete().eq('id', newMatch.id); // Rollback
    throw partieError;
  }

  // 4. Link the initial partie to the match
  const { error: updateMatchError } = await supabase
    .from('matchs')
    .update({ initial_partie_id: newPartie.id })
    .eq('id', newMatch.id);

  if (updateMatchError) {
    console.error('Error linking initial partie to match:', updateMatchError.message);
    await supabase.from('match_partie').delete().eq('id', newPartie.id);
    await supabase.from('matchs').delete().eq('id', newMatch.id); // Rollback
    throw updateMatchError;
    await supabase.storage.from(MATCH_PHOTO_BUCKET_NAME).remove(matchData.photos);
  }

  await supabase.from('buts').delete().eq('match_id', id);
  await supabase.from('composition').delete().eq('match_id', id);
  await supabase.from('match_partie').delete().eq('match_id', id);

  const { error } = await supabase
    .from('matchs')
    .delete()
    .eq('id', id);
  if (error) {
    console.error('Error deleting match:', error.message);
    throw error;
  }
};


// --- Match Parties (Supabase) ---
export const createPartie = async (partieData) => {
  const dataToInsert = { ...partieData };
  if (!dataToInsert.adversaire_id) {
    dataToInsert.adversaire_id = null;
  }

  const { data, error } = await supabase
    .from('match_partie')
    .insert(dataToInsert)
    .select()
    .single();
  if (error) {
    console.error('Error creating partie:', error.message);
    throw error;
  }
  return data;
};

export const updatePartie = async (id, partieData) => {
  const dataToUpdate = { ...partieData };
  if ('adversaire_id' in dataToUpdate && !dataToUpdate.adversaire_id) {
    dataToUpdate.adversaire_id = null;
  }

  const { data, error } = await supabase
    .from('match_partie')
    .update(dataToUpdate)
    .eq('id', id)
    .select()
    .single();
  if (error) {
    console.error('Error updating partie:', error.message);
    throw error;
  }
  return data;
};

export const deletePartie = async (id) => {
  const { error } = await supabase
    .from('match_partie')
    .delete()
    .eq('id', id);
  if (error) {
    console.error('Error deleting partie:', error.message);
    throw error;
  }
};


// --- Composition (Supabase) ---
export const getCompositionForMatch = async (matchId) => {
  const { data, error } = await supabase
    .from('composition')
    .select(`
      id,
      match_id,
      joueuse_id,
      titulaire,
      gardienne,
      joueuse:joueuse_id (id, nom, prenom, photo_principale)
    `)
    .eq('match_id', matchId);

  if (error) {
    console.error('Error fetching composition:', error.message);
    throw error;
  }

  const compositionWithAvatars = await Promise.all(
    (data || []).map(async c => {
      const avatarUrl = await getAvatarUrl(c.joueuse.photo_principale);
      return {
        ...c,
        joueuse: {
          ...c.joueuse,
          avatarUrl,
        },
      };
    })
  );
  return compositionWithAvatars;
};

export const addComposition = async (matchId, joueuseId, titulaire, gardienne) => {
  const { data: newComp, error } = await supabase
    .from('composition')
    .insert([{
      match_id: matchId,
      joueuse_id: joueuseId,
      titulaire: titulaire,
      gardienne: gardienne,
    }])
    .select()
    .single();
  if (error) {
    console.error('Error adding composition:', error.message);
    throw error;
  }
  return newComp;
};

export const updateComposition = async (id, data) => {
  const { data: updatedComp, error } = await supabase
    .from('composition')
    .update(data)
    .eq('id', id)
    .select()
    .single();
  if (error) {
    console.error('Error updating composition:', error.message);
    throw error;
  }
  return updatedComp;
};

export const removeComposition = async (id) => {
  const { error } = await supabase
    .from('composition')
    .delete()
    .eq('id', id);
  if (error) {
    console.error('Error removing composition:', error.message);
    throw error;
  }
};

// --- Buts (Supabase) ---
export const getButsForMatch = async (matchId) => {
  const { data, error } = await supabase
    .from('buts')
    .select(`
      id,
      match_id,
      joueuse_id,
      nombre_de_buts,
      joueuse:joueuse_id (id, nom, prenom)
    `)
    .eq('match_id', matchId);
  if (error) {
    console.error('Error fetching buts:', error.message);
    throw error;
  }
  return data;
};

export const addBut = async (matchId, joueuseId, nombreDeButs) => {
  const { data: newBut, error } = await supabase
    .from('buts')
    .insert([{
      match_id: matchId,
      joueuse_id: joueuseId,
      nombre_de_buts: nombreDeButs,
      temps_creation: new Date().toISOString(),
    }])
    .select()
    .single();
  if (error) {
    console.error('Error adding but:', error.message);
    throw error;
  }
  return newBut;
};

export const removeBut = async (id) => {
  const { error } = await supabase
    .from('buts')
    .delete()
    .eq('id', id);
  if (error) {
    console.error('Error removing but:', error.message);
    throw error;
  }
};

export const getButsByJoueuse = async (joueuseId) => {
  const { data, error } = await supabase
    .from('buts')
    .select('match_id, nombre_de_buts')
    .eq('joueuse_id', joueuseId);

  if (error) {
    console.error('Error fetching goals by player:', error);
    return {};
  }

  const butsParMatch = data.reduce((acc, but) => {
    acc[but.match_id] = (acc[but.match_id] || 0) + (but.nombre_de_buts || 0);
    return acc;
  }, {});

  return butsParMatch;
};

// --- Statistiques (Supabase) ---
export const getJoueusesStats = async (matchType = 'all') => {
  // 1. Get all players
  const { data: joueuses, error: joueusesError } = await supabase
    .from('joueuse')
    .select('id, nom, prenom, photo_principale');
  if (joueusesError) throw joueusesError;

  // 2. Get matches and compositions, filtering by match type if necessary
  let matchQuery = supabase
    .from('matchs')
    .select('id, type_match, is_away, composition(joueuse_id, gardienne)');

  if (matchType !== 'all') {
    matchQuery = matchQuery.eq('type_match', matchType);
  }

  const { data: matchs, error: matchsError } = await matchQuery;
  if (matchsError) throw matchsError;

  const matchIds = matchs.map(m => m.id);

  // 3. Get goals for those matches
  let buts = [];
  if (matchIds.length > 0) {
    const { data: butsData, error: butsError } = await supabase
      .from('buts')
      .select('joueuse_id, nombre_de_buts')
      .in('match_id', matchIds);
    if (butsError) throw butsError;
    buts = butsData;
  }

  // 4. Process stats
  const stats = await Promise.all(joueuses.map(async (joueuse) => {
    const avatarUrl = await getAvatarUrl(joueuse.photo_principale);

    let matchesPlayedHome = 0;
    let matchesPlayedAway = 0;
    let nb_fois_gardienne = 0;

    matchs.forEach(match => {
      const compositionEntry = match.composition.find(c => c.joueuse_id === joueuse.id);
      if (compositionEntry) {
        if (match.is_away) {
          matchesPlayedAway++;
        } else {
          matchesPlayedHome++;
        }
        if (compositionEntry.gardienne) {
          nb_fois_gardienne++;
        }
      }
    });

    const totalMatches = matchesPlayedHome + matchesPlayedAway;

    const totalGoals = buts
      .filter(but => but.joueuse_id === joueuse.id)
      .reduce((sum, but) => sum + (but.nombre_de_buts || 0), 0);

    const goalsPerMatch = totalMatches > 0 ? totalGoals / totalMatches : 0;

    return {
      ...joueuse,
      avatarUrl,
      matchesPlayedHome,
      matchesPlayedAway,
      totalGoals,
      totalMatches,
      goalsPerMatch,
      nb_fois_gardienne,
    };
  }));

  return stats.sort((a, b) => b.totalGoals - a.totalGoals || b.totalMatches - a.totalMatches || a.prenom.localeCompare(b.prenom));
};


export const getStatsJoueuse = async (joueuseId) => {
  const { count: nb_matchs_joues, error: matchsError } = await supabase
    .from('composition')
    .select('match_id', { count: 'exact', head: true })
    .eq('joueuse_id', joueuseId);

  const { data: butsData, error: butsError } = await supabase
    .from('buts')
    .select('nombre_de_buts')
    .eq('joueuse_id', joueuseId);

  const nb_buts = butsData ? butsData.reduce((sum, but) => sum + (but.nombre_de_buts || 0), 0) : 0;

  const { count: nb_fois_gardienne, error: gardienneError } = await supabase
    .from('composition')
    .select('*', { count: 'exact', head: true })
    .eq('joueuse_id', joueuseId)
    .eq('gardienne', true);

  if (matchsError || butsError || gardienneError) {
    console.error('Error fetching stats:', matchsError || butsError || gardienneError);
    throw new Error('Could not fetch player stats');
  }

  return {
    nb_matchs_joues: nb_matchs_joues || 0,
    nb_buts: nb_buts || 0,
    nb_fois_gardienne: nb_fois_gardienne || 0,
  };
};

export const getMatchsForJoueuse = async (joueuseId) => {
  const { data: compositionEntries, error: compError } = await supabase
    .from('composition')
    .select('match_id')
    .eq('joueuse_id', joueuseId);

  if (compError) {
    console.error('Error fetching matches for player:', compError);
    return [];
  }

  const matchIds = compositionEntries.map(c => c.match_id);

  if (matchIds.length === 0) return [];

  const { data: matches, error: matchesError } = await supabase
    .from('matchs')
    .select('*, adversaire:adversaire_id(nom), parties:match_partie!match_partie_match_id_fkey(*)')
    .in('id', matchIds)
    .order('date_match', { ascending: false });

  if (matchesError) {
    console.error('Error fetching matches data:', matchesError);
    return [];
  }

  return matches.map(match => {
    let score_equipe = null;
    let score_adversaire = null;
    if (!match.is_multi_partie && match.parties && match.parties.length > 0) {
      score_equipe = match.parties[0].score_equipe;
      score_adversaire = match.parties[0].score_adversaire;
    }
    return {
      ...match,
      nom_adversaire: match.adversaire?.nom || 'Tournoi/Plateau',
      score_equipe,
      score_adversaire,
    }
  });
};

export const getTeamStats = async () => {
  // 1. Récupérer les ID des matchs dont la date est passée
  const today = new Date().toISOString().split('T')[0];
  const { data: pastMatches, error: matchError } = await supabase
    .from('matchs')
    .select('id')
    .lt('date_match', today);

  if (matchError) {
    console.error("Error fetching past matches:", matchError);
    throw matchError;
  }

  const pastMatchIds = pastMatches.map(m => m.id);

  // 2. Compter le nombre de parties et la somme des buts pour ces matchs passés
  let totalMatchs = 0;
  let totalButs = 0;

  if (pastMatchIds.length > 0) {
    const { data: partiesData, error: partieError } = await supabase
      .from('match_partie')
      .select('score_equipe')
      .in('match_id', pastMatchIds);

    if (partieError) {
      console.error("Error fetching total parties data:", partieError);
      throw partieError;
    }

    totalMatchs = partiesData.length;
    totalButs = partiesData.reduce((sum, current) => sum + (current.score_equipe || 0), 0);
  }

  return {
    totalMatchs,
    totalButs
  };
};

export const getOpponentStats = async () => {
  const { data: matches, error } = await supabase
    .from('matchs')
    .select(`
            type_match,
            adversaire:adversaire_id (id, nom, logo),
            parties:match_partie!match_partie_match_id_fkey(
                score_equipe, 
                score_adversaire,
                adversaire:adversaire_id(id, nom, logo)
            )
        `)
    .not('parties', 'is', null);

  if (error) {
    console.error("Error fetching matches for opponent stats:", error);
    throw error;
  }

  const stats = {};

  matches.forEach(match => {
    match.parties.forEach(partie => {
      const opponent = partie.adversaire || match.adversaire;
      if (!opponent || !opponent.id) return;

      if (!stats[opponent.id]) {
        stats[opponent.id] = {
          id: opponent.id,
          nom: opponent.nom,
          logoUrl: opponent.logo ? supabase.storage.from(CLUB_LOGO_BUCKET_NAME).getPublicUrl(opponent.logo).data.publicUrl : null,
          wins: 0,
          draws: 0,
          losses: 0,
          totalMatches: 0,
        };
      }

      stats[opponent.id].totalMatches++;
      if (partie.score_equipe > partie.score_adversaire) {
        stats[opponent.id].wins++;
      } else if (partie.score_equipe < partie.score_adversaire) {
        stats[opponent.id].losses++;
      } else {
        stats[opponent.id].draws++;
      }
    });
  });

  return Object.values(stats);
};


// --- Users (Admin) ---
export const getUsers = async () => {
  const { data, error } = await supabase.functions.invoke('list-users');

  if (error) {
    console.error('Fetch error from list-users function:', error);
    throw new Error(error.message || 'Failed to fetch users');
  }

  if (data.error) {
    console.error('Error from list-users function:', data.error);
    throw new Error(data.error);
  }

  return data.users;
};

export const updateUserRole = async (id, role) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating user role:', error.message);
    throw error;
  }
  return data;
};