-- Function to notify students when new content is created
create or replace function notify_students_of_new_content()
returns trigger as $$
declare
  student_record record;
  content_type text;
  content_title text;
  target_classrooms text[];
  target_years int[];
begin
  -- Determine content type and get relevant data
  if TG_TABLE_NAME = 'courses' then
    content_type := 'curso';
    content_title := NEW.title;
    target_classrooms := NEW.classrooms;
    target_years := NEW.years;
  elsif TG_TABLE_NAME = 'course_modules' then
    content_type := 'módulo';
    content_title := NEW.title;
    target_classrooms := NEW.classrooms;
    target_years := NEW.years;
  elsif TG_TABLE_NAME = 'study_materials' then
    content_type := 'material';
    content_title := NEW.title;
    target_classrooms := NEW.classrooms;
    target_years := NEW.years;
  elsif TG_TABLE_NAME = 'calendar_events' then
    content_type := 'evento';
    content_title := NEW.title;
    target_classrooms := NEW.classrooms;
    target_years := NEW.years;
  else
    return NEW;
  end if;

  -- Create notifications for matching students
  for student_record in
    select id, name, classroom, year
    from public.profiles
    where role = 'student'
      and is_active = true
      and (
        -- If no classrooms specified, notify all
        target_classrooms is null
        or array_length(target_classrooms, 1) is null
        or classroom = any(target_classrooms)
      )
      and (
        -- If no years specified, notify all
        target_years is null
        or array_length(target_years, 1) is null
        or year = any(target_years)
      )
  loop
    insert into public.notifications (user_id, message, read)
    values (
      student_record.id,
      format('Novo %s disponível: %s', content_type, content_title),
      false
    );
  end loop;

  return NEW;
end;
$$ language plpgsql security definer;

-- Create triggers for each content table
drop trigger if exists notify_students_new_course on public.courses;
create trigger notify_students_new_course
  after insert on public.courses
  for each row
  execute function notify_students_of_new_content();

drop trigger if exists notify_students_new_module on public.course_modules;
create trigger notify_students_new_module
  after insert on public.course_modules
  for each row
  execute function notify_students_of_new_content();

drop trigger if exists notify_students_new_material on public.study_materials;
create trigger notify_students_new_material
  after insert on public.study_materials
  for each row
  execute function notify_students_of_new_content();

drop trigger if exists notify_students_new_event on public.calendar_events;
create trigger notify_students_new_event
  after insert on public.calendar_events
  for each row
  execute function notify_students_of_new_content();
