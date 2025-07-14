import { useState, useEffect, useRef } from 'react'
import { X, Plus, Tag, ChevronDown } from 'lucide-react'
import { Task } from '@/app/kanban/page'
import { cn } from '@/lib/utils'

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void
  editingTask?: Task | null
  existingTags?: string[]
}

export function TaskModal({ isOpen, onClose, onSave, editingTask, existingTags = [] }: TaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'todo' | 'in-progress' | 'done'>('todo')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const tagInputRef = useRef<HTMLInputElement>(null)
  const suggestionListRef = useRef<HTMLUListElement>(null)

  // Reset form when modal opens/closes or editing task changes
  useEffect(() => {
    if (isOpen) {
      if (editingTask) {
        setTitle(editingTask.title)
        setDescription(editingTask.description)
        setStatus(editingTask.status)
        setPriority(editingTask.priority)
        setTags([...editingTask.tags])
      } else {
        resetForm()
      }
    }
  }, [isOpen, editingTask])

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setStatus('todo')
    setPriority('medium')
    setTags([])
    setNewTag('')
    setShowSuggestions(false)
    setSelectedSuggestionIndex(-1)
  }

  // Filter existing tags for suggestions
  const getFilteredSuggestions = () => {
    if (!newTag.trim()) return []
    
    const available = existingTags.filter(tag => 
      !tags.includes(tag) && 
      tag.toLowerCase().includes(newTag.toLowerCase())
    )
    
    return available.slice(0, 5) // Limit to 5 suggestions
  }

  const filteredSuggestions = getFilteredSuggestions()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) return

    onSave({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      tags: tags.filter(tag => tag.trim() !== '')
    })

    resetForm()
  }

  const addTag = (tagToAdd?: string) => {
    const trimmedTag = (tagToAdd || newTag).trim().toLowerCase()
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag])
      setNewTag('')
      setShowSuggestions(false)
      setSelectedSuggestionIndex(-1)
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setNewTag(value)
    setShowSuggestions(value.trim().length > 0)
    setSelectedSuggestionIndex(-1)
  }

  const handleTagInputFocus = () => {
    if (newTag.trim().length > 0) {
      setShowSuggestions(true)
    }
  }

  const handleTagInputBlur = () => {
    // Delay hiding suggestions to allow for click events
    setTimeout(() => setShowSuggestions(false), 150)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedSuggestionIndex >= 0 && filteredSuggestions[selectedSuggestionIndex]) {
        addTag(filteredSuggestions[selectedSuggestionIndex])
      } else if (newTag.trim()) {
        addTag()
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedSuggestionIndex(prev => 
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1)
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setSelectedSuggestionIndex(-1)
    }
  }

  const selectSuggestion = (suggestion: string) => {
    addTag(suggestion)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingTask ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter task title..."
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Enter task description..."
            />
          </div>

          {/* Status and Priority Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'todo' | 'in-progress' | 'done')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            
            {/* Existing Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Add New Tag */}
            <div className="relative">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    ref={tagInputRef}
                    type="text"
                    value={newTag}
                    onChange={handleTagInputChange}
                    onKeyDown={handleKeyPress}
                    onFocus={handleTagInputFocus}
                    onBlur={handleTagInputBlur}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add a tag..."
                  />
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <ul
                      ref={suggestionListRef}
                      className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto"
                    >
                      {filteredSuggestions.map((suggestion, index) => (
                        <li
                          key={suggestion}
                          onClick={() => selectSuggestion(suggestion)}
                          className={cn(
                            'px-3 py-2 cursor-pointer text-sm border-b border-gray-100 last:border-b-0 flex items-center gap-2',
                            index === selectedSuggestionIndex
                              ? 'bg-blue-50 text-blue-700'
                              : 'hover:bg-gray-50 text-gray-700'
                          )}
                        >
                          <Tag className="h-3 w-3 text-gray-400" />
                          {suggestion}
                          <ChevronDown className="h-3 w-3 text-gray-400 ml-auto rotate-[-90deg]" />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => addTag()}
                  disabled={!newTag.trim()}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    newTag.trim()
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  )}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              
              {/* Hint text */}
              {existingTags.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Start typing to see suggestions, or enter a new tag
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className={cn(
                'flex-1 px-4 py-2 rounded-lg font-medium transition-colors',
                title.trim()
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              )}
            >
              {editingTask ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}