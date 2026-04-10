import { PedidoDetailPage } from "@/components/pages/PedidoDetailPage";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <PedidoDetailPage id={id} />;
}
