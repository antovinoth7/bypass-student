import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { Badge } from '../ui/badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '../ui/dialog'
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '../ui/alert-dialog'
import { 
  Gear, 
  Clock, 
  Trash, 
  Download,
  Shield,
  GraphicsCard,
  Warning,
  CheckCircle
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'

interface User {
  id: string
  name: string
  email: string
  role: 'invigilator' | 'admin'
  department: string
}

interface Student {
  id: string
  nusId: string
  name?: string
  addedBy: string
  addedAt: string
  reason: string
  expiresAt: string
}

interface AuditLog {
  timestamp: string
  action: string
  user: string
  details: string
  success: boolean
}

interface SystemSettings {
  cleanupTime: string
  autoCleanup: boolean
  maxBypassDuration: number
  allowBatchUpload: boolean
  graphApiEndpoint: string
  securityGroupId: string
  logRetentionDays: number
}

interface SystemSettingsProps {
  user: User
}

export function SystemSettings({ user }: SystemSettingsProps) {
  const [settings, setSettings] = useKV<SystemSettings>('system-settings', {
    cleanupTime: '23:59',
    autoCleanup: true,
    maxBypassDuration: 24,
    allowBatchUpload: true,
    graphApiEndpoint: 'https://graph.microsoft.com/v1.0',
    securityGroupId: 'bypass-group-id-placeholder',
    logRetentionDays: 90
  })
  const [students, setStudents] = useKV<Student[]>('bypass-students', [])
  const [auditLogs, setAuditLogs] = useKV<AuditLog[]>('audit-logs', [])
  const [lastCleanup, setLastCleanup] = useKV<string>('last-cleanup', '')
  const [isTestingConnection, setIsTestingConnection] = useState(false)

  const currentSettings = settings || {
    cleanupTime: '23:59',
    autoCleanup: true,
    maxBypassDuration: 24,
    allowBatchUpload: true,
    graphApiEndpoint: 'https://graph.microsoft.com/v1.0',
    securityGroupId: 'bypass-group-id-placeholder',
    logRetentionDays: 90
  }

  const addAuditLog = (action: string, details: string, success: boolean) => {
    setAuditLogs(current => [...(current || []), {
      timestamp: new Date().toISOString(),
      action,
      user: user.email,
      details,
      success
    }])
  }

  const handleSettingChange = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => ({ ...currentSettings, ...prev, [key]: value }))
    addAuditLog('SETTINGS_CHANGE', `Updated ${key} to ${value}`, true)
    toast.success('Settings updated successfully')
  }

  const testGraphConnection = async () => {
    setIsTestingConnection(true)
    try {
      // Simulate Graph API connection test
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock random success/failure
      const success = Math.random() > 0.3
      
      if (success) {
        addAuditLog('GRAPH_TEST_SUCCESS', 'Successfully connected to Microsoft Graph API', true)
        toast.success('Graph API connection successful')
      } else {
        throw new Error('Authentication failed')
      }
    } catch (error) {
      addAuditLog('GRAPH_TEST_FAILED', `Graph API connection failed: ${error}`, false)
      toast.error('Failed to connect to Graph API')
    } finally {
      setIsTestingConnection(false)
    }
  }

  const runManualCleanup = async () => {
    try {
      const studentList = students || []
      const removedCount = studentList.length
      
      // Simulate cleanup process
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setStudents([])
      setLastCleanup(new Date().toISOString())
      addAuditLog('MANUAL_CLEANUP', `Manually removed ${removedCount} students from bypass list`, true)
      
      toast.success(`Successfully removed ${removedCount} students from bypass list`)
    } catch (error) {
      addAuditLog('CLEANUP_FAILED', `Manual cleanup failed: ${error}`, false)
      toast.error('Cleanup operation failed')
    }
  }

  const clearAuditLogs = async () => {
    try {
      const logList = auditLogs || []
      const logCount = logList.length
      setAuditLogs([])
      addAuditLog('LOGS_CLEARED', `Cleared ${logCount} audit log entries`, true)
      toast.success(`Cleared ${logCount} audit log entries`)
    } catch (error) {
      toast.error('Failed to clear audit logs')
    }
  }

  const exportSystemReport = () => {
    const studentList = students || []
    const logList = auditLogs || []
    
    const report = {
      timestamp: new Date().toISOString(),
      settings: currentSettings,
      statistics: {
        activeStudents: studentList.length,
        totalLogs: logList.length,
        lastCleanup,
        successfulOperations: logList.filter(log => log.success).length,
        failedOperations: logList.filter(log => !log.success).length
      },
      recentActivity: logList.slice(-10)
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `system-report-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)

    addAuditLog('SYSTEM_REPORT', 'Generated and exported system report', true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">System Settings</h2>
          <p className="text-muted-foreground">
            Configure system behavior and Microsoft Graph API integration
          </p>
        </div>
        
        <Button onClick={exportSystemReport} variant="outline" className="gap-2">
          <Download size={16} />
          Export System Report
        </Button>
      </div>

      {/* Microsoft Graph Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraphicsCard size={20} />
            Microsoft Graph API Configuration
          </CardTitle>
          <CardDescription>
            Configure connection to Microsoft 365 for security group management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="graphEndpoint">Graph API Endpoint</Label>
            <Input
              id="graphEndpoint"
              value={currentSettings.graphApiEndpoint}
              onChange={(e) => handleSettingChange('graphApiEndpoint', e.target.value)}
              placeholder="https://graph.microsoft.com/v1.0"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="securityGroupId">Security Group ID</Label>
            <div className="flex gap-2">
              <Input
                id="securityGroupId"
                value={currentSettings.securityGroupId}
                onChange={(e) => handleSettingChange('securityGroupId', e.target.value)}
                placeholder="Enter Security Group Object ID"
                className="font-mono"
              />
              <Button 
                onClick={testGraphConnection} 
                variant="outline" 
                disabled={isTestingConnection}
                className="gap-2"
              >
                {isTestingConnection ? 'Testing...' : 'Test'}
              </Button>
            </div>
          </div>
          
          {lastCleanup && (
            <div className="text-sm text-muted-foreground">
              Last successful connection: {new Date(lastCleanup).toLocaleString()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cleanup Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock size={20} />
            Automated Cleanup Settings
          </CardTitle>
          <CardDescription>
            Configure when and how the system automatically removes bypass entries
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Automatic Cleanup</Label>
              <p className="text-sm text-muted-foreground">
                Automatically remove all bypass entries at scheduled time
              </p>
            </div>
            <Switch
              checked={currentSettings.autoCleanup}
              onCheckedChange={(checked) => handleSettingChange('autoCleanup', checked)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cleanupTime">Daily Cleanup Time</Label>
            <Input
              id="cleanupTime"
              type="time"
              value={currentSettings.cleanupTime}
              onChange={(e) => handleSettingChange('cleanupTime', e.target.value)}
              disabled={!currentSettings.autoCleanup}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="maxDuration">Maximum Bypass Duration (hours)</Label>
            <Select 
              value={currentSettings.maxBypassDuration.toString()} 
              onValueChange={(value) => handleSettingChange('maxBypassDuration', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 hour</SelectItem>
                <SelectItem value="4">4 hours</SelectItem>
                <SelectItem value="8">8 hours</SelectItem>
                <SelectItem value="12">12 hours</SelectItem>
                <SelectItem value="24">24 hours</SelectItem>
                <SelectItem value="48">48 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Trash size={16} />
                  Run Manual Cleanup
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Manual Cleanup</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will immediately remove all students from the bypass list and Microsoft 365 security group. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={runManualCleanup}>
                    Run Cleanup
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            {lastCleanup && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle size={16} />
                Last cleanup: {new Date(lastCleanup).toLocaleString()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* System Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield size={20} />
            System Permissions
          </CardTitle>
          <CardDescription>
            Configure system-wide permissions and access controls
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow Batch Upload</Label>
              <p className="text-sm text-muted-foreground">
                Allow invigilators to upload CSV files with multiple student IDs
              </p>
            </div>
            <Switch
              checked={currentSettings.allowBatchUpload}
              onCheckedChange={(checked) => handleSettingChange('allowBatchUpload', checked)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="logRetention">Audit Log Retention (days)</Label>
            <Select 
              value={currentSettings.logRetentionDays.toString()} 
              onValueChange={(value) => handleSettingChange('logRetentionDays', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="60">60 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="180">180 days</SelectItem>
                <SelectItem value="365">1 year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Warning size={20} />
            Maintenance Actions
          </CardTitle>
          <CardDescription>
            Dangerous operations that affect system data - use with caution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash size={16} />
                  Clear All Audit Logs
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear Audit Logs</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all audit logs. This action cannot be undone and may affect compliance requirements.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={clearAuditLogs}>
                    Clear Logs
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <p className="text-sm text-muted-foreground">
              Current audit logs: {(auditLogs || []).length} entries
            </p>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield size={24} className="text-primary" />
              <div>
                <div className="text-2xl font-bold">{(students || []).length}</div>
                <div className="text-sm text-muted-foreground">Active Bypasses</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock size={24} className="text-accent" />
              <div>
                <div className="text-lg font-bold">
                  {currentSettings.autoCleanup ? 'ON' : 'OFF'}
                </div>
                <div className="text-sm text-muted-foreground">
                  Auto Cleanup {currentSettings.autoCleanup && `at ${currentSettings.cleanupTime}`}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle size={24} className="text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold">{(auditLogs || []).length}</div>
                <div className="text-sm text-muted-foreground">Audit Entries</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}