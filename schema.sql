-- Bu dosyayı Supabase > SQL Editor'a yapıştırıp çalıştırın

-- 1. Randevular tablosu
create table if not exists appointments (
  id text primary key default gen_random_uuid()::text,
  date text not null,
  time text not null,
  name text not null,
  reason text not null,
  notes text,
  created_at timestamptz default now()
);

-- 2. Haftalık uygunluk ayarları (tek satır)
create table if not exists availability (
  id int primary key default 1,
  working_days int[] default array[0,1,2,3,4,5,6],
  start_time text default '00:00',
  end_time text default '24:00',
  slot_duration int default 60,
  updated_at timestamptz default now()
);

-- Varsayılan uygunluk satırı
insert into availability (id) values (1) on conflict do nothing;

-- 3. Row Level Security
alter table appointments enable row level security;
alter table availability enable row level security;

-- Herkes randevuları ve uygunluğu okuyabilir (takvim için)
create policy "public_read_appointments" on appointments for select using (true);
create policy "public_read_availability" on availability for select using (true);

-- Herkes randevu ekleyebilir (müşteri booking)
create policy "public_insert_appointments" on appointments for insert with check (true);

-- Sadece giriş yapmış admin silebilir
create policy "admin_delete_appointments" on appointments for delete using (auth.role() = 'authenticated');

-- Sadece giriş yapmış admin uygunluğu güncelleyebilir
create policy "admin_update_availability" on availability for update using (auth.role() = 'authenticated');

-- 4. Realtime aktifleştirme (Supabase Dashboard > Database > Replication > Realtime'dan da yapılabilir)
alter publication supabase_realtime add table appointments;
alter publication supabase_realtime add table availability;
