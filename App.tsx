"use client"

import type React from "react"
import { useState, useMemo, useEffect } from "react"
import type {
  Course,
  User,
  StoredUser,
  CourseModule,
  StudyMaterialCategory,
  StudyMaterial,
  SidebarLink,
  CalendarEvent,
  Classroom,
  SchoolYear,
} from "./types"
import CourseCard from "./components/CourseCard"
import CourseDetail from "./components/CourseDetail"
import Header from "./components/Header"
import Sidebar from "./components/Sidebar"
import FullCalendarView from "./components/FullCalendarView"
import UserManagement from "./components/UserManagement"
import CourseFormModal from "./components/modals/CourseFormModal"
import ModuleFormModal from "./components/modals/ModuleFormModal"
import CategoryFormModal from "./components/modals/CategoryFormModal"
import MaterialFormModal from "./components/modals/MaterialFormModal"
import SidebarLinkFormModal from "./components/modals/SidebarLinkFormModal"
import EventFormModal from "./components/modals/EventFormModal"
import ProfileModal from "./components/modals/ProfileModal"
import SimulationBanner from "./components/SimulationBanner"
import FilePreviewModal from "./components/modals/FilePreviewModal"
import SimulationSetupModal from "./components/modals/SimulationSetupModal"
import Footer from "./components/Footer"
import { useLanguage } from "./languageContext"
import {
  getUsers,
  updateUser as updateUserDb,
  deleteUser as deleteUserDb,
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getLinks,
  createLink,
  updateLink,
  deleteLink,
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "./lib/supabase/queries"
import { useAuth } from "./hooks/use-auth"
import { generateId } from "./utils/auth"
import { PlusIcon } from "./components/icons"

const isItemVisibleToStudent = (
  item: { classrooms?: Classroom[]; years?: SchoolYear[] },
  student: User | null,
): boolean => {
  if (!student || student.role !== "student") return true // always visible to teachers or if no user

  const isClassroomVisible =
    !item.classrooms || item.classrooms.length === 0 || item.classrooms.includes(student.classroom)
  const isYearVisible = !item.years || item.years.length === 0 || item.years.includes(student.year)

  return isClassroomVisible && isYearVisible
}

const App: React.FC = () => {
  const { user: currentUser, loading: authLoading, signOut } = useAuth()
  const [users, setUsers] = useState<StoredUser[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [sidebarLinks, setSidebarLinks] = useState<SidebarLink[]>([])
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [isCalendarVisible, setIsCalendarVisible] = useState(false)
  const [isUserManagementVisible, setIsUserManagementVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [simulationContext, setSimulationContext] = useState<{ year: SchoolYear; classroom: Classroom } | null>(null)

  // Modal states
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false)

  const [editingModule, setEditingModule] = useState<CourseModule | null>(null)
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false)

  const [editingCategory, setEditingCategory] = useState<StudyMaterialCategory | null>(null)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)

  const [editingMaterial, setEditingMaterial] = useState<StudyMaterial | null>(null)
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false)

  const [isSidebarLinkModalOpen, setIsSidebarLinkModalOpen] = useState(false)
  const [editingSidebarLink, setEditingSidebarLink] = useState<SidebarLink | null>(null)

  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [selectedDateForEvent, setSelectedDateForEvent] = useState<Date | null>(null)

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [viewingMaterial, setViewingMaterial] = useState<StudyMaterial | null>(null)
  const [isSimulationModalOpen, setIsSimulationModalOpen] = useState(false)

  const [parentId, setParentId] = useState<string | null>(null) // For creating nested content

  const { t } = useLanguage()

  useEffect(() => {
    if (!currentUser) return

    async function loadData() {
      try {
        const [allUsers, allCourses, allLinks, allEvents] = await Promise.all([
          getUsers(),
          getCourses(),
          getLinks(),
          getEvents(),
        ])

        setUsers(allUsers)
        setCourses(allCourses)
        setSidebarLinks(allLinks)
        setCalendarEvents(allEvents)
      } catch (error) {
        console.error("Error loading data:", error)
      }
    }

    loadData()
  }, [currentUser])

  const isTeacherView = !simulationContext && currentUser?.role === "teacher"

  const viewingUser = useMemo(() => {
    if (simulationContext && currentUser) {
      return {
        ...currentUser,
        role: "student",
        year: simulationContext.year,
        classroom: simulationContext.classroom,
      } as User
    }
    return currentUser
  }, [currentUser, simulationContext])

  const updateUsers = async (updatedUsers: StoredUser[]) => {
    setUsers(updatedUsers)
    // Updates are handled individually in handleUpdateUser
  }

  const updateCourses = (updatedCourses: Course[]) => {
    setCourses(updatedCourses)
    // Updates are handled individually in course handlers
  }

  const updateLinks = (updatedLinks: SidebarLink[]) => {
    setSidebarLinks(updatedLinks)
    // Updates are handled individually in link handlers
  }

  const updateEventsState = (updatedEvents: CalendarEvent[]) => {
    setCalendarEvents(updatedEvents)
    // Updates are handled individually in event handlers
  }

  // --- Auth Handlers ---
  const handleLogout = async () => {
    await signOut()
    setSimulationContext(null)
    setSelectedCourse(null)
  }

  // --- Profile Update Handler ---
  const handleSaveProfile = async (
    updatedData: Partial<User>,
    passwordData?: { current: string; new: string },
  ): Promise<void> => {
    if (!currentUser) throw new Error("No user logged in")

    try {
      await updateUserDb({ id: currentUser.id, ...updatedData })

      // Handle password change through Supabase Auth
      if (passwordData && passwordData.new) {
        const { createBrowserClient } = await import("./lib/supabase/client")
        const supabase = createBrowserClient()
        const { error } = await supabase.auth.updateUser({
          password: passwordData.new,
        })
        if (error) throw error
      }

      // Reload users
      const allUsers = await getUsers()
      setUsers(allUsers)
    } catch (error: any) {
      throw new Error(error.message || "Failed to update profile")
    }
  }

  // --- User Management Handlers ---
  const handleUpdateUser = async (updatedUser: StoredUser) => {
    try {
      await updateUserDb(updatedUser)
      const allUsers = await getUsers()
      setUsers(allUsers)
    } catch (error) {
      console.error("Error updating user:", error)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUserDb(userId)
      const allUsers = await getUsers()
      setUsers(allUsers)
    } catch (error) {
      console.error("Error deleting user:", error)
    }
  }

  // --- Course CRUD Handlers ---
  const handleSaveCourse = async (
    courseData: Omit<Course, "id" | "teacher" | "teacherId" | "content" | "status" | "progress"> & {
      classrooms?: Classroom[]
      years?: SchoolYear[]
    },
  ) => {
    if (!currentUser) return

    try {
      if (editingCourse) {
        // Update
        await updateCourse(editingCourse.id, courseData)
      } else {
        // Create
        const newCourse: Omit<Course, "id"> = {
          ...courseData,
          teacher: currentUser.name,
          teacherId: currentUser.id,
          content: [],
          status: t("notStartedYet"),
          progress: 0,
          classrooms: courseData.classrooms || [],
          years: courseData.years || [],
        }
        await createCourse(newCourse)
      }

      // Reload courses
      const allCourses = await getCourses()
      setCourses(allCourses)
      setIsCourseModalOpen(false)
      setEditingCourse(null)
    } catch (error) {
      console.error("Error saving course:", error)
    }
  }

  const handleDeleteCourse = async (course: Course) => {
    if (window.confirm(t("confirmDeleteCourseMessage"))) {
      try {
        await deleteCourse(course.id)
        const allCourses = await getCourses()
        setCourses(allCourses)
      } catch (error) {
        console.error("Error deleting course:", error)
      }
    }
  }

  // --- Course Content CRUD Handlers (Immutable Updates) ---
  const handleSaveModule = async (moduleData: Omit<CourseModule, "id" | "categories">) => {
    if (!selectedCourse) return

    try {
      const course = courses.find((c) => c.id === selectedCourse.id)
      if (!course) return

      let newContent
      if (editingModule) {
        // Update
        newContent = course.content.map((m) => (m.id === editingModule.id ? { ...m, ...moduleData } : m))
      } else {
        // Create
        const newModule: CourseModule = {
          ...moduleData,
          id: generateId(),
          categories: [],
          classrooms: moduleData.classrooms || [],
          years: moduleData.years || [],
        }
        newContent = [...course.content, newModule]
      }

      await updateCourse(course.id, { content: newContent })

      // Reload courses
      const allCourses = await getCourses()
      setCourses(allCourses)
      const updatedCourse = allCourses.find((c) => c.id === selectedCourse.id)
      if (updatedCourse) setSelectedCourse(updatedCourse)

      setIsModuleModalOpen(false)
      setEditingModule(null)
    } catch (error) {
      console.error("Error saving module:", error)
    }
  }

  const handleDeleteModule = async (moduleId: string) => {
    if (!selectedCourse) return

    try {
      const course = courses.find((c) => c.id === selectedCourse.id)
      if (!course) return

      const newContent = course.content.filter((m) => m.id !== moduleId)
      await updateCourse(course.id, { content: newContent })

      // Reload courses
      const allCourses = await getCourses()
      setCourses(allCourses)
      const updatedCourse = allCourses.find((c) => c.id === selectedCourse.id)
      if (updatedCourse) setSelectedCourse(updatedCourse)
    } catch (error) {
      console.error("Error deleting module:", error)
    }
  }

  const handleSaveCategory = async (categoryData: Omit<StudyMaterialCategory, "id" | "materials">) => {
    if (!selectedCourse || !parentId) return

    try {
      const course = courses.find((c) => c.id === selectedCourse.id)
      if (!course) return

      const newContent = course.content.map((module) => {
        if (module.id !== parentId) return module

        let newCategories
        if (editingCategory) {
          // Update
          newCategories = module.categories.map((cat) =>
            cat.id === editingCategory.id ? { ...cat, ...categoryData } : cat,
          )
        } else {
          // Create
          const newCategory: StudyMaterialCategory = {
            ...categoryData,
            id: generateId(),
            materials: [],
            classrooms: categoryData.classrooms || [],
            years: categoryData.years || [],
          }
          newCategories = [...module.categories, newCategory]
        }
        return { ...module, categories: newCategories }
      })

      await updateCourse(course.id, { content: newContent })

      // Reload courses
      const allCourses = await getCourses()
      setCourses(allCourses)
      const updatedCourse = allCourses.find((c) => c.id === selectedCourse.id)
      if (updatedCourse) setSelectedCourse(updatedCourse)

      setIsCategoryModalOpen(false)
      setEditingCategory(null)
      setParentId(null)
    } catch (error) {
      console.error("Error saving category:", error)
    }
  }

  const handleDeleteCategory = async (moduleId: string, categoryId: string) => {
    if (!selectedCourse) return

    try {
      const course = courses.find((c) => c.id === selectedCourse.id)
      if (!course) return

      const newContent = course.content.map((module) => {
        if (module.id !== moduleId) return module
        const newCategories = module.categories.filter((cat) => cat.id !== categoryId)
        return { ...module, categories: newCategories }
      })

      await updateCourse(course.id, { content: newContent })

      // Reload courses
      const allCourses = await getCourses()
      setCourses(allCourses)
      const updatedCourse = allCourses.find((c) => c.id === selectedCourse.id)
      if (updatedCourse) setSelectedCourse(updatedCourse)
    } catch (error) {
      console.error("Error deleting category:", error)
    }
  }

  const handleSaveMaterial = async (materialData: Omit<StudyMaterial, "id"> & { id?: string }): Promise<void> => {
    if (!selectedCourse || !parentId) {
      throw new Error("Course or parent not selected")
    }

    try {
      const course = courses.find((c) => c.id === selectedCourse.id)
      if (!course) throw new Error("Course not found")

      const newContent = course.content.map((module) => {
        const newCategories = module.categories.map((category) => {
          if (category.id !== parentId) return category

          let newMaterials
          if (editingMaterial) {
            // Update
            newMaterials = category.materials.map((mat) =>
              mat.id === editingMaterial.id ? { ...mat, ...materialData } : mat,
            )
          } else {
            // Create
            const { id, ...restOfData } = materialData
            const newMaterial: StudyMaterial = {
              ...(restOfData as Omit<StudyMaterial, "id">),
              id: generateId(),
              classrooms: materialData.classrooms || [],
              years: materialData.years || [],
            }
            newMaterials = [...(category.materials || []), newMaterial]
          }
          return { ...category, materials: newMaterials }
        })
        return { ...module, categories: newCategories }
      })

      await updateCourse(course.id, { content: newContent })

      // Reload courses
      const allCourses = await getCourses()
      setCourses(allCourses)
      const updatedCourse = allCourses.find((c) => c.id === selectedCourse.id)
      if (updatedCourse) setSelectedCourse(updatedCourse)
    } catch (error) {
      throw error
    }
  }

  const handleDeleteMaterial = async (categoryId: string, materialId: string) => {
    if (!selectedCourse) return

    try {
      const course = courses.find((c) => c.id === selectedCourse.id)
      if (!course) return

      const newContent = course.content.map((module) => {
        const newCategories = module.categories.map((category) => {
          if (category.id !== categoryId) return category
          const newMaterials = category.materials.filter((mat) => mat.id !== materialId)
          return { ...category, materials: newMaterials }
        })
        return { ...module, categories: newCategories }
      })

      await updateCourse(course.id, { content: newContent })

      // Reload courses
      const allCourses = await getCourses()
      setCourses(allCourses)
      const updatedCourse = allCourses.find((c) => c.id === selectedCourse.id)
      if (updatedCourse) setSelectedCourse(updatedCourse)
    } catch (error) {
      console.error("Error deleting material:", error)
    }
  }

  // --- Sidebar Link Handlers ---
  const handleSaveSidebarLink = async (linkData: Omit<SidebarLink, "id">) => {
    try {
      if (editingSidebarLink) {
        // Update
        await updateLink(editingSidebarLink.id, linkData)
      } else {
        // Create
        await createLink(linkData)
      }

      // Reload links
      const allLinks = await getLinks()
      setSidebarLinks(allLinks)
      setIsSidebarLinkModalOpen(false)
      setEditingSidebarLink(null)
    } catch (error) {
      console.error("Error saving link:", error)
    }
  }

  const handleDeleteSidebarLink = async (linkId: string) => {
    try {
      await deleteLink(linkId)
      const allLinks = await getLinks()
      setSidebarLinks(allLinks)
    } catch (error) {
      console.error("Error deleting link:", error)
    }
  }

  // --- Calendar Event Handlers ---
  const handleSaveEvent = async (eventData: Omit<CalendarEvent, "id">) => {
    try {
      if (editingEvent) {
        // Update
        await updateEvent(editingEvent.id, eventData)
      } else {
        // Create
        await createEvent(eventData)
      }

      // Reload events
      const allEvents = await getEvents()
      setCalendarEvents(allEvents)
      setIsEventModalOpen(false)
      setEditingEvent(null)
      setSelectedDateForEvent(null)
    } catch (error) {
      console.error("Error saving event:", error)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm(t("confirmDeleteEvent"))) {
      try {
        await deleteEvent(eventId)
        const allEvents = await getEvents()
        setCalendarEvents(allEvents)
      } catch (error) {
        console.error("Error deleting event:", error)
      }
    }
  }

  const handleEndSimulation = () => {
    setSimulationContext(null)
  }

  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course)
  }

  const handleBackToDashboard = () => {
    setSelectedCourse(null)
  }

  const handleStartSimulation = (year: SchoolYear, classroom: Classroom) => {
    setSimulationContext({ year, classroom })
  }

  const filteredCourses = useMemo(() => {
    const baseCourses =
      currentUser?.role === "teacher" && !simulationContext
        ? courses.filter((c) => c.teacherId === currentUser.id)
        : courses.filter((course) => isItemVisibleToStudent(course, viewingUser))

    if (!searchQuery) return baseCourses

    return baseCourses.filter((course) => course.title.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [searchQuery, courses, currentUser, simulationContext, viewingUser])

  const visibleSidebarLinks = useMemo(
    () => sidebarLinks.filter((link) => isItemVisibleToStudent(link, viewingUser)),
    [sidebarLinks, viewingUser],
  )
  const visibleCalendarEvents = useMemo(
    () => calendarEvents.filter((event) => isItemVisibleToStudent(event, viewingUser)),
    [calendarEvents, viewingUser],
  )

  if (authLoading) {
    return (
      <div className="min-h-screen font-sans text-white flex items-center justify-center">
        <div className="text-xl">Carregando...</div>
      </div>
    )
  }

  if (!currentUser) {
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login"
    }
    return null
  }

  const getDashboardTitle = () => {
    if (simulationContext) return t("studentDashboardSimulation")
    if (currentUser.role === "teacher") return t("teacherDashboard")
    return t("myCoursesAsStudent")
  }

  return (
    <div className="min-h-screen font-sans text-white flex flex-col">
      {simulationContext && <SimulationBanner onExit={handleEndSimulation} simulationContext={simulationContext} />}
      <Header
        user={currentUser}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onLogout={handleLogout}
        onShowUserManagement={() => setIsUserManagementVisible(true)}
        onShowProfile={() => setIsProfileModalOpen(true)}
        isTeacherView={isTeacherView}
        onOpenSimulationModal={() => setIsSimulationModalOpen(true)}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex-grow">
        {!selectedCourse ? (
          <div className="flex flex-col lg:flex-row gap-8">
            <main className="flex-1 py-4 sm:py-6 lg:py-8">
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-white text-left">{getDashboardTitle()}</h1>
                {isTeacherView && (
                  <button
                    onClick={() => setIsCourseModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <PlusIcon className="w-5 h-5" />
                    {t("createCourse")}
                  </button>
                )}
              </div>

              {filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredCourses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      onClick={handleSelectCourse}
                      isTeacherOwner={isTeacherView && course.teacherId === currentUser.id}
                      onEdit={() => {
                        setEditingCourse(course)
                        setIsCourseModalOpen(true)
                      }}
                      onDelete={handleDeleteCourse}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white/5 rounded-2xl">
                  <p className="text-gray-300">
                    {currentUser.role === "teacher" ? t("noCoursesCreated") : "No courses available."}
                  </p>
                </div>
              )}
            </main>
            <div className="flex-shrink-0 py-4 sm:py-6 lg:py-8 w-full lg:w-72">
              <Sidebar
                onShowCalendar={() => setIsCalendarVisible(true)}
                links={visibleSidebarLinks}
                isTeacher={isTeacherView}
                onAddLink={() => {
                  setEditingSidebarLink(null)
                  setIsSidebarLinkModalOpen(true)
                }}
                onEditLink={(link) => {
                  setEditingSidebarLink(link)
                  setIsSidebarLinkModalOpen(true)
                }}
                onDeleteLink={handleDeleteSidebarLink}
                calendarEvents={visibleCalendarEvents}
              />
            </div>
          </div>
        ) : (
          <main className="py-4 sm:py-6 lg:py-8">
            <CourseDetail
              course={selectedCourse}
              onBack={handleBackToDashboard}
              isTeacherOwner={isTeacherView && selectedCourse.teacherId === currentUser.id}
              onAddModule={() => setIsModuleModalOpen(true)}
              onEditModule={(module) => {
                setEditingModule(module)
                setIsModuleModalOpen(true)
              }}
              onDeleteModule={handleDeleteModule}
              onAddCategory={(moduleId) => {
                setParentId(moduleId)
                setIsCategoryModalOpen(true)
              }}
              onEditCategory={(moduleId, category) => {
                setParentId(moduleId)
                setEditingCategory(category)
                setIsCategoryModalOpen(true)
              }}
              onDeleteCategory={handleDeleteCategory}
              onAddMaterial={(categoryId) => {
                setParentId(categoryId)
                setIsMaterialModalOpen(true)
              }}
              onEditMaterial={(categoryId, material) => {
                setParentId(categoryId)
                setEditingMaterial(material)
                setIsMaterialModalOpen(true)
              }}
              onDeleteMaterial={handleDeleteMaterial}
              onViewMaterial={(material) => setViewingMaterial(material)}
            />
          </main>
        )}
      </div>

      {/* Modals */}
      {viewingMaterial && <FilePreviewModal material={viewingMaterial} onClose={() => setViewingMaterial(null)} />}
      {isCalendarVisible && (
        <FullCalendarView
          onClose={() => setIsCalendarVisible(false)}
          events={visibleCalendarEvents}
          isTeacher={isTeacherView}
          courses={courses}
          onAddEvent={(date) => {
            setSelectedDateForEvent(date)
            setEditingEvent(null)
            setIsEventModalOpen(true)
          }}
          onEditEvent={(event) => {
            setEditingEvent(event)
            setSelectedDateForEvent(null)
            setIsEventModalOpen(true)
          }}
          onDeleteEvent={handleDeleteEvent}
        />
      )}
      {isUserManagementVisible && (
        <UserManagement
          users={users}
          currentUser={currentUser}
          onUpdateUser={handleUpdateUser}
          onDeleteUser={handleDeleteUser}
          onClose={() => setIsUserManagementVisible(false)}
        />
      )}

      {isCourseModalOpen && (
        <CourseFormModal
          isOpen={isCourseModalOpen}
          onClose={() => {
            setIsCourseModalOpen(false)
            setEditingCourse(null)
          }}
          onSave={handleSaveCourse}
          courseToEdit={editingCourse}
        />
      )}
      {isModuleModalOpen && (
        <ModuleFormModal
          isOpen={isModuleModalOpen}
          onClose={() => {
            setIsModuleModalOpen(false)
            setEditingModule(null)
          }}
          onSave={handleSaveModule}
          moduleToEdit={editingModule}
        />
      )}
      {isCategoryModalOpen && (
        <CategoryFormModal
          isOpen={isCategoryModalOpen}
          onClose={() => {
            setIsCategoryModalOpen(false)
            setEditingCategory(null)
            setParentId(null)
          }}
          onSave={handleSaveCategory}
          categoryToEdit={editingCategory}
        />
      )}
      {isMaterialModalOpen && (
        <MaterialFormModal
          isOpen={isMaterialModalOpen}
          onClose={() => {
            setIsMaterialModalOpen(false)
            setEditingMaterial(null)
            setParentId(null)
          }}
          onSave={async (data) => {
            try {
              await handleSaveMaterial(data)
              setIsMaterialModalOpen(false)
              setEditingMaterial(null)
              setParentId(null)
            } catch (e) {
              // error is handled inside the modal
            }
          }}
          materialToEdit={editingMaterial}
        />
      )}
      {isSidebarLinkModalOpen && (
        <SidebarLinkFormModal
          isOpen={isSidebarLinkModalOpen}
          onClose={() => {
            setIsSidebarLinkModalOpen(false)
            setEditingSidebarLink(null)
          }}
          onSave={handleSaveSidebarLink}
          linkToEdit={editingSidebarLink}
        />
      )}
      {isEventModalOpen && (
        <EventFormModal
          isOpen={isEventModalOpen}
          onClose={() => {
            setIsEventModalOpen(false)
            setEditingEvent(null)
            setSelectedDateForEvent(null)
          }}
          onSave={handleSaveEvent}
          eventToEdit={editingEvent}
          selectedDate={selectedDateForEvent}
          courses={courses}
        />
      )}
      {isProfileModalOpen && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          currentUser={currentUser}
          onSave={handleSaveProfile}
        />
      )}
      {isSimulationModalOpen && (
        <SimulationSetupModal
          isOpen={isSimulationModalOpen}
          onClose={() => setIsSimulationModalOpen(false)}
          onStart={handleStartSimulation}
        />
      )}
      <Footer />
    </div>
  )
}

export default App
