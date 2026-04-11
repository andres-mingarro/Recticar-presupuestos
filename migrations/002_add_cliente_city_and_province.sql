ALTER TABLE clientes
  ADD COLUMN IF NOT EXISTS ciudad varchar(120),
  ADD COLUMN IF NOT EXISTS provincia varchar(120);
