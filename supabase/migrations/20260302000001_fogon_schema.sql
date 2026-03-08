-- Households
create table public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text unique not null default upper(encode(gen_random_bytes(6), 'hex')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

-- Members
create table public.household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  display_name text not null,
  avatar_color text not null default '#8B5CF6',
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz default now(),
  unique(household_id, user_id)
);

-- Shopping items
create table public.shopping_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households(id) on delete cascade not null,
  name text not null,
  quantity text,
  category text not null default 'otros',
  is_done boolean not null default false,
  done_by uuid references auth.users(id) on delete set null,
  done_at timestamptz,
  added_by uuid references auth.users(id) on delete set null not null,
  created_at timestamptz default now()
);

-- Pantry items
create table public.pantry_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households(id) on delete cascade not null,
  name text not null,
  quantity text,
  category text not null default 'otros',
  stock_level text not null default 'ok' check (stock_level in ('ok', 'low', 'empty')),
  added_by uuid references auth.users(id) on delete set null not null,
  updated_at timestamptz default now()
);

-- Recipes
create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households(id) on delete cascade,
  title text not null,
  description text,
  prep_time_minutes integer,
  image_url text,
  is_public boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

-- Recipe ingredients
create table public.recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid references public.recipes(id) on delete cascade not null,
  name text not null,
  quantity text,
  unit text,
  position integer not null default 0
);

-- Recipe steps
create table public.recipe_steps (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid references public.recipes(id) on delete cascade not null,
  step_number integer not null,
  description text not null
);

-- Meal plan entries
create table public.meal_plan_entries (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households(id) on delete cascade not null,
  week_start date not null,
  day_of_week integer not null check (day_of_week between 0 and 6),
  slot text not null check (slot in ('lunch', 'dinner')),
  recipe_id uuid references public.recipes(id) on delete set null,
  custom_text text,
  created_by uuid references auth.users(id) on delete set null not null,
  created_at timestamptz default now(),
  unique(household_id, week_start, day_of_week, slot)
);

-- NO RLS -- NestJS API handles all authorization via guards
