import { createBrowserClient } from "./client"
import type { Course, StoredUser, SidebarLink, CalendarEvent } from "@/types"

// User queries
export async function getUsers(): Promise<StoredUser[]> {
  const supabase = createBrowserClient()
  const { data, error } = await supabase.from("profiles").select("*").order("name")

  if (error) {
    console.error("Error fetching users:", error)
    return []
  }

  return data.map((profile) => ({
    id: profile.id,
    name: profile.name,
    email: profile.email,
    passwordHash: "", // Not needed on client side
    role: profile.role,
    isActive: profile.is_active,
    year: profile.year,
    classroom: profile.classroom,
  }))
}

export async function updateUser(user: Partial<StoredUser> & { id: string }) {
  const supabase = createBrowserClient()
  const { error } = await supabase
    .from("profiles")
    .update({
      name: user.name,
      email: user.email,
      role: user.role,
      is_active: user.isActive,
      year: user.year,
      classroom: user.classroom,
    })
    .eq("id", user.id)

  if (error) throw error
}

export async function deleteUser(userId: string) {
  const supabase = createBrowserClient()
  const { error } = await supabase.from("profiles").delete().eq("id", userId)

  if (error) throw error
}

// Course queries
export async function getCourses(): Promise<Course[]> {
  const supabase = createBrowserClient()
  const { data, error } = await supabase.from("courses").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching courses:", error)
    return []
  }

  return data.map((course) => ({
    id: course.id,
    title: course.title,
    teacher: course.teacher,
    teacherId: course.teacher_id,
    icon: course.icon,
    color: course.color,
    description: course.description,
    content: course.content || [],
    status: course.status,
    progress: course.progress,
    classrooms: course.classrooms || [],
    years: course.years || [],
  }))
}

export async function createCourse(course: Omit<Course, "id">) {
  const supabase = createBrowserClient()
  const { error } = await supabase.from("courses").insert({
    title: course.title,
    teacher: course.teacher,
    teacher_id: course.teacherId,
    icon: course.icon,
    color: course.color,
    description: course.description,
    content: course.content,
    status: course.status,
    progress: course.progress,
    classrooms: course.classrooms,
    years: course.years,
  })

  if (error) throw error
}

export async function updateCourse(courseId: string, updates: Partial<Course>) {
  const supabase = createBrowserClient()
  const updateData: any = {}

  if (updates.title !== undefined) updateData.title = updates.title
  if (updates.teacher !== undefined) updateData.teacher = updates.teacher
  if (updates.teacherId !== undefined) updateData.teacher_id = updates.teacherId
  if (updates.icon !== undefined) updateData.icon = updates.icon
  if (updates.color !== undefined) updateData.color = updates.color
  if (updates.description !== undefined) updateData.description = updates.description
  if (updates.content !== undefined) updateData.content = updates.content
  if (updates.status !== undefined) updateData.status = updates.status
  if (updates.progress !== undefined) updateData.progress = updates.progress
  if (updates.classrooms !== undefined) updateData.classrooms = updates.classrooms
  if (updates.years !== undefined) updateData.years = updates.years

  const { error } = await supabase.from("courses").update(updateData).eq("id", courseId)

  if (error) throw error
}

export async function deleteCourse(courseId: string) {
  const supabase = createBrowserClient()
  const { error } = await supabase.from("courses").delete().eq("id", courseId)

  if (error) throw error
}

// Sidebar Links queries
export async function getLinks(): Promise<SidebarLink[]> {
  const supabase = createBrowserClient()
  const { data, error } = await supabase.from("sidebar_links").select("*").order("created_at")

  if (error) {
    console.error("Error fetching links:", error)
    return []
  }

  return data.map((link) => ({
    id: link.id,
    text: link.text,
    url: link.url,
    classrooms: link.classrooms || [],
    years: link.years || [],
  }))
}

export async function createLink(link: Omit<SidebarLink, "id">) {
  const supabase = createBrowserClient()
  const { error } = await supabase.from("sidebar_links").insert({
    text: link.text,
    url: link.url,
    classrooms: link.classrooms,
    years: link.years,
  })

  if (error) throw error
}

export async function updateLink(linkId: string, updates: Partial<SidebarLink>) {
  const supabase = createBrowserClient()
  const { error } = await supabase
    .from("sidebar_links")
    .update({
      text: updates.text,
      url: updates.url,
      classrooms: updates.classrooms,
      years: updates.years,
    })
    .eq("id", linkId)

  if (error) throw error
}

export async function deleteLink(linkId: string) {
  const supabase = createBrowserClient()
  const { error } = await supabase.from("sidebar_links").delete().eq("id", linkId)

  if (error) throw error
}

// Calendar Events queries
export async function getEvents(): Promise<CalendarEvent[]> {
  const supabase = createBrowserClient()
  const { data, error } = await supabase.from("calendar_events").select("*").order("date")

  if (error) {
    console.error("Error fetching events:", error)
    return []
  }

  return data.map((event) => ({
    id: event.id,
    title: event.title,
    date: event.date,
    description: event.description,
    courseId: event.course_id,
    classrooms: event.classrooms || [],
    years: event.years || [],
  }))
}

export async function createEvent(event: Omit<CalendarEvent, "id">) {
  const supabase = createBrowserClient()
  const { error } = await supabase.from("calendar_events").insert({
    title: event.title,
    date: event.date,
    description: event.description,
    course_id: event.courseId,
    classrooms: event.classrooms,
    years: event.years,
  })

  if (error) throw error
}

export async function updateEvent(eventId: string, updates: Partial<CalendarEvent>) {
  const supabase = createBrowserClient()
  const updateData: any = {}

  if (updates.title !== undefined) updateData.title = updates.title
  if (updates.date !== undefined) updateData.date = updates.date
  if (updates.description !== undefined) updateData.description = updates.description
  if (updates.courseId !== undefined) updateData.course_id = updates.courseId
  if (updates.classrooms !== undefined) updateData.classrooms = updates.classrooms
  if (updates.years !== undefined) updateData.years = updates.years

  const { error } = await supabase.from("calendar_events").update(updateData).eq("id", eventId)

  if (error) throw error
}

export async function deleteEvent(eventId: string) {
  const supabase = createBrowserClient()
  const { error } = await supabase.from("calendar_events").delete().eq("id", eventId)

  if (error) throw error
}
