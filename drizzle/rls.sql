-- Row Level Security: un profesional solo accede a sus propios datos y los de sus pacientes.

alter table profesionales enable row level security;
drop policy if exists "profesional_ve_su_propio_perfil" on profesionales;
create policy "profesional_ve_su_propio_perfil"
on profesionales for all
using (id = auth.uid())
with check (id = auth.uid());

alter table pacientes enable row level security;
drop policy if exists "profesional_ve_solo_sus_pacientes" on pacientes;
create policy "profesional_ve_solo_sus_pacientes"
on pacientes for all
using (profesional_id = auth.uid())
with check (profesional_id = auth.uid());

alter table anamnesis enable row level security;
drop policy if exists "profesional_ve_anamnesis_de_sus_pacientes" on anamnesis;
create policy "profesional_ve_anamnesis_de_sus_pacientes"
on anamnesis for all
using (exists (select 1 from pacientes p where p.id = anamnesis.paciente_id and p.profesional_id = auth.uid()))
with check (exists (select 1 from pacientes p where p.id = anamnesis.paciente_id and p.profesional_id = auth.uid()));

alter table valoraciones_fisicas enable row level security;
drop policy if exists "profesional_ve_valoraciones_fisicas_de_sus_pacientes" on valoraciones_fisicas;
create policy "profesional_ve_valoraciones_fisicas_de_sus_pacientes"
on valoraciones_fisicas for all
using (exists (select 1 from pacientes p where p.id = valoraciones_fisicas.paciente_id and p.profesional_id = auth.uid()))
with check (exists (select 1 from pacientes p where p.id = valoraciones_fisicas.paciente_id and p.profesional_id = auth.uid()));

alter table valoraciones_antropometricas enable row level security;
drop policy if exists "profesional_ve_valoraciones_antropometricas_de_sus_pacientes" on valoraciones_antropometricas;
create policy "profesional_ve_valoraciones_antropometricas_de_sus_pacientes"
on valoraciones_antropometricas for all
using (exists (select 1 from pacientes p where p.id = valoraciones_antropometricas.paciente_id and p.profesional_id = auth.uid()))
with check (exists (select 1 from pacientes p where p.id = valoraciones_antropometricas.paciente_id and p.profesional_id = auth.uid()));

alter table fotos_posturales enable row level security;
drop policy if exists "profesional_ve_fotos_posturales_de_sus_pacientes" on fotos_posturales;
create policy "profesional_ve_fotos_posturales_de_sus_pacientes"
on fotos_posturales for all
using (exists (select 1 from pacientes p where p.id = fotos_posturales.paciente_id and p.profesional_id = auth.uid()))
with check (exists (select 1 from pacientes p where p.id = fotos_posturales.paciente_id and p.profesional_id = auth.uid()));

alter table analisis_posturales enable row level security;
drop policy if exists "profesional_ve_analisis_posturales_de_sus_pacientes" on analisis_posturales;
create policy "profesional_ve_analisis_posturales_de_sus_pacientes"
on analisis_posturales for all
using (exists (
  select 1 from fotos_posturales fp
  join pacientes p on p.id = fp.paciente_id
  where fp.id = analisis_posturales.foto_postural_id and p.profesional_id = auth.uid()
))
with check (exists (
  select 1 from fotos_posturales fp
  join pacientes p on p.id = fp.paciente_id
  where fp.id = analisis_posturales.foto_postural_id and p.profesional_id = auth.uid()
));

alter table reportes_resultados enable row level security;
drop policy if exists "profesional_ve_reportes_de_sus_pacientes" on reportes_resultados;
create policy "profesional_ve_reportes_de_sus_pacientes"
on reportes_resultados for all
using (exists (select 1 from pacientes p where p.id = reportes_resultados.paciente_id and p.profesional_id = auth.uid()))
with check (exists (select 1 from pacientes p where p.id = reportes_resultados.paciente_id and p.profesional_id = auth.uid()));
