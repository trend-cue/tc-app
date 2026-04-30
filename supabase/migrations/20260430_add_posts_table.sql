-- Posts: real ingested posts from TikTok / Instagram / X.
-- Editorial fields (cluster_id, trend_score, why_trending) are filled by the
-- ingest script with sample values for now; they will become real once
-- clustering exists.

create table posts (
  id text primary key,                        -- e.g. "tiktok:7633094092330667286"
  platform text not null check (platform in ('tiktok','instagram','twitter')),
  source_url text not null unique,
  handle text not null,                       -- "@username"
  display_name text,
  content text,                               -- caption
  hashtags text[] not null default '{}',
  is_video boolean not null default true,
  thumbnail_url text,
  thumbnail_label text,
  thumbnail_accent text,
  likes int not null default 0,
  comments int not null default 0,
  shares int not null default 0,
  views int,
  posted_at timestamptz,

  cluster_id text,
  trend_score int,
  why_trending jsonb,

  ingested_at timestamptz not null default now(),
  raw jsonb
);

create index idx_posts_platform on posts(platform);
create index idx_posts_cluster_id on posts(cluster_id);
create index idx_posts_posted_at on posts(posted_at desc);

alter table posts enable row level security;

-- Sample data is shared across all signed-in users; reads are open, writes are
-- service-role only (RLS deny-by-default with no insert/update/delete policies).
create policy "Posts readable by authenticated users"
  on posts for select to authenticated using (true);

-- Tighten project_posts now that posts exists. NOT VALID so pre-existing
-- mock post_ids stay queryable; new inserts must reference real posts. Run
-- `alter table project_posts validate constraint project_posts_post_fk;`
-- once the mock rows are cleaned up.
alter table project_posts
  add constraint project_posts_post_fk
  foreign key (post_id) references posts(id) on delete cascade
  not valid;
