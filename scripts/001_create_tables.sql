-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create users table (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  role text not null check (role in ('student', 'teacher')),
  is_active boolean default true,
  classroom text check (classroom in ('A', 'B', 'C', 'D', 'E')),
  year integer check (year in (6, 7, 8, 9)),
  profile_picture_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create courses table
create table if not exists public.courses (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  teacher text not null,
  teacher_id uuid references public.profiles(id) on delete cascade,
  icon text not null,
  image_url text not null,
  status text default 'active',
  progress integer default 0,
  classrooms text[] default '{}',
  years integer[] default '{}',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create course modules table
create table if not exists public.course_modules (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid references public.courses(id) on delete cascade,
  title text not null,
  illustration_url text not null,
  classrooms text[] default '{}',
  years integer[] default '{}',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create study material categories table
create table if not exists public.study_material_categories (
  id uuid primary key default uuid_generate_v4(),
  module_id uuid references public.course_modules(id) on delete cascade,
  title text not null,
  illustration_url text not null,
  classrooms text[] default '{}',
  years integer[] default '{}',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create study materials table
create table if not exists public.study_materials (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid references public.study_material_categories(id) on delete cascade,
  title text not null,
  type text not null check (type in ('file', 'link')),
  content text not null,
  file_name text,
  file_type text,
  classrooms text[] default '{}',
  years integer[] default '{}',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create calendar events table
create table if not exists public.calendar_events (
  id uuid primary key default uuid_generate_v4(),
  date date not null,
  title text not null,
  description text,
  course text not null,
  color text not null check (color in ('blue', 'green', 'purple', 'red', 'yellow', 'pink')),
  classrooms text[] default '{}',
  years integer[] default '{}',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create notifications table
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  message text not null,
  timestamp timestamp with time zone default now(),
  read boolean default false,
  created_at timestamp with time zone default now()
);

-- Create sidebar links table
create table if not exists public.sidebar_links (
  id uuid primary key default uuid_generate_v4(),
  text text not null,
  url text not null,
  classrooms text[] default '{}',
  years integer[] default '{}',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.course_modules enable row level security;
alter table public.study_material_categories enable row level security;
alter table public.study_materials enable row level security;
alter table public.calendar_events enable row level security;
alter table public.notifications enable row level security;
alter table public.sidebar_links enable row level security;
