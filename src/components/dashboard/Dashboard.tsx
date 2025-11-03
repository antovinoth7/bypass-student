import { useState } from 'react'
import { Header } from './Header'
import { StudentManagement } from './StudentManagement'
import { AuditLogs } from './AuditLogs'
import { SystemSettings } from './SystemSettings'
import { Sidebar } from '../navigation/Sidebar'
import { useIsMobile } from '../../hooks/use-mobile'

interface User {
  id: string
  name: string
  email: string
  role: 'invigilator' | 'admin'
  department: string
}

interface DashboardProps {
  user: User
  onLogout: () => void
}

export type ActiveTab = 'students' | 'audit' | 'settings'

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('students')
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header user={user} onLogout={onLogout} />
        <Sidebar 
          user={user} 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          onLogout={onLogout}
        />
        
        <main className="flex-1 p-4">
          {activeTab === 'students' && <StudentManagement user={user} />}
          {activeTab === 'audit' && <AuditLogs user={user} />}
          {activeTab === 'settings' && user.role === 'admin' && <SystemSettings user={user} />}
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        user={user} 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        onLogout={onLogout}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} onLogout={onLogout} />
        
        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === 'students' && <StudentManagement user={user} />}
          {activeTab === 'audit' && <AuditLogs user={user} />}
          {activeTab === 'settings' && user.role === 'admin' && <SystemSettings user={user} />}
        </main>
      </div>
    </div>
  )
}