import { BrowserRouter } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import AppRoutes from '@/routes'
import Loading from '@/components/common/Loading'

function App() {
  const { loading } = useAuth()

  return (
    <BrowserRouter>
      <Loading loading={loading} />
      {!loading && <AppRoutes />}
    </BrowserRouter>
  )
}

export default App
