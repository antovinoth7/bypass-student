import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { LoginForm } from './components/auth/LoginForm'
import { Dashboard } from './components/dashboard/Dashboard'
import { Toaster } from './components/ui/sonner'

interface User {
  id: string
  name: string
  email: string
  role: 'invigilator' | 'admin'
  department: string
}

function App() {
  const [user, setUser] = useKV<User | null>('current-user', null)

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <LoginForm onLogin={setUser} />
        <Toaster />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Dashboard user={user} onLogout={() => setUser(null)} />
      <Toaster />
    </div>
  )
}

export default App