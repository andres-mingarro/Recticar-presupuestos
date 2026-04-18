import { ErrorState } from "@/components/feedback/ErrorState";

export default function NotFound() {
  return (
    <ErrorState
      code="404"
      title="Esta página no existe"
      description="La ruta que intentaste abrir no está disponible o cambió de lugar dentro del sistema."
      hint="Si buscabas un trabajo o un cliente, probá volver al listado desde el menú principal y entrar de nuevo desde ahí."
      actions={[
        { label: "Ir al dashboard", href: "/", variant: "primary" },
        { label: "Ver trabajos", href: "/trabajos", variant: "secondary" },
      ]}
    />
  );
}
