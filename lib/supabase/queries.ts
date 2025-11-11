import { createBrowserClient } from "./client"
import type {
  Course,
  StoredUser,
  SidebarLink,
  CalendarEvent,
  Notification,
  CourseModule,
  StudyMaterialCategory,
  StudyMaterial,
} from "@/types"

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

// Notification queries
export async function getNotifications(userId: string): Promise<Notification[]> {
  const supabase = createBrowserClient()
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("timestamp", { ascending: false })

  if (error) {
    console.error("Error fetching notifications:", error)
    return []
  }

  return data.map((notification) => ({
    id: notification.id,
    message: notification.message,
    timestamp: notification.timestamp,
    read: notification.read,
  }))
}

export async function markNotificationAsRead(notificationId: string) {
  const supabase = createBrowserClient()
  const { error } = await supabase.from("notifications").update({ read: true }).eq("id", notificationId)

  if (error) throw error
}

export async function markAllNotificationsAsRead(userId: string) {
  const supabase = createBrowserClient()
  const { error } = await supabase.from("notifications").update({ read: true }).eq("user_id", userId).eq("read", false)

  if (error) throw error
}

// Course Module queries
export async function getModulesByCourse(courseId: string): Promise<CourseModule[]> {
  const supabase = createBrowserClient()
  const { data, error } = await supabase
    .from("course_modules")
    .select("*")
    .eq("course_id", courseId)
    .order("created_at")

  if (error) {
    console.error("Error fetching modules:", error)
    return []
  }

  return data
}

export async function createModule(module: {
  courseId: string
  title: string
  illustrationUrl: string
  classrooms?: string[]
  years?: number[]
}) {
  const supabase = createBrowserClient()
  const { error } = await supabase.from("course_modules").insert({
    course_id: module.courseId,
    title: module.title,
    illustration_url: module.illustrationUrl,
    classrooms: module.classrooms,
    years: module.years,
  })

  if (error) throw error
}

// Study Material Category queries
export async function getCategoriesByModule(moduleId: string): Promise<StudyMaterialCategory[]> {
  const supabase = createBrowserClient()
  const { data, error } = await supabase
    .from("study_material_categories")
    .select("*")
    .eq("module_id", moduleId)
    .order("created_at")

  if (error) {
    console.error("Error fetching categories:", error)
    return []
  }

  return data
}

export async function createCategory(category: {
  moduleId: string
  title: string
  illustrationUrl: string
  classrooms?: string[]
  years?: number[]
}) {
  const supabase = createBrowserClient()
  const { error } = await supabase.from("study_material_categories").insert({
    module_id: category.moduleId,
    title: category.title,
    illustration_url: category.illustrationUrl,
    classrooms: category.classrooms,
    years: category.years,
  })

  if (error) throw error
}

// Study Material queries
export async function getMaterialsByCategory(categoryId: string): Promise<StudyMaterial[]> {
  const supabase = createBrowserClient()
  const { data, error } = await supabase
    .from("study_materials")
    .select("*")
    .eq("category_id", categoryId)
    .order("created_at")

  if (error) {
    console.error("Error fetching materials:", error)
    return []
  }

  return data.map((material) => ({
    id: material.id,
    title: material.title,
    type: material.type,
    content: material.content,
    fileName: material.file_name,
    fileType: material.file_type,
    classrooms: material.classrooms || [],
    years: material.years || [],
  }))
}

export async function createMaterial(material: {
  categoryId: string
  title: string
  type: "file" | "link"
  content: string
  fileName?: string
  fileType?: string
  classrooms?: string[]
  years?: number[]
}) {
  const supabase = createBrowserClient()
  const { error } = await supabase.from("study_materials").insert({
    category_id: material.categoryId,
    title: material.title,
    type: material.type,
    content: material.content,
    file_name: material.fileName,
    file_type: material.fileType,
    classrooms: material.classrooms,
    years: material.years,
  })

  if (error) throw error
}
