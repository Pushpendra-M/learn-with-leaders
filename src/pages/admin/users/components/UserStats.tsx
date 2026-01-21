interface UserStatsProps {
  total: number
  students: number
  mentors: number
  admins: number
}

export default function UserStats({ total, students, mentors, admins }: UserStatsProps) {
  return (
    <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-sm text-gray-700">
          <span className="font-medium">Total Users:</span> {total}
        </div>
        <div className="flex gap-3 text-sm text-gray-700">
          <span>
            <span className="font-medium">Students:</span> {students}
          </span>
          <span>
            <span className="font-medium">Mentors:</span> {mentors}
          </span>
          <span>
            <span className="font-medium">Admins:</span> {admins}
          </span>
        </div>
      </div>
    </div>
  )
}

