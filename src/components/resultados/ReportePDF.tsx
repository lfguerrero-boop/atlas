import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import {
  clasificarImc,
  clasificarPorcentajeGrasa,
  interpretarSomatotipo,
  generarRecomendacionesAntropometricas,
  type Genero,
} from "@/lib/antropometria/interpretacion";
import {
  clasificarPresionArterial,
  clasificarFrecuenciaCardiaca,
  clasificarSaturacionOxigeno,
  detectarFactoresRiesgo,
} from "@/lib/valoracion-fisica/interpretacion";

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
  clasificacion: { fontSize: 9, color: "#0D9488", marginTop: 1, marginBottom: 4 },
  riesgo: { fontSize: 9, color: "#DC2626", marginTop: 1, marginBottom: 2 },
  recomendacion: { fontSize: 9, color: "#134E4A", marginTop: 1, marginBottom: 2 },
  hallazgo: { fontSize: 9, marginBottom: 4 },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 32,
    right: 32,
    fontSize: 8,
    color: "#78716C",
    textAlign: "center",
  },
  disclaimer: {
    fontSize: 8,
    color: "#78716C",
    marginTop: 6,
    fontStyle: "italic",
  },
});

export type ReportePDFProps = {
  paciente: { nombreCompleto: string; genero: Genero };
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
    saturacionOxigeno: number | null;
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

  const clasifImc =
    antropometrica?.imc != null ? clasificarImc(antropometrica.imc) : null;
  const clasifGrasa =
    antropometrica?.porcentajeGrasa != null
      ? clasificarPorcentajeGrasa(antropometrica.porcentajeGrasa, paciente.genero)
      : null;
  const somatotipoInterpretado = antropometrica?.somatotipo
    ? interpretarSomatotipo(antropometrica.somatotipo)
    : null;
  const recomendacionesAntropometricas =
    clasifImc && clasifGrasa && somatotipoInterpretado
      ? generarRecomendacionesAntropometricas({
          clasificacionImc: clasifImc,
          clasificacionGrasa: clasifGrasa,
          somatotipo: somatotipoInterpretado,
        })
      : [];

  const clasifPresion =
    valoracionFisica?.presionArterialSistolica != null &&
    valoracionFisica?.presionArterialDiastolica != null
      ? clasificarPresionArterial(
          valoracionFisica.presionArterialSistolica,
          valoracionFisica.presionArterialDiastolica,
        )
      : null;
  const clasifFc =
    valoracionFisica?.frecuenciaCardiacaReposo != null
      ? clasificarFrecuenciaCardiaca(valoracionFisica.frecuenciaCardiacaReposo)
      : null;
  const clasifSpo2 =
    valoracionFisica?.saturacionOxigeno != null
      ? clasificarSaturacionOxigeno(valoracionFisica.saturacionOxigeno)
      : null;
  const factoresRiesgo = detectarFactoresRiesgo({
    presionArterial: clasifPresion,
    frecuenciaCardiaca: clasifFc,
    saturacionOxigeno: clasifSpo2,
  });

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
          {clasifFc && <Text style={styles.clasificacion}>→ {clasifFc.categoria}: {clasifFc.descripcion}</Text>}
          <View style={styles.fila}>
            <Text style={styles.etiqueta}>Presión arterial</Text>
            <Text style={styles.valor}>
              {valoracionFisica?.presionArterialSistolica ?? "—"}/
              {valoracionFisica?.presionArterialDiastolica ?? "—"} mmHg
            </Text>
          </View>
          {clasifPresion && <Text style={styles.clasificacion}>→ {clasifPresion.categoria}: {clasifPresion.descripcion}</Text>}
          <View style={styles.fila}>
            <Text style={styles.etiqueta}>Saturación de oxígeno</Text>
            <Text style={styles.valor}>
              {valoracionFisica?.saturacionOxigeno ?? "—"}%
            </Text>
          </View>
          {clasifSpo2 && <Text style={styles.clasificacion}>→ {clasifSpo2.categoria}: {clasifSpo2.descripcion}</Text>}
          {factoresRiesgo.map((f, i) => (
            <Text key={i} style={styles.riesgo}>⚠ {f}</Text>
          ))}
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
          {clasifImc && <Text style={styles.clasificacion}>→ {clasifImc.categoria}: {clasifImc.descripcion}</Text>}
          <View style={styles.fila}>
            <Text style={styles.etiqueta}>% de grasa corporal</Text>
            <Text style={styles.valor}>
              {antropometrica?.porcentajeGrasa ?? "—"}%
            </Text>
          </View>
          {clasifGrasa && <Text style={styles.clasificacion}>→ {clasifGrasa.categoria}: {clasifGrasa.descripcion}</Text>}
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
                {somatotipoInterpretado ? ` (${somatotipoInterpretado.dominante})` : ""}
              </Text>
            </View>
          )}
          {recomendacionesAntropometricas.map((r, i) => (
            <Text key={i} style={styles.recomendacion}>• {r}</Text>
          ))}
        </View>

        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Análisis postural</Text>
          {hallazgosPosturales.length > 0 ? (
            <>
              {hallazgosPosturales.map((h, i) => (
                <Text key={i} style={styles.hallazgo}>
                  • [{h.severidad}] {h.hallazgo}
                </Text>
              ))}
              <Text style={styles.disclaimer}>
                Estos son hallazgos de cribado generados por un modelo de
                detección de pose (IA) a partir de fotografías — no
                constituyen diagnóstico médico. Requieren confirmación
                mediante evaluación clínica presencial.
              </Text>
            </>
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
