import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { Textarea } from '../ui/textarea'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '../ui/dialog'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table'
import { 
  Plus, 
  Upload, 
  Trash, 
  User, 
  Clock,
  CheckCircle,
  XCircle,
  Download
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

interface StudentManagementProps {
  user: User
}

export function StudentManagement({ user }: StudentManagementProps) {
  const [students, setStudents] = useKV<Student[]>('bypass-students', [])
  const [auditLogs, setAuditLogs] = useKV<AuditLog[]>('audit-logs', [])
  const [isAddingStudent, setIsAddingStudent] = useState(false)
  const [isBatchUploading, setIsBatchUploading] = useState(false)
  const [newStudent, setNewStudent] = useState({
    nusId: '',
    name: '',
    reason: ''
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const studentList = students || []

  const addAuditLog = (action: string, details: string, success: boolean) => {
    setAuditLogs(current => [...(current || []), {
      timestamp: new Date().toISOString(),
      action,
      user: user.email,
      details,
      success
    }])
  }

  const mockGraphApiCall = async (action: 'add' | 'remove', nusIds: string[]) => {
    // Simulate Graph API call delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))
    
    // Mock some failures (10% chance)
    if (Math.random() < 0.1) {
      throw new Error('Graph API rate limit exceeded')
    }
    
    return { success: true, processedIds: nusIds }
  }

  const addStudent = async () => {
    if (!newStudent.nusId.trim() || !newStudent.reason.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    // Validate NUS ID format (should start with A or U followed by 7 digits and a letter)
    const nusIdPattern = /^[AU]\d{7}[A-Z]$/
    if (!nusIdPattern.test(newStudent.nusId.toUpperCase())) {
      toast.error('Invalid NUS ID format. Should be like A0123456X or U0123456Y')
      return
    }

    // Check if student already exists
    if (studentList.some(s => s.nusId.toLowerCase() === newStudent.nusId.toLowerCase())) {
      toast.error('Student is already in the bypass list')
      return
    }

    setIsAddingStudent(true)
    
    try {
      await mockGraphApiCall('add', [newStudent.nusId.toUpperCase()])
      
      const student: Student = {
        id: Date.now().toString(),
        nusId: newStudent.nusId.toUpperCase(),
        name: newStudent.name || undefined,
        addedBy: user.email,
        addedAt: new Date().toISOString(),
        reason: newStudent.reason,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      }

      setStudents(current => [...(current || []), student])
      addAuditLog('ADD_STUDENT', `Added ${student.nusId} to bypass list. Reason: ${student.reason}`, true)
      
      toast.success(`${student.nusId} added to bypass list`)
      setNewStudent({ nusId: '', name: '', reason: '' })
    } catch (error) {
      addAuditLog('ADD_STUDENT_FAILED', `Failed to add ${newStudent.nusId}: ${error}`, false)
      toast.error('Failed to add student to security group')
    } finally {
      setIsAddingStudent(false)
    }
  }

  const removeStudent = async (student: Student) => {
    try {
      await mockGraphApiCall('remove', [student.nusId])
      
      setStudents(current => (current || []).filter(s => s.id !== student.id))
      addAuditLog('REMOVE_STUDENT', `Removed ${student.nusId} from bypass list`, true)
      
      toast.success(`${student.nusId} removed from bypass list`)
    } catch (error) {
      addAuditLog('REMOVE_STUDENT_FAILED', `Failed to remove ${student.nusId}: ${error}`, false)
      toast.error('Failed to remove student from security group')
    }
  }

  const handleBatchUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file')
      return
    }

    setIsBatchUploading(true)
    
    try {
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      
      if (!headers.includes('nusid')) {
        toast.error('CSV must contain a "nusid" column')
        return
      }

      const nusIdIndex = headers.indexOf('nusid')
      const nameIndex = headers.indexOf('name')
      const reasonIndex = headers.indexOf('reason')
      
      const newStudents: Student[] = []
      const errors: string[] = []
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim())
        const nusId = values[nusIdIndex]?.toUpperCase()
        
        if (!nusId) continue
        
        const nusIdPattern = /^[AU]\d{7}[A-Z]$/
        if (!nusIdPattern.test(nusId)) {
          errors.push(`Line ${i + 1}: Invalid NUS ID format (${nusId})`)
          continue
        }
        
        if (studentList.some(s => s.nusId === nusId)) {
          errors.push(`Line ${i + 1}: ${nusId} already in bypass list`)
          continue
        }
        
        const student: Student = {
          id: `${Date.now()}-${i}`,
          nusId,
          name: nameIndex >= 0 ? values[nameIndex] : undefined,
          addedBy: user.email,
          addedAt: new Date().toISOString(),
          reason: reasonIndex >= 0 ? values[reasonIndex] || 'Batch upload' : 'Batch upload',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }
        
        newStudents.push(student)
      }
      
      if (newStudents.length === 0) {
        toast.error('No valid students found in CSV')
        return
      }
      
      // Simulate batch Graph API call
      await mockGraphApiCall('add', newStudents.map(s => s.nusId))
      
      setStudents(current => [...(current || []), ...newStudents])
      addAuditLog('BATCH_UPLOAD', `Added ${newStudents.length} students via CSV upload`, true)
      
      toast.success(`Successfully added ${newStudents.length} students${errors.length ? ` (${errors.length} errors)` : ''}`)
      
      if (errors.length > 0) {
        console.log('Upload errors:', errors)
      }
    } catch (error) {
      addAuditLog('BATCH_UPLOAD_FAILED', `Batch upload failed: ${error}`, false)
      toast.error('Failed to process CSV file')
    } finally {
      setIsBatchUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const exportStudents = () => {
    if (studentList.length === 0) {
      toast.error('No students to export')
      return
    }

    const csv = [
      'NUS ID,Name,Added By,Added At,Reason,Expires At',
      ...studentList.map(s => [
        s.nusId,
        s.name || '',
        s.addedBy,
        new Date(s.addedAt).toLocaleString(),
        s.reason,
        new Date(s.expiresAt).toLocaleString()
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bypass-students-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)

    addAuditLog('EXPORT_STUDENTS', `Exported ${studentList.length} student records`, true)
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Student Bypass Management</h2>
          <p className="text-muted-foreground">
            Add or remove students from the security group bypass list
          </p>
        </div>
        
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button onClick={exportStudents} variant="outline" className="gap-2 flex-1 sm:flex-none">
            <Download size={16} />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">Export</span>
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleBatchUpload}
            className="hidden"
          />
          
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            variant="outline" 
            className="gap-2 flex-1 sm:flex-none"
            disabled={isBatchUploading}
          >
            <Upload size={16} />
            <span className="hidden sm:inline">{isBatchUploading ? 'Uploading...' : 'Batch Upload'}</span>
            <span className="sm:hidden">{isBatchUploading ? 'Upload...' : 'Upload'}</span>
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2 flex-1 sm:flex-none">
                <Plus size={16} />
                <span className="hidden sm:inline">Add Student</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="mx-4 max-w-md">
              <DialogHeader>
                <DialogTitle>Add Student to Bypass List</DialogTitle>
                <DialogDescription>
                  Add a student NUS-ID to the security group for temporary system access
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nusId">NUS-ID *</Label>
                  <Input
                    id="nusId"
                    placeholder="A0123456X"
                    value={newStudent.nusId}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, nusId: e.target.value.toUpperCase() }))}
                    className="font-mono"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="studentName">Student Name (optional)</Label>
                  <Input
                    id="studentName"
                    placeholder="John Doe"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason *</Label>
                  <Textarea
                    id="reason"
                    placeholder="e.g., Special examination accommodation, technical issues during exam"
                    value={newStudent.reason}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, reason: e.target.value }))}
                  />
                </div>
                
                <Button 
                  onClick={addStudent} 
                  className="w-full" 
                  disabled={isAddingStudent}
                >
                  {isAddingStudent ? 'Adding Student...' : 'Add to Bypass List'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User size={20} />
            Active Bypass List ({studentList.length})
          </CardTitle>
          <CardDescription>
            Students currently in the security group with temporary access
          </CardDescription>
        </CardHeader>
        <CardContent>
          {studentList.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <User size={48} className="mx-auto mb-4 opacity-50" />
              <p>No students in bypass list</p>
              <p className="text-sm">Add students individually or upload a CSV file</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>NUS-ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Added By</TableHead>
                      <TableHead>Added At</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentList.map((student) => {
                      const isExpired = new Date(student.expiresAt) < new Date()
                      return (
                        <TableRow key={student.id}>
                          <TableCell className="font-mono font-medium">{student.nusId}</TableCell>
                          <TableCell>{student.name || '-'}</TableCell>
                          <TableCell className="text-sm">{student.addedBy}</TableCell>
                          <TableCell className="text-sm">
                            {new Date(student.addedAt).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {isExpired ? (
                                <XCircle size={16} className="text-destructive" />
                              ) : (
                                <Clock size={16} className="text-muted-foreground" />
                              )}
                              <span className={`text-sm ${isExpired ? 'text-destructive' : ''}`}>
                                {new Date(student.expiresAt).toLocaleString()}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs truncate" title={student.reason}>
                            {student.reason}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeStudent(student)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash size={16} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card List View */}
              <div className="lg:hidden space-y-4">
                {studentList.map((student) => {
                  const isExpired = new Date(student.expiresAt) < new Date()
                  return (
                    <Card key={student.id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-mono font-medium text-lg">{student.nusId}</div>
                          {student.name && (
                            <div className="text-sm text-muted-foreground">{student.name}</div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeStudent(student)}
                          className="text-destructive hover:text-destructive shrink-0"
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Added by:</span>
                          <span>{student.addedBy}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Added:</span>
                          <span>{new Date(student.addedAt).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Expires:</span>
                          <div className="flex items-center gap-2">
                            {isExpired ? (
                              <XCircle size={14} className="text-destructive" />
                            ) : (
                              <Clock size={14} className="text-muted-foreground" />
                            )}
                            <span className={isExpired ? 'text-destructive' : ''}>
                              {new Date(student.expiresAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        <div className="pt-2 border-t">
                          <div className="text-muted-foreground text-xs mb-1">Reason:</div>
                          <div className="text-sm">{student.reason}</div>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle size={24} className="text-accent" />
              <div>
                <div className="text-2xl font-bold">{studentList.length}</div>
                <div className="text-sm text-muted-foreground">Active Bypasses</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock size={24} className="text-primary" />
              <div>
                <div className="text-2xl font-bold">
                  {studentList.filter(s => new Date(s.expiresAt) < new Date()).length}
                </div>
                <div className="text-sm text-muted-foreground">Expired Today</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <User size={24} className="text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold">{user.name.split(' ')[0]}</div>
                <div className="text-sm text-muted-foreground">Current User</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}