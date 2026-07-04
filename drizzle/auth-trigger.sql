-- Crea automáticamente la fila en profesionales cuando alguien se registra vía Supabase Auth.
-- Espera que el registro (signUp) mande options.data = { nombre_completo, profesion }.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profesionales (id, nombre_completo, email, profesion)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombre_completo', ''),
    new.email,
    nullif(new.raw_user_meta_data->>'profesion', '')::profesion
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
