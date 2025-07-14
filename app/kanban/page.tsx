'use client'

import { useState, useEffect } from 'react'
import { 
  DndContext, 
  DragEndEvent, 
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { Plus, Search, Filter } from 'lucide-react'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { TaskModal } from '@/components/kanban/TaskModal'

export interface Task {
  id: string
  title: string
  description: string
  status: 'todo' | 'in-progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  createdAt: Date
  updatedAt: Date
  tags: string[]
}

export interface Column {
  id: string
  title: string
  status: 'todo' | 'in-progress' | 'done'
  tasks: Task[]
}

const initialColumns: Column[] = [
  {
    id: 'todo',
    title: 'To Do',
    status: 'todo',
    tasks: [
      {
        id: 'task-initial-1',
        title: 'Design new landing page',
        description: 'Create wireframes and mockups for the new landing page',
        status: 'todo',
        priority: 'high',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['design', 'ui/ux']
      },
      {
        id: 'task-initial-2',
        title: 'Setup CI/CD pipeline',
        description: 'Configure automated testing and deployment',
        status: 'todo',
        priority: 'medium',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['devops', 'automation']
      }
    ]
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    status: 'in-progress',
    tasks: [
      {
        id: 'task-initial-3',
        title: 'Implement user authentication',
        description: 'Add login, register, and password reset functionality',
        status: 'in-progress',
        priority: 'high',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['auth', 'security']
      }
    ]
  },
  {
    id: 'done',
    title: 'Done',
    status: 'done',
    tasks: [
      {
        id: 'task-initial-4',
        title: 'Setup project structure',
        description: 'Initialize Next.js project with TypeScript and Tailwind',
        status: 'done',
        priority: 'medium',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['setup', 'foundation']
      }
    ]
  }
]

export default function KanbanPage() {
  const [columns, setColumns] = useState<Column[]>(initialColumns)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [isInitialized, setIsInitialized] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  )


  // Load data from localStorage on mount
  useEffect(() => {
    const initializeData = () => {
      try {
        const savedColumns = localStorage.getItem('kanban-columns')
        
        if (savedColumns) {
          const parsed = JSON.parse(savedColumns)
          
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Convert date strings back to Date objects and ensure unique IDs
            const loadedColumns = parsed.map((col: Column) => ({
              ...col,
              tasks: col.tasks.map((task: Task & { createdAt: string; updatedAt: string }, index: number) => ({
                ...task,
                id: task.id && !task.id.startsWith('task-') ? `task-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 5)}` : task.id,
                createdAt: new Date(task.createdAt),
                updatedAt: new Date(task.updatedAt)
              }))
            }))
            
            setColumns(loadedColumns)
            setIsInitialized(true)
            return
          }
        }
        
        // No valid saved data, use initial columns
        setColumns(initialColumns)
        setIsInitialized(true)
        
      } catch (error) {
        console.error('Error loading kanban data:', error)
        localStorage.removeItem('kanban-columns')
        setColumns(initialColumns)
        setIsInitialized(true)
      }
    }

    // Add a small delay to ensure the component is mounted
    const timer = setTimeout(initializeData, 100)
    
    // Fallback timeout to prevent infinite loading
    const fallbackTimer = setTimeout(() => {
      console.warn('Kanban initialization took too long, forcing initialization')
      setColumns(initialColumns)
      setIsInitialized(true)
    }, 2000)
    
    return () => {
      clearTimeout(timer)
      clearTimeout(fallbackTimer)
    }
  }, [])

  // Save to localStorage whenever columns change (only after initialization)
  useEffect(() => {
    if (isInitialized && columns.length > 0) {
      localStorage.setItem('kanban-columns', JSON.stringify(columns))
    }
  }, [columns, isInitialized])

  function handleDragStart() {
    // Could be used for visual feedback during drag
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    if (activeId === overId) return

    const activeTask = findTask(activeId)
    const overTask = findTask(overId)

    if (!activeTask) return

    // Dropping on a column
    if (columns.some(col => col.id === overId)) {
      const newStatus = overId as 'todo' | 'in-progress' | 'done'
      moveTaskToColumn(activeId, newStatus)
      return
    }

    // Dropping on another task
    if (overTask && activeTask.status !== overTask.status) {
      moveTaskToColumn(activeId, overTask.status)
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    if (activeId === overId) return

    const activeTask = findTask(activeId)
    const overTask = findTask(overId)

    if (!activeTask) return

    // If dropping on the same column, reorder tasks
    if (overTask && activeTask.status === overTask.status) {
      const columnIndex = columns.findIndex(col => col.status === activeTask.status)
      const activeIndex = columns[columnIndex].tasks.findIndex(task => task.id === activeId)
      const overIndex = columns[columnIndex].tasks.findIndex(task => task.id === overId)

      setColumns(prev => {
        const newColumns = [...prev]
        newColumns[columnIndex].tasks = arrayMove(
          newColumns[columnIndex].tasks,
          activeIndex,
          overIndex
        )
        return newColumns
      })
    }
  }

  function findTask(id: string): Task | null {
    for (const column of columns) {
      const task = column.tasks.find(task => task.id === id)
      if (task) return task
    }
    return null
  }

  function moveTaskToColumn(taskId: string, newStatus: 'todo' | 'in-progress' | 'done') {
    setColumns(prev => {
      const newColumns = [...prev]
      
      // Find and remove task from current column
      let task: Task | null = null
      for (const column of newColumns) {
        const taskIndex = column.tasks.findIndex(t => t.id === taskId)
        if (taskIndex !== -1) {
          task = column.tasks[taskIndex]
          column.tasks.splice(taskIndex, 1)
          break
        }
      }

      // Add task to new column
      if (task) {
        task.status = newStatus
        task.updatedAt = new Date()
        const targetColumn = newColumns.find(col => col.status === newStatus)
        if (targetColumn) {
          targetColumn.tasks.push(task)
        }
      }

      return newColumns
    })
  }

  function addTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setColumns(prev => {
      const newColumns = [...prev]
      const targetColumn = newColumns.find(col => col.status === taskData.status)
      if (targetColumn) {
        targetColumn.tasks.push(newTask)
      }
      return newColumns
    })
  }

  function updateTask(taskId: string, updates: Partial<Task>) {
    setColumns(prev => {
      const newColumns = [...prev]
      
      // If status changed, move task to new column
      if (updates.status) {
        const currentTask = findTask(taskId)
        if (currentTask && currentTask.status !== updates.status) {
          // Remove from current column
          for (const column of newColumns) {
            const taskIndex = column.tasks.findIndex(t => t.id === taskId)
            if (taskIndex !== -1) {
              column.tasks.splice(taskIndex, 1)
              break
            }
          }
          
          // Add to new column
          const targetColumn = newColumns.find(col => col.status === updates.status)
          if (targetColumn && currentTask) {
            const updatedTask = { ...currentTask, ...updates, updatedAt: new Date() }
            targetColumn.tasks.push(updatedTask)
          }
          return newColumns
        }
      }

      // Update task in current column
      for (const column of newColumns) {
        const taskIndex = column.tasks.findIndex(t => t.id === taskId)
        if (taskIndex !== -1) {
          column.tasks[taskIndex] = {
            ...column.tasks[taskIndex],
            ...updates,
            updatedAt: new Date()
          }
          break
        }
      }

      return newColumns
    })
  }

  function deleteTask(taskId: string) {
    setColumns(prev => {
      const newColumns = [...prev]
      for (const column of newColumns) {
        const taskIndex = column.tasks.findIndex(t => t.id === taskId)
        if (taskIndex !== -1) {
          column.tasks.splice(taskIndex, 1)
          break
        }
      }
      return newColumns
    })
  }

  // Get all existing tags from all tasks
  const getAllExistingTags = () => {
    const allTags = new Set<string>()
    columns.forEach(column => {
      column.tasks.forEach(task => {
        task.tags.forEach(tag => allTags.add(tag))
      })
    })
    return Array.from(allTags).sort()
  }

  const existingTags = getAllExistingTags()

  // Function to reset data (for debugging)
  const resetKanbanData = () => {
    localStorage.removeItem('kanban-columns')
    setColumns(initialColumns)
    console.log('Kanban data reset to initial state')
  }

  // Filter tasks based on search and priority
  const filteredColumns = columns.map(column => ({
    ...column,
    tasks: column.tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority
      
      return matchesSearch && matchesPriority
    })
  }))

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Kanban Board...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Kanban Board</h1>
          
          {/* Filters and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex gap-4 items-center">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Priority Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              {/* Add Task Button */}
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Task
              </button>

              {/* Reset Data Button (Development Only) */}
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={resetKanbanData}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                  title="Reset to clean data (removes duplicates)"
                >
                  Reset Data
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <KanbanBoard
            columns={filteredColumns}
            onEditTask={(task) => {
              setEditingTask(task)
              setIsTaskModalOpen(true)
            }}
            onDeleteTask={deleteTask}
          />
        </DndContext>

        {/* Task Modal */}
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false)
            setEditingTask(null)
          }}
          onSave={(taskData) => {
            if (editingTask) {
              updateTask(editingTask.id, taskData)
            } else {
              addTask(taskData)
            }
            setIsTaskModalOpen(false)
            setEditingTask(null)
          }}
          editingTask={editingTask}
          existingTags={existingTags}
        />
      </div>
    </div>
  )
}