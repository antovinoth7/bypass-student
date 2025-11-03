# NUS Academic Staff Bypass Portal

A secure web portal enabling authorized invigilators and academic staff to manage student bypass access to restricted systems during examination periods through Microsoft 365 Security Group integration.

**Experience Qualities**:
1. **Trustworthy** - Clear authentication, audit trails, and fail-safe operations build confidence in sensitive academic operations
2. **Efficient** - Streamlined workflows minimize disruption during time-sensitive examination scenarios  
3. **Professional** - Clean, institutional design reflects the gravity and formality of academic assessment processes

**Complexity Level**: Complex Application (advanced functionality, accounts)
- Requires secure authentication, external API integration, scheduled operations, and comprehensive audit logging for institutional compliance

## Essential Features

### Staff Authentication & Authorization
- **Functionality**: Secure login system with role-based access control for invigilators and academic staff
- **Purpose**: Ensures only authorized personnel can modify security groups and access student data
- **Trigger**: Staff member accesses portal URL
- **Progression**: Login screen → credential validation → role verification → dashboard access
- **Success Criteria**: Only verified staff can access system, all login attempts logged

### Student NUS-ID Bypass Management
- **Functionality**: Add/remove student NUS-IDs to Microsoft 365 Security Group via Graph API
- **Purpose**: Grant temporary system access to students during examinations or special circumstances
- **Trigger**: Staff selects "Add Student" or imports batch list
- **Progression**: Student ID input → validation → Graph API call → confirmation → audit log entry
- **Success Criteria**: Students gain immediate system access, all changes tracked with timestamps

### Automated Nightly Cleanup
- **Functionality**: Scheduled removal of all bypass entries at end of day
- **Purpose**: Ensures temporary access doesn't become permanent security risk
- **Trigger**: Automated scheduler (configurable time, default 11:59 PM)
- **Progression**: System scan → identify bypass entries → bulk removal via Graph API → completion report
- **Success Criteria**: All bypass entries cleared, cleanup operations logged, failure alerts generated

### Comprehensive Audit Trail
- **Functionality**: Detailed logging of all portal operations with searchable interface
- **Purpose**: Compliance requirements and investigation capabilities for academic integrity
- **Trigger**: Any system operation (login, add, remove, cleanup)
- **Progression**: Operation execution → log entry creation → persistent storage → search/filter interface
- **Success Criteria**: All operations trackable with user, timestamp, and outcome details

### Batch Import Operations
- **Functionality**: CSV upload for multiple student NUS-IDs with validation
- **Purpose**: Efficiency during large examination sessions
- **Trigger**: Staff uploads CSV file
- **Progression**: File upload → format validation → NUS-ID verification → batch Graph API operations → summary report
- **Success Criteria**: Valid entries processed, invalid entries reported, all operations logged

## Edge Case Handling

- **Network Failures**: Queue operations locally, retry with exponential backoff, alert staff of pending operations
- **Invalid NUS-IDs**: Real-time validation, clear error messaging, prevent partial batch operations
- **Graph API Limits**: Respect rate limits, batch operations efficiently, graceful degradation with user feedback
- **Duplicate Entries**: Detect and skip duplicates, inform user of existing bypass status
- **Cleanup Failures**: Multiple retry attempts, manual override capability, alert system administrators
- **Session Expiry**: Auto-save draft operations, clear session warnings, secure logout procedures

## Design Direction

The interface should embody institutional authority and academic professionalism while remaining approachable for daily use - think Singapore government digital services with university gravitas, emphasizing clarity and trust over visual flourish.

## Color Selection

Custom palette reflecting NUS institutional branding and academic professionalism.

- **Primary Color**: NUS Orange (oklch(0.7 0.15 50)) - Communicates institutional authority and energy
- **Secondary Colors**: Deep Navy (oklch(0.25 0.1 240)) for trust and stability, Light Grey (oklch(0.95 0.02 240)) for backgrounds
- **Accent Color**: Success Green (oklch(0.65 0.15 140)) for confirmations and positive actions
- **Foreground/Background Pairings**: 
  - Background White (oklch(1 0 0)): Dark Navy text (oklch(0.25 0.1 240)) - Ratio 8.2:1 ✓
  - Primary Orange (oklch(0.7 0.15 50)): White text (oklch(1 0 0)) - Ratio 4.9:1 ✓
  - Secondary Navy (oklch(0.25 0.1 240)): White text (oklch(1 0 0)) - Ratio 8.2:1 ✓
  - Accent Green (oklch(0.65 0.15 140)): White text (oklch(1 0 0)) - Ratio 4.8:1 ✓

## Font Selection

Typography should convey institutional credibility and ensure excellent readability for data-heavy interfaces - Inter provides the perfect balance of authority and approachability for academic administration.

- **Typographic Hierarchy**:
  - H1 (Page Title): Inter Bold/32px/tight letter spacing
  - H2 (Section Headers): Inter SemiBold/24px/normal spacing  
  - H3 (Card Titles): Inter Medium/18px/normal spacing
  - Body (Interface Text): Inter Regular/16px/relaxed line height
  - Caption (Timestamps/Meta): Inter Regular/14px/muted color
  - Code (NUS-IDs): JetBrains Mono/16px/monospace for ID readability

## Animations

Subtle, purposeful motion that reinforces system reliability without drawing attention away from critical academic operations.

- **Purposeful Meaning**: Smooth transitions communicate system responsiveness and build confidence in operation success
- **Hierarchy of Movement**: Priority on feedback animations for critical actions (bypass additions/removals), minimal decoration elsewhere

## Component Selection

- **Components**: Cards for student entries and audit logs, Tables for batch operations, Dialogs for confirmations, Forms with validation, Badges for status indicators, Alerts for system messages
- **Customizations**: Custom NUS-branded header component, specialized audit trail viewer, batch upload interface with progress indicators
- **States**: Clear loading states for Graph API operations, distinct success/error states for all actions, disabled states during processing
- **Icon Selection**: User icons for staff, Shield for security operations, Calendar for scheduled tasks, Download/Upload for file operations
- **Spacing**: Generous padding (p-6) for cards, consistent gap-4 for form elements, tight spacing (gap-2) for data tables
- **Mobile**: Collapsible sidebar navigation, stacked card layouts, touch-friendly buttons (min 44px), responsive tables with horizontal scroll