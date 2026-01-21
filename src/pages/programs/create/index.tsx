import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAllUsers } from '@/hooks/useAllUsers'
import { useCreateProgram } from '@/hooks/useCreateProgram'
import type { ProgramStatus } from '@/types'
import ProgramForm from './components/ProgramForm'
import { DEFAULT_MAX_STUDENTS } from './constants'
import { ROUTES } from '@/routes/constants'

export default function CreateProgram() {
  const navigate = useNavigate()
  const { data: allUsers } = useAllUsers()
  const createProgram = useCreateProgram()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<ProgramStatus>('open')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [maxStudents, setMaxStudents] = useState(DEFAULT_MAX_STUDENTS)
  const [selectedMentorIds, setSelectedMentorIds] = useState<string[]>([])

  const mentors = allUsers?.filter((u) => u.role === 'mentor' || u.role === 'admin') || []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      alert('Please enter a title')
      return
    }

    await createProgram.mutateAsync({
      title,
      description: description || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      maxStudents,
      status,
      mentorIds: selectedMentorIds.length > 0 ? selectedMentorIds : undefined,
    })

    navigate(ROUTES.PROGRAMS)
  }

  return (
    <ProgramForm
      title={title}
      description={description}
      status={status}
      startDate={startDate}
      endDate={endDate}
      maxStudents={maxStudents}
      selectedMentorIds={selectedMentorIds}
      mentors={mentors}
      isSubmitting={createProgram.isPending}
      onTitleChange={setTitle}
      onDescriptionChange={setDescription}
      onStatusChange={setStatus}
      onStartDateChange={setStartDate}
      onEndDateChange={setEndDate}
      onMaxStudentsChange={setMaxStudents}
      onMentorChange={setSelectedMentorIds}
      onSubmit={handleSubmit}
      onCancel={() => navigate(ROUTES.PROGRAMS)}
    />
  )
}

