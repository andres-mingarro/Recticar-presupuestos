import { redirect } from "next/navigation";
import { getSessionWithPermisos, isSuperAdmin } from "@/lib/permisos";
import { getAllUsuarios } from "@/lib/queries/usuarios";
import { UsuariosClient } from "./UsuariosClient";

export default async function UsuariosPage() {
  const { session } = await getSessionWithPermisos();
  if (!isSuperAdmin(session)) redirect("/");

  const usuarios = await getAllUsuarios();

  return <UsuariosClient usuarios={usuarios} currentNombre={session?.nombre ?? ""} protectedNombre={process.env.ADMIN_USER ?? ""} />;
}
