-- Durable media metadata for embedded posts.
-- TikTok CDN thumbnail URLs are signed and expire, so thumbnails are cached in
-- Supabase Storage and the official TikTok player URL is stored separately.

alter table posts
  add column if not exists external_id text,
  add column if not exists embed_url text,
  add column if not exists thumbnail_storage_path text,
  add column if not exists thumbnail_refreshed_at timestamptz,
  add column if not exists oembed jsonb;

update posts
set external_id = split_part(id, ':', 2)
where platform = 'tiktok'
  and external_id is null
  and id like 'tiktok:%';

update posts
set embed_url = 'https://www.tiktok.com/player/v1/' || external_id || '?controls=1&description=0&music_info=0'
where platform = 'tiktok'
  and external_id is not null
  and embed_url is null;

create index if not exists idx_posts_platform_external_id
  on posts(platform, external_id);

insert into storage.buckets
  (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'post-thumbnails',
    'post-thumbnails',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
  )
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Post thumbnails are publicly readable'
  ) then
    execute 'create policy "Post thumbnails are publicly readable" on storage.objects for select to public using (bucket_id = ''post-thumbnails'')';
  end if;
end $$;
