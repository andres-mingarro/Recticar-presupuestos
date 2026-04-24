CREATE TABLE IF NOT EXISTS ajustes_lista_precios (
  id bigserial PRIMARY KEY,
  fecha timestamptz NOT NULL DEFAULT now(),
  categoria_id integer NOT NULL,
  categoria_nombre varchar(255) NOT NULL,
  ajuste_lista_1 numeric(6,2) NOT NULL DEFAULT 0,
  ajuste_lista_2 numeric(6,2) NOT NULL DEFAULT 0,
  ajuste_lista_3 numeric(6,2) NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_ajustes_lista_precios_fecha ON ajustes_lista_precios (fecha DESC);
CREATE INDEX IF NOT EXISTS idx_ajustes_lista_precios_categoria ON ajustes_lista_precios (categoria_id);
