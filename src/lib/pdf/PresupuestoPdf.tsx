import React from "react";
import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { PedidoDetail } from "@/lib/types";
import type { TrabajoDetalleItem } from "@/lib/queries/catalogo";
import type { RepuestoDetalleItem } from "@/lib/queries/repuestos";

Font.registerHyphenationCallback((word) => [word]);

const palette = {
  accent: "#ea580c",
  foreground: "#0f172a",
  muted: "#64748b",
  border: "#e2e8f0",
  surface: "#f8fafc",
  white: "#ffffff",
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 11,
    color: palette.foreground,
    paddingTop: 40,
    paddingBottom: 48,
    paddingHorizontal: 40,
    backgroundColor: palette.white,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  headerLeft: { flexDirection: "column", gap: 3, flex: 1, paddingRight: 16 },
  companyName: { fontSize: 18, fontFamily: "Helvetica-Bold", color: palette.accent },
  companyTagline: { fontSize: 10, color: palette.muted },
  companyMeta: { fontSize: 9, color: palette.muted },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 16 },
  headerInfo: { flexDirection: "column", alignItems: "flex-end", gap: 3 },
  qr: { width: 72, height: 72 },
  presupuestoLabel: { fontSize: 10, color: palette.muted, textTransform: "uppercase" },
  presupuestoNum: { fontSize: 20, fontFamily: "Helvetica-Bold", color: palette.foreground },
  headerMeta: { fontSize: 9, color: palette.muted },

  // Section
  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: palette.accent,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  card: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 6,
    padding: 12,
  },

  // Client / vehicle info
  infoGrid: { flexDirection: "row", gap: 16 },
  infoCol: { flex: 1, gap: 5 },
  infoRow: { flexDirection: "row", gap: 6, alignItems: "center" },
  infoLabel: { fontSize: 9, color: palette.muted, width: 64 },
  infoValue: { fontSize: 10, color: palette.foreground, flex: 1 },
  infoValueBold: { fontSize: 10, fontFamily: "Helvetica-Bold", color: palette.foreground, flex: 1 },

  // Trabajos table
  tableHeader: {
    flexDirection: "row",
    backgroundColor: palette.accent,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tableHeaderText: { fontSize: 9, fontFamily: "Helvetica-Bold", color: palette.white },
  tableRow: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  tableRowAlt: { backgroundColor: palette.surface },
  colNombre: { flex: 1 },
  colCantidad: { width: 48, textAlign: "center" },
  colPrecio: { width: 72, textAlign: "right" },
  tableCell: { fontSize: 10, color: palette.foreground },
  tableCellMuted: { fontSize: 10, color: palette.muted },

  // Category heading inside table
  categoryRow: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#fff7ed",
    borderBottomWidth: 1,
    borderBottomColor: "#fed7aa",
  },
  categoryLabel: { fontSize: 9, fontFamily: "Helvetica-Bold", color: palette.accent },

  // Total
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 12,
    marginTop: 10,
  },
  totalsCard: {
    marginTop: 12,
    marginLeft: "auto",
    width: 220,
    gap: 8,
  },
  totalsSection: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "stretch",
    gap: 16,
  },
  observationsCard: {
    flex: 1,
    gap: 8,
  },
  observationsLabel: {
    fontSize: 9,
    color: palette.muted,
  },
  observationsValue: {
    fontSize: 10,
    color: palette.foreground,
    lineHeight: 1.4,
  },
  totalsLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  totalsLineStrong: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
  totalLabel: { fontSize: 11, color: palette.muted },
  totalValue: { fontSize: 15, fontFamily: "Helvetica-Bold", color: palette.foreground },
  subtotalLabel: { fontSize: 9, color: palette.muted },
  subtotalValue: { fontSize: 9, color: palette.foreground },

  // Footer
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: palette.border,
    paddingTop: 8,
  },
  footerText: { fontSize: 9, color: palette.muted },
});

function formatPrecio(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Sin fecha";
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function groupByCategory(trabajos: TrabajoDetalleItem[]) {
  const map = new Map<
    number,
    { nombre: string; items: TrabajoDetalleItem[] }
  >();

  for (const t of trabajos) {
    const group = map.get(t.categoriaId);
    if (group) {
      group.items.push(t);
    } else {
      map.set(t.categoriaId, { nombre: t.categoriaNombre, items: [t] });
    }
  }

  return Array.from(map.values());
}

function groupRepuestosByCategory(repuestos: RepuestoDetalleItem[]) {
  const map = new Map<
    number,
    { nombre: string; items: RepuestoDetalleItem[] }
  >();

  for (const r of repuestos) {
    const group = map.get(r.categoriaId);
    if (group) {
      group.items.push(r);
    } else {
      map.set(r.categoriaId, { nombre: r.categoriaNombre, items: [r] });
    }
  }

  return Array.from(map.values());
}

type Props = {
  pedido: PedidoDetail;
  trabajos: TrabajoDetalleItem[];
  repuestos: RepuestoDetalleItem[];
  qrDataUrl: string;
};

export function PresupuestoPdf({ pedido, trabajos, repuestos, qrDataUrl }: Props) {
  const groups = groupByCategory(trabajos);
  const repuestoGroups = groupRepuestosByCategory(repuestos);
  const totalTrabajos = trabajos.reduce((sum, t) => sum + t.precio, 0);
  const totalRepuestos = repuestos.reduce((sum, r) => sum + r.total, 0);
  const totalGeneral = totalTrabajos + totalRepuestos;

  const allRows: Array<
    | { type: "category"; nombre: string }
    | { type: "trabajo"; item: TrabajoDetalleItem; index: number }
  > = [];
  let globalIndex = 0;
  for (const g of groups) {
    allRows.push({ type: "category", nombre: g.nombre });
    for (const item of g.items) {
      allRows.push({ type: "trabajo", item, index: globalIndex });
      globalIndex += 1;
    }
  }

  return (
    <Document
      title={`Presupuesto #${pedido.numero_pedido} - Recticar`}
      author="Recticar"
    >
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.companyName}>Recticar</Text>
            <Text style={styles.companyTagline}>Rectificación de motores</Text>
            <Text style={styles.companyMeta}>Tel: 02800 443-6272</Text>
            <Text style={styles.companyMeta}>
              Cadfan Hughes 164, U9100 Trelew, Chubut
            </Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.headerInfo}>
              <Text style={styles.presupuestoLabel}>Presupuesto</Text>
              <Text style={styles.presupuestoNum}>#{pedido.numero_pedido}</Text>
              <Text style={styles.headerMeta}>
                Creado: {formatDate(pedido.fecha_creacion)}
              </Text>
              {pedido.fecha_aprobacion ? (
                <Text style={styles.headerMeta}>
                  Aprobado: {formatDate(pedido.fecha_aprobacion)}
                </Text>
              ) : null}
            </View>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src={qrDataUrl} style={styles.qr} />
          </View>
        </View>

        {/* CLIENTE + VEHICULO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos del trabajo</Text>
          <View style={[styles.card, styles.infoGrid]}>
            <View style={styles.infoCol}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Cliente</Text>
                <Text style={styles.infoValueBold}>
                  {pedido.cliente_nombre ?? "Sin asignar"}
                </Text>
              </View>
              {pedido.cliente_dni ? (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>DNI</Text>
                  <Text style={styles.infoValue}>{pedido.cliente_dni}</Text>
                </View>
              ) : null}
              {pedido.cliente_cuit ? (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>CUIT</Text>
                  <Text style={styles.infoValue}>{pedido.cliente_cuit}</Text>
                </View>
              ) : null}
              {pedido.cliente_telefono ? (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Teléfono</Text>
                  <Text style={styles.infoValue}>{pedido.cliente_telefono}</Text>
                </View>
              ) : null}
            </View>
            <View style={styles.infoCol}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Vehículo</Text>
                <Text style={styles.infoValue}>
                  {[pedido.marca_nombre, pedido.modelo_nombre]
                    .filter(Boolean)
                    .join(" / ") || "Sin definir"}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Motor</Text>
                <Text style={styles.infoValue}>
                  {pedido.motor_nombre ?? "Sin definir"}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>N° de serie</Text>
                <Text style={styles.infoValue}>
                  {pedido.numero_serie_motor || "Sin serie"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* TRABAJOS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trabajos incluidos</Text>

          {trabajos.length === 0 ? (
            <View style={styles.card}>
              <Text style={styles.tableCellMuted}>Sin trabajos seleccionados.</Text>
            </View>
          ) : (
            <View
              style={{
                borderWidth: 1,
                borderColor: palette.border,
                borderRadius: 6,
                overflow: "hidden",
              }}
            >
              {/* Table header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, styles.colNombre]}>
                  Trabajo
                </Text>
                <Text style={[styles.tableHeaderText, styles.colPrecio]}>
                  Precio
                </Text>
              </View>

              {allRows.map((row, i) => {
                if (row.type === "category") {
                  return (
                    <View key={`cat-${row.nombre}-${i}`} style={styles.categoryRow}>
                      <Text style={styles.categoryLabel}>{row.nombre}</Text>
                    </View>
                  );
                }

                const isAlt = row.index % 2 === 1;
                return (
                  <View
                    key={row.item.trabajoId}
                    style={isAlt ? [styles.tableRow, styles.tableRowAlt] : styles.tableRow}
                  >
                    <Text style={[styles.tableCell, styles.colNombre]}>
                      {row.item.trabajoNombre}
                    </Text>
                    <Text style={[styles.tableCell, styles.colPrecio]}>
                      {row.item.precio > 0
                        ? formatPrecio(row.item.precio)
                        : "-"}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          {trabajos.length > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.subtotalLabel}>Total trabajos</Text>
              <Text style={styles.subtotalValue}>{formatPrecio(totalTrabajos)}</Text>
            </View>
          )}
        </View>

        {/* REPUESTOS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Repuestos incluidos</Text>

          {repuestos.length === 0 ? (
            <View style={styles.card}>
              <Text style={styles.tableCellMuted}>Sin repuestos seleccionados.</Text>
            </View>
          ) : (
            <View
              style={{
                borderWidth: 1,
                borderColor: palette.border,
                borderRadius: 6,
                overflow: "hidden",
              }}
            >
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, styles.colNombre]}>
                  Repuesto
                </Text>
                <Text style={[styles.tableHeaderText, styles.colCantidad]}>
                  Cant.
                </Text>
                <Text style={[styles.tableHeaderText, styles.colPrecio]}>
                  Unit.
                </Text>
                <Text style={[styles.tableHeaderText, styles.colPrecio]}>
                  Total
                </Text>
              </View>

              {repuestoGroups.flatMap((group, groupIndex) => [
                <View key={`rep-cat-${groupIndex}`} style={styles.categoryRow}>
                  <Text style={styles.categoryLabel}>{group.nombre}</Text>
                </View>,
                ...group.items.map((item, index) => (
                  <View
                    key={item.repuestoId}
                    style={index % 2 === 1 ? [styles.tableRow, styles.tableRowAlt] : styles.tableRow}
                  >
                    <Text style={[styles.tableCell, styles.colNombre]}>
                      {item.repuestoNombre}
                    </Text>
                    <Text style={[styles.tableCell, styles.colCantidad]}>
                      {item.cantidad}
                    </Text>
                    <Text style={[styles.tableCell, styles.colPrecio]}>
                      {item.precioUnitario > 0 ? formatPrecio(item.precioUnitario) : "-"}
                    </Text>
                    <Text style={[styles.tableCell, styles.colPrecio]}>
                      {item.total > 0 ? formatPrecio(item.total) : "-"}
                    </Text>
                  </View>
                )),
              ])}
            </View>
          )}

          {repuestos.length > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.subtotalLabel}>Total repuestos</Text>
              <Text style={styles.subtotalValue}>{formatPrecio(totalRepuestos)}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Totales</Text>
          <View style={styles.totalsSection}>
            <View style={[styles.card, styles.observationsCard]}>
              <Text style={styles.observationsLabel}>Observaciones</Text>
              <Text style={styles.observationsValue}>
                {pedido.observaciones?.trim() || "Sin observaciones."}
              </Text>
            </View>
            <View style={[styles.card, styles.totalsCard]}>
              <View style={styles.totalsLine}>
                <Text style={styles.subtotalLabel}>Trabajos</Text>
                <Text style={styles.subtotalValue}>{formatPrecio(totalTrabajos)}</Text>
              </View>
              <View style={styles.totalsLine}>
                <Text style={styles.subtotalLabel}>Repuestos</Text>
                <Text style={styles.subtotalValue}>{formatPrecio(totalRepuestos)}</Text>
              </View>
              <View style={[styles.totalsLine, styles.totalsLineStrong]}>
                <Text style={styles.totalLabel}>Total general</Text>
                <Text style={styles.totalValue}>{formatPrecio(totalGeneral)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Recticar — Rectificación de motores</Text>
          <Text style={styles.footerText}>
            Presupuesto #{pedido.numero_pedido} · {formatDate(pedido.fecha_creacion)}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
