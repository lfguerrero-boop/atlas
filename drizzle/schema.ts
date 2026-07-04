import {
  pgTable,
  uuid,
  text,
  timestamp,
  date,
  integer,
  numeric,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";

export const profesionEnum = pgEnum("profesion", [
  "entrenador",
  "fisioterapeuta",
  "nutricionista",
  "otro",
]);

export const generoEnum = pgEnum("genero", ["masculino", "femenino", "otro"]);

export const vistaEnum = pgEnum("vista", [
  "anterior",
  "posterior",
  "lateral_derecha",
  "lateral_izquierda",
]);

export const profesionales = pgTable("profesionales", {
  id: uuid("id").primaryKey(), // = auth.users.id
  nombreCompleto: text("nombre_completo").notNull(),
  email: text("email").notNull().unique(),
  profesion: profesionEnum("profesion"),
  numeroLicencia: text("numero_licencia"),
  plan: text("plan").default("free"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const pacientes = pgTable("pacientes", {
  id: uuid("id").primaryKey().defaultRandom(),
  profesionalId: uuid("profesional_id")
    .notNull()
    .references(() => profesionales.id),
  nombreCompleto: text("nombre_completo").notNull(),
  fechaNacimiento: date("fecha_nacimiento"),
  genero: generoEnum("genero"),
  email: text("email"),
  telefono: text("telefono"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

export const anamnesis = pgTable("anamnesis", {
  id: uuid("id").primaryKey().defaultRandom(),
  pacienteId: uuid("paciente_id")
    .notNull()
    .references(() => pacientes.id),
  fecha: date("fecha").defaultNow(),
  motivoConsulta: text("motivo_consulta"),
  antecedentesPersonales: text("antecedentes_personales"),
  antecedentesFamiliares: text("antecedentes_familiares"),
  antecedentesPatologicos: jsonb("antecedentes_patologicos").$type<{
    hipertension: boolean;
    diabetes: boolean;
    cardiopatias: boolean;
    asma: boolean;
    otros: string;
  }>(),
  medicamentosActuales: text("medicamentos_actuales"),
  cirugiasPrevias: text("cirugias_previas"),
  habitos: jsonb("habitos").$type<{
    fuma: boolean;
    alcohol: boolean;
    horasSueno: number;
    nivelActividadPrevia: string;
  }>(),
  objetivoPaciente: text("objetivo_paciente"),
  observaciones: text("observaciones"),
});

export const valoracionesFisicas = pgTable("valoraciones_fisicas", {
  id: uuid("id").primaryKey().defaultRandom(),
  pacienteId: uuid("paciente_id")
    .notNull()
    .references(() => pacientes.id),
  fecha: date("fecha").defaultNow(),
  frecuenciaCardiacaReposo: integer("frecuencia_cardiaca_reposo"),
  presionArterialSistolica: integer("presion_arterial_sistolica"),
  presionArterialDiastolica: integer("presion_arterial_diastolica"),
  saturacionOxigeno: integer("saturacion_oxigeno"),
  testFlexibilidad: jsonb("test_flexibilidad").$type<{
    sitAndReachCm: number;
  }>(),
  testFuerza: jsonb("test_fuerza").$type<{
    dinamometriaKg: number;
    sentadillas1min: number;
    flexiones1min: number;
  }>(),
  testCardiovascular: jsonb("test_cardiovascular").$type<{
    testCooperMetros: number;
    escalaBorgPercibida: number;
  }>(),
  observaciones: text("observaciones"),
});

export const valoracionesAntropometricas = pgTable(
  "valoraciones_antropometricas",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    pacienteId: uuid("paciente_id")
      .notNull()
      .references(() => pacientes.id),
    fecha: date("fecha").defaultNow(),
    pesoKg: numeric("peso_kg", { precision: 5, scale: 2 }),
    tallaCm: numeric("talla_cm", { precision: 5, scale: 2 }),
    pliegesCutaneosMm: jsonb("pliegues_cutaneos_mm").$type<{
      tricipital: number;
      subescapular: number;
      bicipital: number;
      supraespinal: number;
      abdominal: number;
      musloFrontal: number;
      piernaMedial: number;
    }>(),
    perimetrosCm: jsonb("perimetros_cm").$type<{
      brazoRelajado: number;
      brazoContraido: number;
      cintura: number;
      cadera: number;
      musloMedio: number;
      piernaMaxima: number;
    }>(),
    diametrosCm: jsonb("diametros_cm").$type<{
      biestiloideo: number;
      biepicondileoHumeral: number;
      biepicondileoFemoral: number;
    }>(),
    imc: numeric("imc", { precision: 4, scale: 1 }),
    porcentajeGrasa: numeric("porcentaje_grasa", { precision: 4, scale: 1 }),
    masaMuscularKg: numeric("masa_muscular_kg", { precision: 5, scale: 2 }),
    somatotipo: jsonb("somatotipo").$type<{
      endomorfia: number;
      mesomorfia: number;
      ectomorfia: number;
    }>(),
    observaciones: text("observaciones"),
  },
);

export const fotosPosturales = pgTable("fotos_posturales", {
  id: uuid("id").primaryKey().defaultRandom(),
  pacienteId: uuid("paciente_id")
    .notNull()
    .references(() => pacientes.id),
  fecha: date("fecha").defaultNow(),
  vista: vistaEnum("vista").notNull(),
  storagePath: text("storage_path").notNull(),
});

export const analisisPosturales = pgTable("analisis_posturales", {
  id: uuid("id").primaryKey().defaultRandom(),
  fotoPosturalId: uuid("foto_postural_id")
    .notNull()
    .unique()
    .references(() => fotosPosturales.id),
  landmarks: jsonb("landmarks").$type<
    Array<{ x: number; y: number; z: number; visibility: number }>
  >(),
  anguloInclinacionHombros: numeric("angulo_inclinacion_hombros", {
    precision: 4,
    scale: 1,
  }),
  anguloInclinacionCadera: numeric("angulo_inclinacion_cadera", {
    precision: 4,
    scale: 1,
  }),
  alineacionRodillas: jsonb("alineacion_rodillas").$type<{
    valgoIzqGrados: number;
    valgoDerGrados: number;
  }>(),
  asimetriasDetectadas: jsonb("asimetrias_detectadas").$type<
    Array<{ hallazgo: string; severidad: "leve" | "moderada" | "alta" }>
  >(),
  imagenAnotadaStoragePath: text("imagen_anotada_storage_path"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const reportesResultados = pgTable("reportes_resultados", {
  id: uuid("id").primaryKey().defaultRandom(),
  pacienteId: uuid("paciente_id")
    .notNull()
    .references(() => pacientes.id),
  fechaGeneracion: timestamp("fecha_generacion", {
    withTimezone: true,
  }).defaultNow(),
  resumenJson: jsonb("resumen_json"),
});
