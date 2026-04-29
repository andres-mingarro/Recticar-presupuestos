import React from "react";
import { Document, Font, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { TrabajoAgrupado } from "@/lib/types";
import type { EmpresaConfig } from "@/lib/queries/empresa";
import type { ListaPrecio } from "@/lib/db";
import { LISTAS_PRECIOS, getPrecioLista } from "@/lib/db";

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
    fontSize: 10,
    color: palette.foreground,
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 36,
    backgroundColor: palette.white,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  companyName: { fontSize: 16, fontFamily: "Helvetica-Bold", color: palette.accent },
  companyMeta: { fontSize: 8, color: palette.muted, marginTop: 2 },
  headerRight: { alignItems: "flex-end" },
  logo: { width: 120, height: 40, objectFit: "contain" },
  listaTitulo: { fontSize: 14, fontFamily: "Helvetica-Bold", color: palette.foreground },
  listaFecha: { fontSize: 8, color: palette.muted, marginTop: 2 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: palette.accent,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginTop: 10,
  },
  tableHeaderText: { fontSize: 8, fontFamily: "Helvetica-Bold", color: palette.white },
  categoryRow: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#fff7ed",
    borderBottomWidth: 1,
    borderBottomColor: "#fed7aa",
  },
  categoryLabel: { fontSize: 8, fontFamily: "Helvetica-Bold", color: palette.accent },
  tableRow: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  tableRowAlt: { backgroundColor: palette.surface },
  tableCell: { fontSize: 9, color: palette.foreground },
  tableCellMuted: { fontSize: 9, color: palette.muted },
  colNombre: { flex: 1 },
  colPrecio: { width: 72, textAlign: "right" },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 36,
    right: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: palette.border,
    paddingTop: 6,
  },
  footerText: { fontSize: 8, color: palette.muted },
});

function formatPrecio(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

type ListaPageProps = {
  lista: ListaPrecio;
  grupos: TrabajoAgrupado[];
  empresa: EmpresaConfig;
  fecha: Date;
  logoDataUrl: string | null;
};

function ListaPage({ lista, grupos, empresa, fecha, logoDataUrl }: ListaPageProps) {
  const companyMeta = [empresa.telefono, empresa.email].filter(Boolean).join(" · ");

  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View style={{ flexDirection: "column", gap: 4 }}>
          {logoDataUrl ? (
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image src={logoDataUrl} style={styles.logo} />
          ) : (
            <Text style={styles.companyName}>{empresa.nombre}</Text>
          )}
          {empresa.tagline ? <Text style={styles.companyMeta}>{empresa.tagline}</Text> : null}
          {companyMeta ? <Text style={styles.companyMeta}>{companyMeta}</Text> : null}
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.listaTitulo}>Lista de precios {lista}</Text>
          <Text style={styles.listaFecha}>{formatDate(fecha)}</Text>
        </View>
      </View>

      <View style={{ borderWidth: 1, borderColor: palette.border, borderRadius: 4, overflow: "hidden" }}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.colNombre]}>Trabajo</Text>
          <Text style={[styles.tableHeaderText, styles.colPrecio]}>Precio</Text>
        </View>

        {grupos.map((grupo) => [
          <View key={`cat-${grupo.categoriaId}`} style={styles.categoryRow}>
            <Text style={styles.categoryLabel}>{grupo.categoriaNombre}</Text>
          </View>,
          ...grupo.trabajos.map((trabajo, i) => (
            <View
              key={trabajo.id}
              style={i % 2 === 1 ? [styles.tableRow, styles.tableRowAlt] : styles.tableRow}
            >
              <Text style={[styles.tableCell, styles.colNombre]}>{trabajo.nombre}</Text>
              <Text style={[styles.tableCell, styles.colPrecio]}>
                {getPrecioLista(trabajo, lista) > 0
                  ? formatPrecio(getPrecioLista(trabajo, lista))
                  : "-"}
              </Text>
            </View>
          )),
        ])}
      </View>

      <View style={styles.footer} fixed>
        <Text style={styles.footerText}>{empresa.nombre} — Lista {lista}</Text>
        <Text style={styles.footerText}>{formatDate(fecha)}</Text>
      </View>
    </Page>
  );
}

type Props = {
  grupos: TrabajoAgrupado[];
  empresa: EmpresaConfig;
  listas?: ListaPrecio[];
  logoDataUrl?: string | null;
};

export function ListaPreciosPdf({ grupos, empresa, listas = LISTAS_PRECIOS as unknown as ListaPrecio[], logoDataUrl = null }: Props) {
  const fecha = new Date();

  return (
    <Document title={`Lista de precios — ${empresa.nombre}`} author={empresa.nombre}>
      {listas.map((lista) => (
        <ListaPage key={lista} lista={lista} grupos={grupos} empresa={empresa} fecha={fecha} logoDataUrl={logoDataUrl} />
      ))}
    </Document>
  );
}
