import React from "react";
import { Document, Font, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { TrabajoDetail } from "@/lib/types";

Font.registerHyphenationCallback((word) => [word]);

const palette = {
  accent: "#ea580c",
  foreground: "#0f172a",
  muted: "#64748b",
  border: "#e2e8f0",
  white: "#ffffff",
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    backgroundColor: palette.white,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  qr: {
    width: 90,
    height: 90,
    flexShrink: 0,
  },
  info: {
    flexDirection: "column",
    gap: 3,
    flex: 1,
  },
  numero: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: palette.accent,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  cliente: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: palette.foreground,
  },
  vehiculo: {
    fontSize: 10,
    color: palette.muted,
  },
});

type EtiquetaPdfProps = {
  trabajo: TrabajoDetail;
  qrDataUrl: string;
};

export function EtiquetaPdf({ trabajo, qrDataUrl }: EtiquetaPdfProps) {
  const marcaModelo = [trabajo.marca_nombre, trabajo.modelo_nombre].filter(Boolean).join(" ");
  const motor = trabajo.motor_nombre ?? null;

  return (
    <Document>
      <Page size={[226.77, 170.08]} style={styles.page}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image src={qrDataUrl} style={styles.qr} />
        <View style={styles.info}>
          <Text style={styles.numero}>#{trabajo.numero_trabajo}</Text>
          <Text style={styles.cliente}>{trabajo.cliente_nombre ?? "Sin cliente"}</Text>
          {marcaModelo ? <Text style={styles.vehiculo}>{marcaModelo}</Text> : null}
          {motor ? <Text style={styles.vehiculo}>{motor}</Text> : null}
        </View>
      </Page>
    </Document>
  );
}
