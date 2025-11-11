-- Profiles policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can view other profiles"
  on public.profiles for select
  using (true);

-- Courses policies
create policy "Anyone can view courses"
  on public.courses for select
  using (true);

create policy "Teachers can create courses"
  on public.courses for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'teacher'
    )
  );

create policy "Teachers can update their own courses"
  on public.courses for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'teacher'
      and courses.teacher_id = auth.uid()
    )
  );

create policy "Teachers can delete their own courses"
  on public.courses for delete
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'teacher'
      and courses.teacher_id = auth.uid()
    )
  );

-- Course modules policies
create policy "Anyone can view course modules"
  on public.course_modules for select
  using (true);

create policy "Teachers can manage course modules"
  on public.course_modules for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'teacher'
    )
  );

-- Study material categories policies
create policy "Anyone can view study material categories"
  on public.study_material_categories for select
  using (true);

create policy "Teachers can manage study material categories"
  on public.study_material_categories for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'teacher'
    )
  );

-- Study materials policies
create policy "Anyone can view study materials"
  on public.study_materials for select
  using (true);

create policy "Teachers can manage study materials"
  on public.study_materials for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'teacher'
    )
  );

-- Calendar events policies
create policy "Anyone can view calendar events"
  on public.calendar_events for select
  using (true);

create policy "Teachers can manage calendar events"
  on public.calendar_events for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'teacher'
    )
  );

-- Notifications policies
create policy "Users can view their own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can update their own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

create policy "Teachers can create notifications"
  on public.notifications for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'teacher'
    )
  );

-- Sidebar links policies
create policy "Anyone can view sidebar links"
  on public.sidebar_links for select
  using (true);

create policy "Teachers can manage sidebar links"
  on public.sidebar_links for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'teacher'
    )
  );
