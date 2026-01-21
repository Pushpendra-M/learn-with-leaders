interface SuccessMessageProps {
  message: string
}

export default function SuccessMessage({ message }: SuccessMessageProps) {
  return (
    <div className="rounded-md bg-green-50 p-3 border border-green-200">
      <p className="text-sm text-green-800">{message}</p>
    </div>
  )
}

