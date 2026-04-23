ALTER TABLE empresa_configuracion
  ADD COLUMN IF NOT EXISTS dias_habiles_umbral_verde integer NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS dias_habiles_umbral_naranja integer NOT NULL DEFAULT 10;

UPDATE empresa_configuracion
SET
  dias_habiles_umbral_verde = GREATEST(0, dias_habiles_umbral_verde),
  dias_habiles_umbral_naranja = GREATEST(dias_habiles_umbral_verde, dias_habiles_umbral_naranja)
WHERE id = 1;
