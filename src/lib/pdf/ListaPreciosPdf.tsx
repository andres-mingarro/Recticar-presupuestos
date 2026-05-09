import React from "react";
import { Document, Font, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { TrabajoAgrupado } from "@/lib/types";
import type { EmpresaConfig } from "@/lib/queries/empresa";
import { LISTAS_PRECIOS, getPrecioLista } from "@/lib/db";

Font.registerHyphenationCallback((word) => [word]);

const palette = {
  accent: "#ea580c",
  foreground: "#0f172a",
  muted: "#64748b",
  border: "#e2e8f0",
  surface: "#f8fafc",
  white: "#ffffff",
  altCol: "rgba(0,0,0,0.03)",
};

const COL_PRECIO_WIDTH = 68;

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: palette.foreground,
    paddingTop: 32,
    paddingBottom: 44,
    paddingHorizontal: 32,
    backgroundColor: palette.white,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  companyName: { fontSize: 15, fontFamily: "Helvetica-Bold", color: palette.accent },
  companyMeta: { fontSize: 7.5, color: palette.muted, marginTop: 2 },
  logo: { width: 120, height: 36, objectFit: "contain" },
  headerRight: { alignItems: "flex-end" },
  titulo: { fontSize: 13, fontFamily: "Helvetica-Bold", color: palette.foreground },
  fecha: { fontSize: 7.5, color: palette.muted, marginTop: 2 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: palette.accent,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    paddingLeft: 8,
    paddingVertical: 5,
  },
  tableHeaderText: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: palette.white },
  categoryRow: {
    flexDirection: "row",
    paddingLeft: 8,
    paddingVertical: 4,
    backgroundColor: "#fff7ed",
    borderBottomWidth: 1,
    borderBottomColor: "#fed7aa",
  },
  categoryLabel: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: palette.accent },
  tableRow: {
    flexDirection: "row",
    paddingLeft: 8,
    paddingVertical: 3.5,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  tableRowAlt: { backgroundColor: palette.surface },
  tableCell: { fontSize: 8.5, color: palette.foreground },
  tableCellRight: { fontSize: 8.5, color: palette.foreground, textAlign: "right", paddingRight: 6 },
  tableCellRightMuted: { fontSize: 8.5, color: palette.muted, textAlign: "right", paddingRight: 6 },
  colNombre: { flex: 1 },
  colPrecio: { width: COL_PRECIO_WIDTH },
  colPrecioAlt: { width: COL_PRECIO_WIDTH, backgroundColor: palette.altCol },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 32,
    right: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: palette.border,
    paddingTop: 5,
  },
  footerText: { fontSize: 7.5, color: palette.muted },
});

const LP_PRICE_FORMATTER = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const LP_DATE_FORMATTER = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function formatPrecio(value: number) {
  return LP_PRICE_FORMATTER.format(value);
}

function formatDate(date: Date) {
  return LP_DATE_FORMATTER.format(date);
}

type Props = {
  grupos: TrabajoAgrupado[];
  empresa: EmpresaConfig;
  logoDataUrl?: string | null;
};

export function ListaPreciosPdf({ grupos, empresa, logoDataUrl = null }: Props) {
  const fecha = new Date();
  const companyMeta = [empresa.telefono, empresa.email].filter(Boolean).join(" · ");

  return (
    <Document title={`Lista de precios — ${empresa.nombre}`} author={empresa.nombre}>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* HEADER */}
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
            <Text style={styles.titulo}>Lista de precios</Text>
            <Text style={styles.fecha}>{formatDate(fecha)}</Text>
          </View>
        </View>

        {/* TABLE */}
        <View style={{ borderWidth: 1, borderColor: palette.border, borderRadius: 4, overflow: "hidden" }}>
          {/* Column headers */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colNombre]}>Trabajo</Text>
            {LISTAS_PRECIOS.map((n, i) => (
              <Text
                key={n}
                style={[
                  styles.tableHeaderText,
                  i % 2 === 1 ? styles.colPrecioAlt : styles.colPrecio,
                  { textAlign: "right", paddingRight: 6 },
                ]}
              >
                Lista {n}
              </Text>
            ))}
          </View>

          {/* Rows */}
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
                {LISTAS_PRECIOS.map((n, j) => {
                  const precio = getPrecioLista(trabajo, n);
                  return (
                    <Text
                      key={n}
                      style={[
                        precio > 0 ? styles.tableCellRight : styles.tableCellRightMuted,
                        j % 2 === 1 ? styles.colPrecioAlt : styles.colPrecio,
                      ]}
                    >
                      {precio > 0 ? formatPrecio(precio) : "-"}
                    </Text>
                  );
                })}
              </View>
            )),
          ])}
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{empresa.nombre} — Lista de precios</Text>
          <Text style={styles.footerText}>{formatDate(fecha)}</Text>
        </View>
      </Page>
    </Document>
  );
}
