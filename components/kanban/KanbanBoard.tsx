import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Column, Task } from '@/app/kanban/page'
import { TaskCard } from './TaskCard'
import { cn } from '@/lib/utils'

interface KanbanBoardProps {
  columns: Column[]
  onEditTask: (task: Task) => void
  onDeleteTask: (taskId: string) => void
}

export function KanbanBoard({ columns, onEditTask, onDeleteTask }: KanbanBoardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {columns.map((column) => (
        <KanbanColumn
          key={column.id}
          column={column}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
        />
      ))}
    </div>
  )
}

interface KanbanColumnProps {
  column: Column
  onEditTask: (task: Task) => void
  onDeleteTask: (taskId: string) => void
}

function KanbanColumn({ column, onEditTask, onDeleteTask }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  })

  const getColumnColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-100 border-gray-300'
      case 'in-progress':
        return 'bg-blue-50 border-blue-300'
      case 'done':
        return 'bg-green-50 border-green-300'
      default:
        return 'bg-gray-100 border-gray-300'
    }
  }

  const getHeaderColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'text-gray-700 bg-gray-200'
      case 'in-progress':
        return 'text-blue-700 bg-blue-100'
      case 'done':
        return 'text-green-700 bg-green-100'
      default:
        return 'text-gray-700 bg-gray-200'
    }
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'rounded-lg border-2 border-dashed p-4 min-h-[600px]',
        getColumnColor(column.status)
      )}
    >
      {/* Column Header */}
      <div className={cn(
        'rounded-lg px-4 py-2 mb-4 text-center font-semibold',
        getHeaderColor(column.status)
      )}>
        <h3 className="text-lg">{column.title}</h3>
        <span className="text-sm opacity-75">({column.tasks.length})</span>
      </div>

      {/* Tasks */}
      <SortableContext items={column.tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {column.tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </div>
      </SortableContext>

      {/* Empty State */}
      {column.tasks.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          <p className="text-sm">No tasks yet</p>
          <p className="text-xs mt-1">Drag tasks here or create a new one</p>
        </div>
      )}
    </div>
  )
}