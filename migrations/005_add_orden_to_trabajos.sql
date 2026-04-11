ALTER TABLE trabajos ADD COLUMN IF NOT EXISTS orden integer NOT NULL DEFAULT 0;

-- Set initial order based on current alphabetical order within each category
UPDATE trabajos t
SET orden = sub.rn
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY categoria_id ORDER BY nombre ASC) AS rn
  FROM trabajos
) sub
WHERE t.id = sub.id;
