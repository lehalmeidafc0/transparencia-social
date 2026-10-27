-- Transparência Social: configuração do banco de dados no Supabase
-- Cole este script em Supabase > SQL Editor > New query e clique em Run.

-- 1. Tabela com os documentos enviados pelas ONGs
create table if not exists public.documentos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  ong text not null check (char_length(ong) between 2 and 120),
  categoria text not null check (categoria in ('inst','termos','balancos','rel')),
  titulo text not null check (char_length(titulo) between 2 and 120),
  descricao text check (descricao is null or char_length(descricao) <= 160),
  link text check (link is null or link ~ '^https://'),
  arquivo_path text,
  confirmado boolean not null default false,
  check (link is not null or arquivo_path is not null)
);

alter table public.documentos enable row level security;

-- Qualquer visitante pode ver os documentos publicados
drop policy if exists "leitura publica" on public.documentos;
create policy "leitura publica" on public.documentos
  for select to anon, authenticated using (true);

-- Qualquer visitante pode enviar um documento, desde que confirme
-- que retirou as informações sensíveis
drop policy if exists "envio publico" on public.documentos;
create policy "envio publico" on public.documentos
  for insert to anon, authenticated with check (confirmado = true);

-- 2. Pasta de arquivos (PDF, JPG e PNG de até 5 MB)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('documentos', 'documentos', true, 5242880, array['application/pdf','image/jpeg','image/png'])
on conflict (id) do update
  set public = true, file_size_limit = 5242880,
      allowed_mime_types = array['application/pdf','image/jpeg','image/png'];

drop policy if exists "upload publico" on storage.objects;
create policy "upload publico" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'documentos' and lower(storage.extension(name)) in ('pdf','jpg','jpeg','png'));

-- Para apagar um documento publicado por engano:
-- Table Editor > documentos > selecione a linha > Delete
-- e, se houver arquivo, Storage > documentos > apague o arquivo.
