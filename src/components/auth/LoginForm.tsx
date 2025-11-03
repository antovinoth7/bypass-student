import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { Shield, User, Building } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'

interface User {
  id: string
  name: string
  email: string
  role: 'invigilator' | 'admin'
  department: string
}

interface LoginFormProps {
  onLogin: (user: User) => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [auditLogs, setAuditLogs] = useKV<Array<{
    timestamp: string
    action: string
    user: string
    details: string
    success: boolean
  }>>('audit-logs', [])

  // Mock authorized staff - in real app this would be handled by Azure AD
  const authorizedStaff = [
    { id: '1', name: 'Dr. Sarah Tan', email: 'sarah.tan@nus.edu.sg', role: 'admin' as const, department: 'Computer Science' },
    { id: '2', name: 'Prof. John Lim', email: 'john.lim@nus.edu.sg', role: 'invigilator' as const, department: 'Mathematics' },
    { id: '3', name: 'Dr. Mary Wong', email: 'mary.wong@nus.edu.sg', role: 'invigilator' as const, department: 'Engineering' },
    { id: '4', name: 'Prof. David Chen', email: 'david.chen@nus.edu.sg', role: 'admin' as const, department: 'Physics' },
  ]

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      const user = authorizedStaff.find(staff => staff.email.toLowerCase() === email.toLowerCase())
      
      if (user) {
        // Log successful login
        setAuditLogs(current => [...(current || []), {
          timestamp: new Date().toISOString(),
          action: 'LOGIN',
          user: user.email,
          details: `Successful login from ${user.department}`,
          success: true
        }])
        
        toast.success(`Welcome back, ${user.name}!`)
        onLogin(user)
      } else {
        // Log failed login attempt
        setAuditLogs(current => [...(current || []), {
          timestamp: new Date().toISOString(),
          action: 'LOGIN_FAILED',
          user: email,
          details: 'Unauthorized access attempt',
          success: false
        }])
        
        toast.error('Access denied. Only authorized NUS staff can use this portal.')
      }
    } catch (error) {
      toast.error('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-secondary via-background to-muted">
      {/* NUS Logo & Header */}
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <Shield size={32} className="text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">NUS Academic Portal</h1>
            <p className="text-muted-foreground">Student Bypass Access Management</p>
          </div>
        </div>

        <Card className="border-2">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl">Staff Authentication</CardTitle>
            <CardDescription>
              Sign in with your NUS email to access the bypass management system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">NUS Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@nus.edu.sg"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              
              <Button
                type="submit"
                className="w-full h-11"
                disabled={isLoading || !email}
              >
                {isLoading ? 'Authenticating...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <Card className="border border-accent/20 bg-accent/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <User size={16} />
              Demo Credentials
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {authorizedStaff.slice(0, 2).map(staff => (
              <div key={staff.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{staff.name}</p>
                  <p className="text-muted-foreground font-mono text-xs">{staff.email}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={staff.role === 'admin' ? 'default' : 'secondary'}>
                    {staff.role}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Building size={12} />
                    {staff.department}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}