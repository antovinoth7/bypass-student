import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { 
  Users, 
  ClockCounterClockwise, 
  Gear, 
  Shield,
  SignOut
} from '@phosphor-icons/react'
import { useIsMobile } from '../../hooks/use-mobile'
import { ActiveTab } from '../dashboard/Dashboard'
import { cn } from '../../lib/utils'

interface User {
  id: string
  name: string
  email: string
  role: 'invigilator' | 'admin'
  department: string
}

interface SidebarProps {
  user: User
  activeTab: ActiveTab
  onTabChange: (tab: ActiveTab) => void
  onLogout: () => void
}

export function Sidebar({ user, activeTab, onTabChange, onLogout }: SidebarProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div className="flex bg-card border-b px-3 py-2 gap-2 overflow-x-auto">
        <Button
          variant={activeTab === 'students' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onTabChange('students')}
          className="flex items-center gap-2 whitespace-nowrap shrink-0"
        >
          <Users size={16} />
          Students
        </Button>
        <Button
          variant={activeTab === 'audit' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onTabChange('audit')}
          className="flex items-center gap-2 whitespace-nowrap shrink-0"
        >
          <ClockCounterClockwise size={16} />
          Audit
        </Button>
        {user.role === 'admin' && (
          <Button
            variant={activeTab === 'settings' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onTabChange('settings')}
            className="flex items-center gap-2 whitespace-nowrap shrink-0"
          >
            <Gear size={16} />
            Settings
          </Button>
        )}
      </div>
    )
  }

  return (
    <aside className="w-64 bg-card border-r flex flex-col">
      {/* Logo & Branding */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Shield size={20} className="text-primary-foreground" />
          </div>
          <div>
            <div className="font-semibold text-sm">NUS Portal</div>
            <div className="text-xs text-muted-foreground">Bypass Management</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <Button
          variant={activeTab === 'students' ? 'default' : 'ghost'}
          onClick={() => onTabChange('students')}
          className={cn(
            "w-full justify-start gap-3 h-11",
            activeTab === 'students' ? 'bg-primary text-primary-foreground' : ''
          )}
        >
          <Users size={18} />
          Student Management
        </Button>

        <Button
          variant={activeTab === 'audit' ? 'default' : 'ghost'}
          onClick={() => onTabChange('audit')}
          className={cn(
            "w-full justify-start gap-3 h-11",
            activeTab === 'audit' ? 'bg-primary text-primary-foreground' : ''
          )}
        >
          <ClockCounterClockwise size={18} />
          Audit Logs
        </Button>

        {user.role === 'admin' && (
          <Button
            variant={activeTab === 'settings' ? 'default' : 'ghost'}
            onClick={() => onTabChange('settings')}
            className={cn(
              "w-full justify-start gap-3 h-11",
              activeTab === 'settings' ? 'bg-primary text-primary-foreground' : ''
            )}
          >
            <Gear size={18} />
            System Settings
          </Button>
        )}
      </nav>

      {/* User Info Card */}
      <div className="p-4 border-t">
        <Card className="p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{user.name}</div>
                <div className="text-xs text-muted-foreground truncate">{user.department}</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                {user.role}
              </Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onLogout}
                className="text-muted-foreground hover:text-destructive"
              >
                <SignOut size={16} />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </aside>
  )
}