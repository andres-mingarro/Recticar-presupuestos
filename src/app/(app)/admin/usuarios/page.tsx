import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getAllUsuarios } from "@/lib/queries/usuarios";
import { UsuariosClient } from "./UsuariosClient";

export default async function UsuariosPage() {
  const session = await getSession();
  const role = session?.role;

  if (role !== "admin" && role !== "superuser") redirect("/");

  const usuarios = await getAllUsuarios();

  return <UsuariosClient usuarios={usuarios} sessionRole={role} />;
}
