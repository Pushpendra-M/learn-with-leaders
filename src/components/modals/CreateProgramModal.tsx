import { useAllUsers } from '@/hooks/useAllUsers'
import { useCreateProgram } from '@/hooks/useCreateProgram'
import { Calendar, Users, FileText, Tag, X, AlertCircle } from 'lucide-react'
import type { ProgramStatus, Profile } from '@/types'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { useState, useRef, useEffect } from 'react'

interface CreateProgramModalProps {
  isOpen: boolean
  onClose: () => void
}

interface FormValues {
  title: string
  description: string
  status: ProgramStatus
  startDate: string
  endDate: string
  maxStudents: number
  mentorIds: string[]
}

const validationSchema = Yup.object({
  title: Yup.string()
    .required('Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be less than 200 characters')
    .trim(),
  description: Yup.string().optional(),
  status: Yup.string().oneOf(['draft', 'open', 'closed', 'completed']).required('Status is required'),
  startDate: Yup.date()
    .required('Start date is required')
    .test('not-past', 'Start date cannot be in the past', function (value) {
      if (!value) return false
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return new Date(value) >= today
    }),
  endDate: Yup.date()
    .required('End date is required')
    .test('after-start', 'End date must be after start date', function (value) {
      const { startDate } = this.parent
      if (!value || !startDate) return false
      return new Date(value) > new Date(startDate)
    }),
  maxStudents: Yup.number().min(1, 'Must be at least 1').required('Maximum students is required'),
  mentorIds: Yup.array().of(Yup.string()).optional(),
})

export default function CreateProgramModal({ isOpen, onClose }: CreateProgramModalProps) {
  const [showAllSelectedMentors, setShowAllSelectedMentors] = useState(false)
  const { data: allUsers } = useAllUsers()
  const createProgram = useCreateProgram()
  const [isMentorDropdownOpen, setIsMentorDropdownOpen] = useState(false)
  const [mentorSearchQuery, setMentorSearchQuery] = useState('')
  const mentorDropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const mentors = allUsers?.filter((u: Profile) => u.role === 'mentor' || u.role === 'admin') || []

  // Filter mentors based on search query
  const filteredMentors = mentors.filter((mentor: Profile) => {
    const searchLower = mentorSearchQuery.toLowerCase()
    const name = (mentor.full_name || '').toLowerCase()
    const email = (mentor.email || '').toLowerCase()
    return name.includes(searchLower) || email.includes(searchLower)
  })

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mentorDropdownRef.current && !mentorDropdownRef.current.contains(event.target as Node)) {
        setIsMentorDropdownOpen(false)
        setMentorSearchQuery('')
      }
    }

    if (isMentorDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMentorDropdownOpen])

  const initialValues: FormValues = {
    title: '',
    description: '',
    status: 'open',
    startDate: '',
    endDate: '',
    maxStudents: 50,
    mentorIds: [],
  }

  const handleSubmit = async (values: FormValues) => {
    await createProgram.mutateAsync({
      title: values.title.trim(),
      description: values.description || undefined,
      startDate: values.startDate || undefined,
      endDate: values.endDate || undefined,
      maxStudents: values.maxStudents,
      status: values.status,
      mentorIds: values.mentorIds.length > 0 ? values.mentorIds : undefined,
    })

    setShowAllSelectedMentors(false)
    setMentorSearchQuery('')
    setIsMentorDropdownOpen(false)
    onClose()
  }

  const handleClose = () => {
    setShowAllSelectedMentors(false)
    setMentorSearchQuery('')
    setIsMentorDropdownOpen(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col my-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex justify-between items-center flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Create New Program</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, setFieldValue, isSubmitting, errors, touched }) => {
            // Update endDate min when startDate changes
            const today = new Date().toISOString().split('T')[0]
            const minEndDate = values.startDate || today

            return (
              <Form className="p-4 sm:p-6 space-y-4 overflow-y-auto">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    <FileText className="w-4 h-4 inline mr-1" />
                    Title *
                  </label>
                  <Field
                    name="title"
                    type="text"
                    className={`w-full max-w-md px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 ${
                      errors.title && touched.title
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-indigo-500'
                    }`}
                    placeholder="Enter program title"
                  />
                  <ErrorMessage name="title">
                    {(msg) => (
                      <div className="mt-1 flex items-center gap-1 text-xs text-red-600 font-medium">
                        <AlertCircle className="w-3 h-3 flex-shrink-0 text-red-600 fill-red-600" />
                        <span className="text-red-600">{msg}</span>
                      </div>
                    )}
                  </ErrorMessage>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <Field
                    name="description"
                    as="textarea"
                    rows={2}
                    className="w-full max-w-md px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter program description"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      <Tag className="w-4 h-4 inline mr-1" />
                      Status *
                    </label>
                    <Field
                      name="status"
                      as="select"
                      className={`w-full max-w-md px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 ${
                        errors.status && touched.status
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-indigo-500'
                      }`}
                    >
                      <option value="draft">Draft</option>
                      <option value="open">Open</option>
                      <option value="closed">Closed</option>
                      <option value="completed">Completed</option>
                    </Field>
                  </div>

                  <div>
                    <label htmlFor="maxStudents" className="block text-sm font-medium text-gray-700 mb-1">
                      <Users className="w-4 h-4 inline mr-1" />
                      Max Students
                    </label>
                    <Field
                      name="maxStudents"
                      type="number"
                      min="1"
                      className={`w-full max-w-md px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 ${
                        errors.maxStudents && touched.maxStudents
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-indigo-500'
                      }`}
                    />
                    <ErrorMessage name="maxStudents">
                      {(msg) => (
                        <div className="mt-1 flex items-center gap-1 text-xs text-red-600 font-medium">
                          <AlertCircle className="w-3 h-3 flex-shrink-0 text-red-600 fill-red-600" />
                          <span className="text-red-600">{msg}</span>
                        </div>
                      )}
                    </ErrorMessage>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Start Date *
                    </label>
                    <Field
                      name="startDate"
                      type="date"
                      min={today}
                      className={`w-full max-w-md px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 ${
                        errors.startDate && touched.startDate
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-indigo-500'
                      }`}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setFieldValue('startDate', e.target.value)
                        // Clear endDate if it's before new startDate
                        if (values.endDate && e.target.value && new Date(values.endDate) <= new Date(e.target.value)) {
                          setFieldValue('endDate', '')
                        }
                      }}
                    />
                    <ErrorMessage name="startDate">
                      {(msg) => (
                        <div className="mt-1 flex items-center gap-1 text-xs text-red-600 font-medium">
                          <AlertCircle className="w-3 h-3 flex-shrink-0 text-red-600 fill-red-600" />
                          <span className="text-red-600">{msg}</span>
                        </div>
                      )}
                    </ErrorMessage>
                  </div>

                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      End Date *
                    </label>
                    <Field
                      name="endDate"
                      type="date"
                      min={minEndDate}
                      className={`w-full max-w-md px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 ${
                        errors.endDate && touched.endDate
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-indigo-500'
                      }`}
                    />
                    <ErrorMessage name="endDate">
                      {(msg) => (
                        <div className="mt-1 flex items-center gap-1 text-xs text-red-600 font-medium">
                          <AlertCircle className="w-3 h-3 flex-shrink-0 text-red-600 fill-red-600" />
                          <span className="text-red-600">{msg}</span>
                        </div>
                      )}
                    </ErrorMessage>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Users className="w-4 h-4 inline mr-1" />
                    Select Mentors
                  </label>
                  <div ref={mentorDropdownRef} className="relative w-full max-w-md">
                    <div
                      className={`min-h-[42px] px-3 py-2 text-sm border rounded-md focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 flex flex-wrap gap-2 items-center ${
                        errors.mentorIds && touched.mentorIds
                          ? 'border-red-500 focus-within:ring-red-500 focus-within:border-red-500'
                          : 'border-gray-300'
                      }`}
                      onClick={() => {
                        setIsMentorDropdownOpen(true)
                        inputRef.current?.focus()
                      }}
                    >
                      {values.mentorIds && values.mentorIds.length > 0 && (
                        <>
                          {(showAllSelectedMentors ? values.mentorIds : values.mentorIds.slice(0, 3)).map((mentorId) => {
                            const mentor = mentors.find((m: Profile) => m.id === mentorId)
                            return mentor ? (
                              <span
                                key={mentorId}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-100 text-indigo-800 text-xs font-medium"
                              >
                                {mentor.full_name || mentor.email}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setFieldValue('mentorIds', values.mentorIds.filter((id) => id !== mentorId))
                                  }}
                                  className="text-indigo-600 hover:text-indigo-800 focus:outline-none"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ) : null
                          })}
                          {values.mentorIds.length > 3 && !showAllSelectedMentors && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowAllSelectedMentors(true)
                              }}
                              className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200"
                            >
                              +{values.mentorIds.length - 3} more
                            </button>
                          )}
                          {showAllSelectedMentors && values.mentorIds.length > 3 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowAllSelectedMentors(false)
                              }}
                              className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200"
                            >
                              Show less
                            </button>
                          )}
                        </>
                      )}
                      <input
                        ref={inputRef}
                        type="text"
                        value={mentorSearchQuery}
                        onChange={(e) => {
                          setMentorSearchQuery(e.target.value)
                          setIsMentorDropdownOpen(true)
                        }}
                        onFocus={() => setIsMentorDropdownOpen(true)}
                        placeholder={values.mentorIds.length === 0 ? 'Search and select mentors...' : ''}
                        className="flex-1 min-w-[120px] outline-none bg-transparent text-sm text-gray-900 placeholder-gray-400"
                      />
                    </div>
                    {isMentorDropdownOpen && filteredMentors.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                        {filteredMentors.map((mentor: Profile) => {
                          const isSelected = values.mentorIds.includes(mentor.id)
                          return (
                            <div
                              key={mentor.id}
                              onClick={() => {
                                if (isSelected) {
                                  setFieldValue('mentorIds', values.mentorIds.filter((id) => id !== mentor.id))
                                } else {
                                  setFieldValue('mentorIds', [...values.mentorIds, mentor.id])
                                  setMentorSearchQuery('')
                                }
                              }}
                              className={`px-3 py-2 hover:bg-gray-50 cursor-pointer ${
                                isSelected ? 'bg-indigo-50' : ''
                              }`}
                            >
                              <div className="text-sm font-medium text-gray-900">
                                {mentor.full_name || mentor.email}
                              </div>
                              <div className="text-xs text-gray-500">{mentor.email} ({mentor.role})</div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                    {isMentorDropdownOpen && filteredMentors.length === 0 && mentorSearchQuery && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg px-3 py-2 text-sm text-gray-500">
                        No mentors found
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={isSubmitting || createProgram.isPending}
                    className="flex-1 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {createProgram.isPending ? 'Creating...' : 'Create Program'}
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </Form>
            )
          }}
        </Formik>
      </div>
    </div>
  )
}
