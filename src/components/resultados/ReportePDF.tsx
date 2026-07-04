import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: "Helvetica" },
  header: { marginBottom: 16, borderBottom: 2, borderColor: "#0D9488", paddingBottom: 8 },
  titulo: { fontSize: 18, fontWeight: 700, color: "#134E4A" },
  subtitulo: { fontSize: 10, color: "#78716C", marginTop: 2 },
  seccion: { marginTop: 14 },
  seccionTitulo: {
    fontSize: 12,
    fontWeight: 700,
    color: "#0D9488",
    marginBottom: 6,
    borderBottom: 1,
    borderColor: "#E5E7EB",
    paddingBottom: 3,
  },
  fila: { flexDirection: "row", marginBottom: 3 },
  etiqueta: { width: 160, color: "#78716C" },
  valor: { flex: 1 },
  badge: {
    fontSize: 9,
    backgroundColor: "#F1F5F4",
    color: "#134E4A",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  badgeRow: { flexDirection: "row", flexWrap: "wrap" },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 32,
    right: 32,
    fontSize: 8,
    color: "#78716C",
    textAlign: "center",
  },
});

export type ReportePDFProps = {
  paciente: { nombreCompleto: string };
  profesional: { nombreCompleto: string };
  fechaGeneracion: string;
  anamnesis: {
    motivoConsulta: string | null;
    objetivoPaciente: string | null;
  } | null;
  valoracionFisica: {
    frecuenciaCardiacaReposo: number | null;
    presionArterialSistolica: number | null;
    presionArterialDiastolica: number | null;
  } | null;
  antropometrica: {
    pesoKg: number | null;
    tallaCm: number | null;
    imc: number | null;
    porcentajeGrasa: number | null;
    masaMuscularKg: number | null;
    somatotipo: { endomorfia: number; mesomorfia: number; ectomorfia: number } | null;
  } | null;
  hallazgosPosturales: { hallazgo: string; severidad: string }[];
};

export function ReportePDF(props: ReportePDFProps) {
  const {
    paciente,
    profesional,
    fechaGeneracion,
    anamnesis,
    valoracionFisica,
    antropometrica,
    hallazgosPosturales,
  } = props;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.titulo}>Reporte de Resultados — Atlas</Text>
          <Text style={styles.subtitulo}>
            Paciente: {paciente.nombreCompleto} · Profesional: {profesional.nombreCompleto}
          </Text>
          <Text style={styles.subtitulo}>Generado el {fechaGeneracion}</Text>
        </View>

        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Anamnesis</Text>
          <View style={styles.fila}>
            <Text style={styles.etiqueta}>Motivo de consulta</Text>
            <Text style={styles.valor}>
              {anamnesis?.motivoConsulta || "Sin registrar"}
            </Text>
          </View>
          <View style={styles.fila}>
            <Text style={styles.etiqueta}>Objetivo del paciente</Text>
            <Text style={styles.valor}>
              {anamnesis?.objetivoPaciente || "Sin registrar"}
            </Text>
          </View>
        </View>

        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Valoración física</Text>
          <View style={styles.fila}>
            <Text style={styles.etiqueta}>Frecuencia cardíaca en reposo</Text>
            <Text style={styles.valor}>
              {valoracionFisica?.frecuenciaCardiacaReposo ?? "—"} lpm
            </Text>
          </View>
          <View style={styles.fila}>
            <Text style={styles.etiqueta}>Presión arterial</Text>
            <Text style={styles.valor}>
              {valoracionFisica?.presionArterialSistolica ?? "—"}/
              {valoracionFisica?.presionArterialDiastolica ?? "—"} mmHg
            </Text>
          </View>
        </View>

        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Valoración antropométrica</Text>
          <View style={styles.fila}>
            <Text style={styles.etiqueta}>Peso / Talla</Text>
            <Text style={styles.valor}>
              {antropometrica?.pesoKg ?? "—"} kg / {antropometrica?.tallaCm ?? "—"} cm
            </Text>
          </View>
          <View style={styles.fila}>
            <Text style={styles.etiqueta}>IMC</Text>
            <Text style={styles.valor}>{antropometrica?.imc ?? "—"}</Text>
          </View>
          <View style={styles.fila}>
            <Text style={styles.etiqueta}>% de grasa corporal</Text>
            <Text style={styles.valor}>
              {antropometrica?.porcentajeGrasa ?? "—"}%
            </Text>
          </View>
          <View style={styles.fila}>
            <Text style={styles.etiqueta}>Masa muscular estimada</Text>
            <Text style={styles.valor}>
              {antropometrica?.masaMuscularKg ?? "—"} kg
            </Text>
          </View>
          {antropometrica?.somatotipo && (
            <View style={styles.fila}>
              <Text style={styles.etiqueta}>Somatotipo (Endo-Meso-Ecto)</Text>
              <Text style={styles.valor}>
                {antropometrica.somatotipo.endomorfia}-
                {antropometrica.somatotipo.mesomorfia}-
                {antropometrica.somatotipo.ectomorfia}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Análisis postural</Text>
          {hallazgosPosturales.length > 0 ? (
            <View style={styles.badgeRow}>
              {hallazgosPosturales.map((h, i) => (
                <Text key={i} style={styles.badge}>
                  {h.hallazgo} ({h.severidad})
                </Text>
              ))}
            </View>
          ) : (
            <Text>Sin asimetrías detectadas o análisis no realizado.</Text>
          )}
        </View>

        <Text style={styles.footer}>
          Generado automáticamente por Atlas. Este reporte no reemplaza el
          criterio clínico del profesional a cargo.
        </Text>
      </Page>
    </Document>
  );
}
