-- Migration SQL pour ajouter le champ affiche_url dans la table matchs
-- À exécuter dans Supabase SQL Editor

-- Ajouter la colonne affiche_url pour stocker l'URL de l'affiche générée
ALTER TABLE matchs
ADD COLUMN IF NOT EXISTS affiche_url TEXT;

-- Ajouter un commentaire pour documenter la colonne
COMMENT ON COLUMN matchs.affiche_url IS 'URL de l''affiche générée par n8n pour ce match';
