-- Güvenlik: profiles.role istemciden yükseltilemez hale getirilir.
-- 1) Eksik süper admin profili oluşturulur (eski kod bu profili istemcide uyduruyordu).
-- 2) is_admin() e-posta karşılaştırması yerine profiles.role'e bakar.
-- 3) BEFORE INSERT/UPDATE trigger'ı, admin olmayan API kullanıcılarının
--    role kolonunu değiştirmesini engeller (RLS politikaları role kolonunu kısıtlayamadığı için).

begin;

-- 1) Süper admin profili (id: auth.users'taki sagliktruizmi34@gmail.com)
insert into public.profiles (id, email, full_name, role)
values ('00fcb1d6-3646-4333-bbaf-9f4fb27324ca', 'sagliktruizmi34@gmail.com', 'Super Admin', 'super_admin')
on conflict (id) do update set role = 'super_admin';

-- 2) is_admin artık role tabanlı; SECURITY DEFINER olduğu için RLS'e takılmaz
create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = user_id and role in ('admin', 'super_admin')
  );
$$;

-- 3) role kolonu koruması: API rolleri (authenticated/anon) admin değilse
--    insert'te role 'user'a sabitlenir, update'te eski değer korunur.
--    service_role ve SQL editor (postgres) etkilenmez.
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
as $$
begin
  if current_user not in ('authenticated', 'anon') then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.role is distinct from 'user' and not public.is_admin(auth.uid()) then
      new.role := 'user';
    end if;
  else
    if new.role is distinct from old.role and not public.is_admin(auth.uid()) then
      new.role := old.role;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists protect_profile_role on public.profiles;
create trigger protect_profile_role
  before insert or update on public.profiles
  for each row execute function public.protect_profile_role();

commit;
