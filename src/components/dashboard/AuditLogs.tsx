import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select'
import { 
  ClockCounterClockwise, 
  MagnifyingGlass, 
  Download,
  CheckCircle,
  XCircle,
  User,
  Shield,
  Upload
} from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'

interface User {
  id: string
  name: string
  email: string
  role: 'invigilator' | 'admin'
  department: string
}

interface AuditLog {
  timestamp: string
  action: string
  user: string
  details: string
  success: boolean
}

interface AuditLogsProps {
  user: User
}

export function AuditLogs({ user }: AuditLogsProps) {
  const [auditLogs] = useKV<AuditLog[]>('audit-logs', [])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAction, setFilterAction] = useState<string>('all')
  const [filterSuccess, setFilterSuccess] = useState<string>('all')

  const logList = auditLogs || []

  const filteredLogs = logList.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesAction = filterAction === 'all' || log.action === filterAction
    const matchesSuccess = filterSuccess === 'all' || 
      (filterSuccess === 'success' && log.success) ||
      (filterSuccess === 'failure' && !log.success)

    return matchesSearch && matchesAction && matchesSuccess
  })

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'LOGIN':
      case 'LOGIN_FAILED':
        return <User size={16} />
      case 'ADD_STUDENT':
      case 'REMOVE_STUDENT':
      case 'ADD_STUDENT_FAILED':
      case 'REMOVE_STUDENT_FAILED':
        return <Shield size={16} />
      case 'BATCH_UPLOAD':
      case 'BATCH_UPLOAD_FAILED':
        return <Upload size={16} />
      default:
        return <ClockCounterClockwise size={16} />
    }
  }

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'LOGIN': 'Login',
      'LOGIN_FAILED': 'Login Failed',
      'ADD_STUDENT': 'Add Student',
      'ADD_STUDENT_FAILED': 'Add Student Failed',
      'REMOVE_STUDENT': 'Remove Student',
      'REMOVE_STUDENT_FAILED': 'Remove Student Failed',
      'BATCH_UPLOAD': 'Batch Upload',
      'BATCH_UPLOAD_FAILED': 'Batch Upload Failed',
      'EXPORT_STUDENTS': 'Export Students',
      'CLEANUP_SUCCESS': 'Nightly Cleanup',
      'CLEANUP_FAILED': 'Cleanup Failed'
    }
    return labels[action] || action
  }

  const exportLogs = () => {
    if (filteredLogs.length === 0) {
      return
    }

    const csv = [
      'Timestamp,Action,User,Details,Status',
      ...filteredLogs.map(log => [
        new Date(log.timestamp).toLocaleString(),
        getActionLabel(log.action),
        log.user,
        `"${log.details.replace(/"/g, '""')}"`,
        log.success ? 'Success' : 'Failed'
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const uniqueActions = Array.from(new Set(logList.map(log => log.action)))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Audit Logs</h2>
          <p className="text-muted-foreground">
            Complete trail of all system operations and user activities
          </p>
        </div>
        
        <Button onClick={exportLogs} variant="outline" className="gap-2" disabled={filteredLogs.length === 0}>
          <Download size={16} />
          Export Filtered Logs
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MagnifyingGlass size={20} />
            Filter & Search
          </CardTitle>
          <CardDescription>
            Filter logs by action type, status, or search by user/details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="search" className="text-sm font-medium">Search</label>
              <div className="relative">
                <MagnifyingGlass size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search user, action, or details..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Action Type</label>
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {uniqueActions.map(action => (
                    <SelectItem key={action} value={action}>
                      {getActionLabel(action)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={filterSuccess} onValueChange={setFilterSuccess}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="success">Success Only</SelectItem>
                  <SelectItem value="failure">Failures Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {(searchTerm || filterAction !== 'all' || filterSuccess !== 'all') && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Showing {filteredLogs.length} of {logList.length} logs
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setSearchTerm('')
                  setFilterAction('all')
                  setFilterSuccess('all')
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClockCounterClockwise size={20} />
            System Activity ({filteredLogs.length})
          </CardTitle>
          <CardDescription>
            Chronological record of all operations performed in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ClockCounterClockwise size={48} className="mx-auto mb-4 opacity-50" />
              <p>No audit logs found</p>
              {(searchTerm || filterAction !== 'all' || filterSuccess !== 'all') ? (
                <p className="text-sm">Try adjusting your filters</p>
              ) : (
                <p className="text-sm">System activities will appear here</p>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .map((log, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-sm font-mono">
                          {new Date(log.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getActionIcon(log.action)}
                            <span className="text-sm">{getActionLabel(log.action)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {log.user}
                        </TableCell>
                        <TableCell className="max-w-md">
                          <div className="text-sm truncate" title={log.details}>
                            {log.details}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={log.success ? 'default' : 'destructive'} className="gap-1">
                            {log.success ? (
                              <CheckCircle size={12} />
                            ) : (
                              <XCircle size={12} />
                            )}
                            {log.success ? 'Success' : 'Failed'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {filteredLogs
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map((log, index) => (
                  <Card key={index} className="border-l-4" style={{borderLeftColor: log.success ? 'hsl(var(--accent))' : 'hsl(var(--destructive))'}}>
                    <CardContent className="p-4 space-y-3">
                      {/* Header with Action and Status */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getActionIcon(log.action)}
                          <span className="font-medium text-sm">{getActionLabel(log.action)}</span>
                        </div>
                        <Badge variant={log.success ? 'default' : 'destructive'} className="gap-1">
                          {log.success ? (
                            <CheckCircle size={12} />
                          ) : (
                            <XCircle size={12} />
                          )}
                          {log.success ? 'Success' : 'Failed'}
                        </Badge>
                      </div>
                      
                      {/* Timestamp */}
                      <div className="text-xs font-mono text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                      
                      {/* User */}
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-muted-foreground" />
                        <span className="text-sm">{log.user}</span>
                      </div>
                      
                      {/* Details */}
                      <div className="text-sm text-muted-foreground border-t pt-2">
                        {log.details}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ClockCounterClockwise size={24} className="text-primary" />
              <div>
                <div className="text-2xl font-bold">{logList.length}</div>
                <div className="text-sm text-muted-foreground">Total Events</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle size={24} className="text-accent" />
              <div>
                <div className="text-2xl font-bold">
                  {logList.filter(log => log.success).length}
                </div>
                <div className="text-sm text-muted-foreground">Successful</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <XCircle size={24} className="text-destructive" />
              <div>
                <div className="text-2xl font-bold">
                  {logList.filter(log => !log.success).length}
                </div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <User size={24} className="text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold">
                  {new Set(logList.map(log => log.user)).size}
                </div>
                <div className="text-sm text-muted-foreground">Unique Users</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}