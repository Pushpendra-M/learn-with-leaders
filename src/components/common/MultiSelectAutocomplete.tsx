import { useState, useRef, useEffect } from 'react'
import { X, ChevronDown, Search } from 'lucide-react'
import type { Profile } from '@/types'

interface MultiSelectAutocompleteProps {
  options: Profile[]
  selectedIds: string[]
  onChange: (selectedIds: string[]) => void
  placeholder?: string
  label?: string
  isLoading?: boolean
  getOptionLabel?: (option: Profile) => string
  getOptionSubLabel?: (option: Profile) => string
}

export default function MultiSelectAutocomplete({
  options,
  selectedIds,
  onChange,
  placeholder = 'Search and select...',
  label,
  isLoading = false,
  getOptionLabel = (option) => option.full_name || option.email,
  getOptionSubLabel = (option) => option.role,
}: MultiSelectAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedOptions = options.filter((opt) => selectedIds.includes(opt.id))

  const filteredOptions = options.filter((option) => {
    if (!searchQuery) return true
    const label = getOptionLabel(option).toLowerCase()
    const subLabel = getOptionSubLabel(option)?.toLowerCase() || ''
    const query = searchQuery.toLowerCase()
    return label.includes(query) || subLabel.includes(query) || option.email.toLowerCase().includes(query)
  })

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery('')
        setHighlightedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownRef.current) {
      const highlightedElement = dropdownRef.current.children[highlightedIndex] as HTMLElement
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [highlightedIndex])

  const handleSelect = (optionId: string) => {
    if (selectedIds.includes(optionId)) {
      onChange(selectedIds.filter((id) => id !== optionId))
    } else {
      onChange([...selectedIds, optionId])
    }
    setSearchQuery('')
    setHighlightedIndex(-1)
  }

  const handleRemove = (optionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(selectedIds.filter((id) => id !== optionId))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault()
      handleSelect(filteredOptions[highlightedIndex].id)
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setSearchQuery('')
      setHighlightedIndex(-1)
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <div
        className="min-h-[42px] w-full border border-gray-300 rounded-md bg-white cursor-text focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500"
        onClick={() => {
          setIsOpen(true)
          inputRef.current?.focus()
        }}
      >
        <div className="flex flex-wrap gap-1 p-2">
          {selectedOptions.map((option) => (
            <span
              key={option.id}
              className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-800 rounded-md text-sm"
            >
              {getOptionLabel(option)}
              <button
                type="button"
                onClick={(e) => handleRemove(option.id, e)}
                className="hover:bg-indigo-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <div className="flex-1 min-w-[120px]">
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setHighlightedIndex(-1)
                setIsOpen(true)
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsOpen(true)}
              placeholder={selectedOptions.length === 0 ? placeholder : ''}
              className="w-full outline-none border-none focus:ring-0 text-sm"
            />
          </div>
          <div className="flex items-center px-2">
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${
                isOpen ? 'transform rotate-180' : ''
              }`}
            />
          </div>
        </div>
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {isLoading ? (
            <div className="p-4 text-center text-gray-500 text-sm">Loading...</div>
          ) : filteredOptions.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              {searchQuery ? 'No mentors found' : 'No mentors available'}
            </div>
          ) : (
            <ul className="py-1">
              {filteredOptions.map((option, index) => {
                const isSelected = selectedIds.includes(option.id)
                const isHighlighted = index === highlightedIndex

                return (
                  <li
                    key={option.id}
                    onClick={() => handleSelect(option.id)}
                    className={`px-4 py-2 cursor-pointer flex items-center justify-between ${
                      isHighlighted ? 'bg-indigo-50' : 'hover:bg-gray-50'
                    } ${isSelected ? 'bg-indigo-50' : ''}`}
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {getOptionLabel(option)}
                      </div>
                      {getOptionSubLabel(option) && (
                        <div className="text-xs text-gray-500">
                          {getOptionSubLabel(option)} • {option.email}
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <div className="ml-2 text-indigo-600">
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}

      {selectedOptions.length > 0 && (
        <p className="text-sm text-gray-500 mt-1">
          {selectedOptions.length} mentor(s) selected
        </p>
      )}
    </div>
  )
}


