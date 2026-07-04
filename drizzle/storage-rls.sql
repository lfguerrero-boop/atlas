-- Convención de rutas: fotos-posturales/{profesional_id}/{paciente_id}/{archivo}
-- Un profesional solo puede leer/escribir dentro de su propia carpeta.

drop policy if exists "profesional_accede_su_carpeta_fotos_posturales" on storage.objects;
create policy "profesional_accede_su_carpeta_fotos_posturales"
on storage.objects for all
using (
  bucket_id = 'fotos-posturales'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'fotos-posturales'
  and auth.uid()::text = (storage.foldername(name))[1]
);
