-- Reset completo de datos operativos para iniciar un nuevo cliente/proyecto.
-- NO borra: usuarios, usuario_permisos, empresa_configuracion.
-- NO toca la base técnica (TECHNICAL_DATABASE_URL).
-- Ejecutar desde el dashboard de Neon (o psql) sobre el branch de prod antes del go-live.

TRUNCATE TABLE
  orden_trabajo_repuestos,
  orden_trabajo_trabajos,
  ordenes_trabajo,
  clientes,
  repuestos,
  categorias_repuesto,
  categorias_trabajo,
  trabajos
RESTART IDENTITY CASCADE;
