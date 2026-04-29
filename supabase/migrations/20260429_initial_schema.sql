-- Projects: folders for organizing saved content
create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  color text not null default 'oklch(0.68 0.22 285)',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Junction table: posts saved to projects
-- post_id references mock data IDs for now; will reference a posts table when real API is integrated
create table project_posts (
  project_id uuid references projects(id) on delete cascade not null,
  post_id text not null,
  saved_at timestamptz default now(),
  primary key (project_id, post_id)
);

-- Row Level Security
alter table projects enable row level security;
alter table project_posts enable row level security;

create policy "Users can view own projects"
  on projects for select using (auth.uid() = user_id);

create policy "Users can create own projects"
  on projects for insert with check (auth.uid() = user_id);

create policy "Users can update own projects"
  on projects for update using (auth.uid() = user_id);

create policy "Users can delete own projects"
  on projects for delete using (auth.uid() = user_id);

create policy "Users can view saved posts in own projects"
  on project_posts for select using (
    project_id in (select id from projects where user_id = auth.uid())
  );

create policy "Users can save posts to own projects"
  on project_posts for insert with check (
    project_id in (select id from projects where user_id = auth.uid())
  );

create policy "Users can remove saved posts from own projects"
  on project_posts for delete using (
    project_id in (select id from projects where user_id = auth.uid())
  );

-- Indexes
create index idx_projects_user_id on projects(user_id);
create index idx_project_posts_project_id on project_posts(project_id);

-- Function to auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger projects_updated_at
  before update on projects
  for each row execute function update_updated_at();
