# Lab 4 Zen Green Theme & UI Specification

**Sprint Title:** Actions Taken, Dashboards, and Final Regression  
**Course:** CPE 334 Introduction to Software Engineering in the Age of AI Agents  
**Target Repository:** `toktickit`  
**Status:** Approved UI Specification  

---

## 1. Design Tokens & Zen Green Visual Language

TokTickIT strictly maintains the **Zen Green Theme** visual foundation established in Lab 2 and extended in Lab 3. The interface avoids generic browser defaults in favor of an ergonomic, high-contrast, professional palette with soft surfaces and distinct semantic cues.

### 1.1 Color Palette & Theme Tokens

| Token / Element | CSS Variable | Hex Code / Style | Semantic Usage |
| :--- | :--- | :--- | :--- |
| **Primary Green** | `--zg-primary` | `#006B3C` | App header background, primary action buttons, key brand focus. |
| **Primary Hover** | `--zg-primary-hover` | `#00542F` | Hover/active states for primary interactive elements. |
| **Secondary Green**| `--zg-secondary` | `#0B7A46` | Active navigation pill, link hover, focus outlines. |
| **Pale Green** | `--zg-pale` | `#EAF6EF` | Selected rows, success callouts, metric card subtle tint. |
| **Page Background**| `--zg-bg` | `#F5F7F6` | Main layout canvas (soothing off-white). |
| **Surface / Card** | `--zg-card-bg` | `#FFFFFF` | Card containers, modals, data tables (`border: 1px solid #E0E6E2`, `box-shadow: 0 2px 4px rgba(0,0,0,0.05)`). |
| **Read-Only Fill** | `--zg-read-only` | `#F0F4F2` | Read-only input background and disabled operational inputs. |
| **Dark Charcoal** | `--zg-text-dark` | `#1E293B` | High-contrast body text, headings, table cells. |
| **Muted Text** | `--zg-text-muted` | `#64748B` | Labels, subtitles, timestamps, helper text. |
| **Error Red** | `--zg-error` | `#C5221F` | Required asterisks (`*`), error text, error banners (`#FDF2F2`, border `#F87171`). |
| **Warning Amber** | `--zg-warning` | `#D97706` | Follow-up flags, unassigned warnings (`#FEF3C7`, border `#FDE68A`). |
| **Internal Note** | `--zg-note-bg` | `#FEF3C7` | Confidential Internal Notes container (`border: 1px solid #FDE68A`, header `#92400E`). |
| **Focus Ring** | `--zg-focus-ring` | `0 0 0 3px rgba(11, 122, 70, 0.25)` | 2px solid `#0B7A46` focus ring with 2px offset. |

---

### 1.2 Role Badge System

| Role | Background | Text Color | Border Color | Visual Presentation |
| :--- | :---: | :---: | :---: | :--- |
| **Requester** | `#DBEAFE` | `#1E40AF` | `#BFDBFE` | Pale Blue pill with bold "Requester" text |
| **IT Staff** | `#D1FAE5` | `#065F46` | `#A7F3D0` | Pale Emerald pill with bold "IT Staff" text |
| **Administrator** | `#E0E7FF` | `#3730A3` | `#C7D2FE` | Pale Indigo pill with bold "Admin" text |

---

### 1.3 Ticket & Action Taken Status Badges

To satisfy accessibility rules, all status badges pair semantic background colors with explicit textual labels and optional icons (never relying on color alone):

| Status Enum | Background | Text Color | Border Color | Icon / Visual Indicator |
| :--- | :---: | :---: | :---: | :--- |
| `NEW` | `#F1F5F9` | `#475569` | `#CBD5E1` | ⚪ Neutral gray pill |
| `OPEN` | `#E0F2FE` | `#0369A1` | `#BAE6FD` | 🔵 Sky blue pill |
| `IN_PROGRESS` | `#DBEAFE` | `#1E40AF` | `#BFDBFE` | 🔷 Deep blue active pill |
| `WAITING_FOR_REQUESTER` | `#FEF3C7` | `#92400E` | `#FDE68A` | 🟡 Amber clock/pending pill |
| `RESOLVED` | `#D1FAE5` | `#065F46` | `#A7F3D0` | 🟢 Emerald checkmark pill |
| `CLOSED` | `#F3F4F6` | `#374151` | `#D1D5DB` | ⚫ Dark gray archive pill |
| `REOPENED` | `#F3E8FF` | `#6B21A8` | `#E9D5FF` | 🟣 Purple refresh pill |
| `CANCELLED` | `#FFE4E6` | `#9F1239` | `#FECDD3` | 🔴 Rose/red cancel pill |

#### Action Taken Status Badges (`ActionTakenStatus`)
- **`PENDING`**: Gray badge (`#F1F5F9`, `#475569`) — Scheduled intervention.
- **`IN_PROGRESS`**: Blue badge (`#DBEAFE`, `#1E40AF`) — Active technical task.
- **`COMPLETED`**: Green badge (`#D1FAE5`, `#065F46`) — Completed intervention.
- **`CANCELLED`**: Red badge (`#FFE4E6`, `#9F1239`) — Aborted or superseded action.

---

## 2. Global Application Shell & Navigation

### 2.1 Header Navigation Layout (`Header.tsx`)
- **Brand & Logo**: Crisp white bold "TokTickIT" logo linking to default dashboard.
- **Role-Based Navigation Tabs**:
  - `REQUESTER`:
    - **Dashboard** (Default post-login landing screen)
    - **My Tickets** (List of user's own tickets)
    - **Create Ticket** (Ticket submission form)
  - `IT_STAFF`:
    - **Dashboard** (Default post-login landing screen)
    - **Ticket Queue** (Central operational ticket queue)
  - `ADMINISTRATOR`:
    - **Dashboard** (Default post-login landing screen)
    - **Ticket Queue** (Central operational ticket queue)
    - **User Management** (User administration portal)
- **Active Navigation Indication**: Active tab features a prominent semi-transparent pill overlay (`rgba(255, 255, 255, 0.25)`) and bold white text. Inactive tabs have `rgba(255, 255, 255, 0.85)` with smooth hover transitions.
- **User Identity & Logout Controls (Right Aligned)**:
  - User full name (bold text).
  - Role badge pill.
  - White button "Sign Out" with `#1F2925` text and `#C8D2CC` border.

---

## 3. Screen Specifications

### 3.1 Requester Dashboard Screen (`/dashboard`)

- **Target Persona**: `REQUESTER`.
- **Layout**: Centered container, max-width `1100px`, padding `24px 16px`.
- **Components**:
  1. **Greeting Header**:
     - Headline: "Welcome back, {User Name}!" in font-size `24px`, bold `#1E293B`.
     - Subtitle: "Here is a summary of your active IT service desk requests."
     - Right Action: Primary Green button "+ Create Ticket" (`#006B3C`).
  2. **Summary Metric Cards (3-Column Grid)**:
     - Card 1 — **Total Open Tickets**:
       - Value: Large bold integer (`32px`, `#006B3C`).
       - Label: "Active Tickets".
       - Helper: "In review, triage, or ongoing repair".
       - Drill-down: Click routes to `/tickets?tab=open`.
     - Card 2 — **Waiting on You**:
       - Value: Large bold integer (`32px`, `#92400E` amber if > 0, `#64748B` if 0).
       - Label: "Needs Your Attention".
       - Helper: "Tickets awaiting your feedback or comment".
       - Visual cue: Soft amber background `#FFFBEB` and border `#FDE68A` when count > 0.
       - Drill-down: Click routes to `/tickets?status=WAITING_FOR_REQUESTER`.
     - Card 3 — **Recently Resolved**:
       - Value: Large bold integer (`32px`, `#065F46`).
       - Label: "Resolved (Last 30 Days)".
       - Helper: "Completed service requests".
       - Drill-down: Click routes to `/tickets?tab=resolved`.
  3. **Recent Tickets Stream**:
     - Card container with title "My Recent Tickets" and link "View All Tickets $\to$".
     - Data table / mobile card view listing up to 5 most recently updated owned tickets:
       - Columns: Ticket # (mono link), Summary, Category, Priority Pill, Status Pill, Last Updated timestamp, Action button ("View").
- **State Handling**:
  - **Loading State**: Shimmering skeleton cards and table placeholder rows.
  - **Empty State (Zero Tickets)**: Clean pale green card (`#EAF6EF`) displaying: "You have no active support requests. Need IT assistance?" with a centered "+ Submit a New Ticket" button.
  - **Error State**: Red alert callout banner (`#FDF2F2`, text `#C5221F`) with a "Retry Loading Dashboard" button.
  - **Forbidden State**: If accessed by non-requester, redirect to `/staff/dashboard` or render standard 403 Forbidden page.

---

### 3.2 IT Staff & Administrator Dashboard Screen (`/dashboard`)

- **Target Persona**: `IT_STAFF`, `ADMINISTRATOR`.
- **Layout**: Full-width container, max-width `1200px`, padding `24px 20px`.
- **Components**:
  1. **Operational Header**:
     - Headline: "IT Staff Operations Dashboard" (`24px`, bold).
     - Subtitle: "Live queue metrics, priority triage, and system overview."
     - Refresh indicator: "Live as of {HH:MM:SS}" with manual "Refresh" icon button.
  2. **Top Operational Metric Cards (4-Column Grid)**:
     - Card 1 — **Unassigned Tickets**:
       - Counter: Bold integer. Highlighted with bold red text (`#C5221F`) and soft pink background (`#FFF1F2`) if count > 0.
       - Label: "Unassigned Tickets".
       - Drill-down: Click routes to `/staff/queue?filter=unassigned`.
     - Card 2 — **My Assigned Workload**:
       - Counter: Bold integer (`#006B3C`).
       - Label: "Assigned to Me".
       - Drill-down: Click routes to `/staff/queue?filter=my-assigned`.
     - Card 3 — **Urgent Attention**:
       - Counter: Bold integer. Red badge indicator if > 0.
       - Label: "Urgent Priority".
       - Drill-down: Click routes to `/staff/queue?priority=URGENT`.
     - Card 4 — **Awaiting Requester Response**:
       - Counter: Bold integer (`#D97706`).
       - Label: "Waiting for Requester".
       - Drill-down: Click routes to `/staff/queue?status=WAITING_FOR_REQUESTER`.
  3. **Queue Distribution Section (2-Column Grid)**:
     - Left Column — **Tickets by Status**: Horizontal pill bar breakdown showing counts for each of the 8 statuses.
     - Right Column — **Tickets by IT Priority**: Visual priority tiers (`URGENT`, `HIGH`, `MEDIUM`, `LOW`) with color badges.
  4. **Recent Queue Activity Table**:
     - Displays top 5 recently updated tickets across the entire service desk.
     - Columns: Ticket #, Summary, Requester Name, IT Priority, Status Pill, Assignee Name (or gray "Unassigned" chip), "Open Ticket" button.
  5. **Administrator User Summary Card (`ADMINISTRATOR` Role Only)**:
     - Dedicated container with Pale Indigo header border (`#C7D2FE`).
     - Title: "User Account Administration Overview".
     - Displays: Total Registered Accounts (counter), Active Accounts (green pill), Inactive Accounts (gray pill), and counts broken down by role (`REQUESTER`, `IT_STAFF`, `ADMINISTRATOR`).
     - Action Target: "+ Manage User Accounts" button routing to `/admin/users`.
- **State Handling**:
  - **Loading**: Skeleton shimmer blocks across metric cards and distribution bars.
  - **Empty Queue**: "The queue is currently clear! Zero open tickets pending."
  - **Error**: Red alert banner with retry action.
  - **Forbidden**: If accessed by `REQUESTER`, redirect to `/dashboard` (requester view).

---

### 3.3 Actions Taken Component on Ticket Detail View

- **File Locations**:
  - Embedded in `StaffTicketDetail.tsx` (Read/Write for IT Staff and Administrator).
  - Embedded in `TicketDetailView.tsx` (Strictly Read-Only for Requester).
- **Header Toolbar**:
  - Left: Title "Actions Taken" with counter badge pill `({count})`.
  - Right (Staff/Admin Only): "+ Record Action" primary button (`#006B3C`).

#### 3.3.1 Actions Taken List & Table Presentation
- **Desktop/Tablet Table View ($\ge$ 768px)**:
  - Columns:
    1. **Date / Time**: Formatted as `MMM DD, YYYY HH:MM` in user local time (`#64748B`).
    2. **Description**: Bold primary text summarizing the task performed.
    3. **Result**: Formatted narrative of the outcome/findings.
    4. **Status**: Action status pill (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`).
    5. **Performed By**: User badge with name and role.
    6. **Assignee**: User badge with assigned staff name, or muted "Unassigned" chip.
    7. **Follow-Up**:
       - If `followUpRequired === true`: Amber pill "Follow-Up Required" with tooltip/expandable preview of `followUpNote`.
       - If `false`: Muted dash "—".
    8. **Attachments**: File note chip if `attachmentNotes` exists.
    9. **Action (Staff/Admin Only)**: "Edit" button (`border: 1px solid #C8D2CC`).
- **Mobile Card View (< 768px)**:
  - Collapses into stacked cards with clear separators (`border: 1px solid #E2E8F0`).
  - Card Header: Date/Time on left, Status badge on right.
  - Body: Description (bold), Result, Performed By badge, Assignee badge.
  - Follow-up callout box in soft amber (`#FEF3C7`) if required.
  - Full-width "Edit Action" button at bottom of card (Staff/Admin only).
- **Read-Only Requester View**:
  - Identical data presentation, but "+ Record Action" button and all per-row "Edit" buttons are completely removed from the DOM.
- **Empty State**:
  - "No technical actions have been recorded for this ticket yet."

#### 3.3.2 Record / Create Action Modal Dialog
- **Modal Surface**: Centered dialog, `max-width: 580px`, white surface with rounded corners (`12px`) and backdrop scrim.
- **Form Fields & Validation**:
  1. **Action Description** (`*` Required):
     - Multiline textarea (rows: 3). Placeholder: "Describe the technical intervention, diagnostics, or configuration change...".
     - Validation: Required, trimmed length 1–2,000 characters.
  2. **Action Result** (`*` Required):
     - Multiline textarea (rows: 3). Placeholder: "Detail the outcome, test results, or current diagnostic findings...".
     - Validation: Required, trimmed length 1–2,000 characters.
  3. **Initial Status**:
     - Dropdown options: `COMPLETED` (default), `IN_PROGRESS`, `PENDING`, `CANCELLED`.
  4. **Assignee**:
     - Dropdown populated with active IT Staff and Administrator users (`isActive === true`).
     - Option label: `{Name} ({Role})`. Includes default "Leave Unassigned".
  5. **Follow-Up Required Toggle**:
     - Custom switch/checkbox: "Requires further follow-up action".
  6. **Follow-Up Note** (Conditionally Visible):
     - Rendered immediately beneath toggle when checked.
     - Label: "Follow-Up Instructions / Note" (`*` Required).
     - Textarea (rows: 2). Placeholder: "Explain what follow-up is needed, who should perform it, and when...".
     - Validation: Mandatory if toggle is true (1–1,000 characters).
  7. **Attachment Notes**:
     - Input field: "Reference Attachment Notes (e.g., photos, logs, receipt filenames)".
     - Optional string (max 1,000 characters).
- **Footer Buttons**:
  - "Cancel" button (secondary gray).
  - "Save Action Taken" primary button (`#006B3C`, disabled while submitting).

#### 3.3.3 Edit Action Modal Dialog & Concurrency Handling
- Pre-populates all fields from the target record.
- Embeds the record's current `version` integer in the payload.
- **Conflict Handling (HTTP 409)**:
  - If submission receives HTTP 409 `CONCURRENCY_CONFLICT`, the modal remains open, retains all entered edits, and displays a prominent warning alert at the top of the form:
    *"This action line was modified by another technician in another session. Please review the updated record and re-apply your changes."*
  - Includes a "Reload Latest Data" link to safely re-sync without page reload.

---

### 3.4 Ticket Status Controls (Authoritative Permitted Transitions)

In `StaffTicketDetail.tsx`, the status transition selector must **never show an arbitrary list of all 8 statuses**. It dynamically computes the target options based on the authoritative transition matrix:

```typescript
const PERMITTED_STATUS_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  NEW: ["OPEN", "IN_PROGRESS", "CANCELLED"],
  OPEN: ["IN_PROGRESS", "WAITING_FOR_REQUESTER", "CANCELLED"],
  IN_PROGRESS: ["WAITING_FOR_REQUESTER", "RESOLVED", "CANCELLED"],
  WAITING_FOR_REQUESTER: ["IN_PROGRESS", "RESOLVED", "CANCELLED"],
  RESOLVED: ["CLOSED", "REOPENED"],
  CLOSED: ["REOPENED"],
  REOPENED: ["IN_PROGRESS"],
  CANCELLED: [] // Terminal state: dropdown disabled with message "Ticket is cancelled"
};
```

- **UI Behavior**:
  - The dropdown renders **only** the permitted target states for `ticket.currentStatus`.
  - Next to the dropdown, the "Update Status" button sends `status` and `version: ticket.version`.
  - If `ticket.currentStatus === 'CANCELLED'`, the control is disabled with text: "Ticket is in a terminal state (Cancelled)".
  - **Resolution Gate UI**: When `ticket.isRequesterResolved === true`, a prominent callout banner is displayed above the status controls:
    *"Requester indicated the problem appears resolved. Please verify intervention results before formally marking status as RESOLVED."*
  - **Concurrency Conflict (HTTP 409)**: If status update fails with 409, display alert banner: *"Ticket status was updated by another user. Reloading latest state..."* and auto-refresh ticket data.

---

## 4. Accessibility (a11y) & Interaction Standards

1. **Visible Focus Indicators**:
   - Every interactive control (metric card click targets, form inputs, buttons, dropdowns, links) must display a high-contrast emerald focus ring:
     `outline: 2px solid #0B7A46; outline-offset: 2px;`
   - Never suppress outline on `:focus-visible`.
2. **Keyboard Trapping & Modal Navigation**:
   - Modals trap keyboard `Tab` focus within dialog bounds.
   - Pressing `Escape` closes the modal safely without submitting.
   - Closing a modal returns keyboard focus to the triggering element.
3. **Form Labels & Error Association**:
   - Every `<input>`, `<select>`, and `<textarea>` has an explicit `<label htmlFor="...">`.
   - Required fields feature an asterisk marked `<span className="text-danger" aria-hidden="true">*</span>`.
   - Field errors are linked via `aria-describedby="{field}-error"`.
4. **Non-Color Status Cues**:
   - Status indicators pair background colors with bold textual labels and iconography.
   - In high-contrast or monochrome mode, status distinctions remain 100% decipherable.
5. **Screen Reader Announcements**:
   - Dynamic loading and error states feature `role="status"` or `aria-live="polite"`.

---

## 5. Responsive Design Behavior Matrix

| Viewport Tier | Breakpoint Width | Layout Adaptations & Interaction Rules |
| :--- | :---: | :--- |
| **Desktop** | $\ge 992\text{px}$ | Multi-column grid (4-col for Staff Dashboard metrics, 3-col for Requester). Full multi-column data tables for recent tickets and Actions Taken. Modals centered at `max-width: 580px`. |
| **Tablet** | $768\text{px} - 991\text{px}$ | 2-column metric card grid. Actions Taken table wrapped in an accessible horizontal scroll container with sticky header. Minimum touch target height $\ge 44\text{px}$. |
| **Mobile** | $< 768\text{px}$ | Single-column stacked layout. Metric cards span 100% width. Actions Taken data table collapses into stacked cards. Navigation bar links collapse into clean responsive header. **Zero horizontal page scrolling.** |

---

## 6. Form Validation & Error Placement Standards

1. **Inline Field Errors**:
   - Rendered directly beneath the offending input field in `#C5221F` dark red text (`font-size: 13px; font-weight: 500`).
   - Input border turns red (`border-color: #C5221F; box-shadow: 0 0 0 1px #C5221F`).
2. **Form Top Summary Banner**:
   - Displayed at the very top of modals or pages upon API rejection (400, 403, 409, 500).
   - Container `#FDF2F2`, border `1px solid #F87171`, text `#991B1B`.
3. **Double-Click & Debounce Safeguards**:
   - Submit buttons immediately disable (`disabled={isSubmitting}`) upon first click and display a loading spinner ("Saving...", "Updating...").

---

## 7. Obsolete & Duplicate UI Elements to Remove

To ensure code cleanliness, visual consistency, and satisfy Handout Section 8.5 ("remove temporary, duplicate, obsolete, or inconsistent UI elements left from earlier labs"), the following legacy artifacts must be pruned:

1. **`RequesterSelectorScreen.tsx` (Prune)**:
   - *Reason:* A temporary Lab 2 development modal allowing arbitrary requester selection before Lab 3 session authentication was implemented. Replaced by authentic JWT session authentication and role-based login.
2. **`toktickit_selected_requester` LocalStorage Synchronization (Prune)**:
   - *Reason:* Legacy client-side user state from Lab 2. Session state is now authoritatively governed by `/api/auth/me`.
3. **Hardcoded Status Dropdowns**:
   - *Reason:* Any static dropdown rendering all 8 statuses unconditionally is replaced by the dynamic matrix-computed status selector.
4. **Duplicate E2E Test Artifact Directories**:
   - *Reason:* Ensure Playwright screenshots write exclusively to `artifacts/lab-04/screenshots/` without legacy duplicate directories.
