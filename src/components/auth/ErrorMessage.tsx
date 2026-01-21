interface ErrorMessageProps {
  message: string
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="rounded-md bg-red-50 p-3 border border-red-200">
      <p className="text-sm text-red-800">{message}</p>
    </div>
  )
}

