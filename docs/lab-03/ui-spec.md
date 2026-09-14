# Lab 3 Zen Green Theme & UI Specification

## 1. Design Tokens & Color Palette

The interface strictly reuses the **Zen Green Theme** visual language established in Lab 2, extended with clear visual distinction for role badges, operational queue statuses, and confidential Internal Notes.

| Token / Element | Color Code / Style | Intended Usage |
| :--- | :--- | :--- |
| **Primary Green** | `#006B3C` | App header background, primary call-to-action buttons, strong brand emphasis. |
| **Secondary Green** | `#0B7A46` | Active navigation indicators, link hover states, focus accents. |
| **Pale Green** | `#EAF6EF` | Selected item background, success callouts, subtle section highlights. |
| **Page Background** | `#F5F7F6` | Main page background (quiet off-white). |
| **Surface / Cards** | `#FFFFFF` | Form containers, data tables, card surfaces with `border: 1px solid #E0E6E2` and subtle shadow (`0 2px 4px rgba(0,0,0,0.05)`). |
| **Primary Text** | `#1F2925` | Dark charcoal-green for high-contrast, comfortable body reading. |
| **Muted Text** | `#65756E` | Subtitles, helper text, timestamps, read-only field labels. |
| **Error State** | `#C5221F` | Dark red text, asterisks (`*`), error alert banners (`#FDF2F2`, border `#F87171`). |
| **Warning State** | `#D97706` | Amber badge/callout for warning notifications. |
| **Internal Note Highlight** | `#FEF3C7` (BG), `#FDE68A` (Border), `#92400E` (Header) | Amber/yellow container styling distinguishing private Internal Notes from Public Comments. |

### Role Badge Palette
- **Requester**: Background `#DBEAFE`, Text `#1E40AF`, Border `#BFDBFE` (Pale Blue)
- **IT Staff**: Background `#D1FAE5`, Text `#065F46`, Border `#A7F3D0` (Pale Emerald)
- **Administrator**: Background `#E0E7FF`, Text `#3730A3`, Border `#C7D2FE` (Pale Indigo)

---

## 2. Application Shell & Navigation Layout

### Header Navigation Bar
- **Background**: Primary Green (`#006B3C`), Height `60px`, Padding `0 24px`.
- **Branding**: "TokTickIT" text logo in crisp white, linking to the user's primary landing screen based on role.
- **Role-Based Navigation Links**:
  - `REQUESTER`: "My Tickets", "Create Ticket"
  - `IT_STAFF`: "Ticket Queue"
  - `ADMINISTRATOR`: "User Management"
- **User Identity & Controls (Right Aligned)**:
  - User Name (bold)
  - Role Badge (Requester / IT Staff / Administrator)
  - Logout Button (`#FFFFFF` background, `#1F2925` text, `border: 1px solid #C8D2CC`)

---

## 3. Screen Specifications

### 3.1 Login Screen (`/login`)
- **Layout**: Centered card container (`max-width: 440px`), vertically centered on `#F5F7F6` background.
- **Header**: TokTickIT logo, Title "Sign in to your account", subtitle "Enter your email and password to access the support portal".
- **Form Controls**:
  - **Email Address**: Input type `email`, required (`*`), placeholder `user@example.com`.
  - **Password**: Input type `password`, required (`*`), show/hide password toggle icon.
  - **Error Alert Banner**: Container `#FDF2F2`, text `#C5221F` for invalid credentials or inactive accounts.
  - **Submit Button**: Primary Green `#006B3C`, full-width, label "Sign In" (busy state: "Signing In...").

### 3.2 Mandatory Password Change Screen (`/change-password`)
- **Layout**: Centered card container (`max-width: 480px`).
- **Notice Banner**: Pale Green `#EAF6EF` callout: "First-Time Login: You must change your initial password before accessing the application."
- **Form Controls**:
  - **Current Password**: Input type `password`, required.
  - **New Password**: Input type `password`, required.
  - **Confirm New Password**: Input type `password`, required.
  - **Complexity Rule Indicators**: Real-time checklist showing:
    - Min 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one number
  - **Submit Button**: Primary Green `#006B3C`, full-width, label "Update Password & Continue".

### 3.3 IT Staff Ticket Queue (`/staff/queue`)
- **Layout**: Full-width container with max-width `1200px`.
- **Header Section**: Title "IT Support Ticket Queue", total active queue count badge.
- **Filter & Search Toolbar**:
  - **Search Input**: Full-width keyword search (Ticket #, Summary, Description).
  - **Category Dropdown**: Filter by active categories.
  - **Status Dropdown**: Filter by `NEW`, `OPEN`, `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, `RESOLVED`, `CLOSED`, `CANCELLED`.
  - **Requested Priority & IT Priority Dropdowns**: Filter by `LOW`, `MEDIUM`, `HIGH`, `URGENT`.
  - **Ownership Filter**: `All Tickets`, `Unassigned`, `Assigned to Me`.
  - **Clear Filters Button**: Resets all filters to defaults.
- **Data Table (Desktop ≥ 992px)**:
  - **Columns**: Ticket #, Submitted Date, Requester, Summary, Category, Requested Priority, IT Priority, Status Badge, Owner Badge, Action ("Open").
  - **Unassigned Row Styling**: Highlighted with subtle indicator for unassigned items.
- **Mobile Card View (< 768px)**:
  - Stacked card layout displaying Ticket #, Status Pill, Summary (bold), Requester Name, IT Priority, Owner Badge, and "Open Ticket" button.

### 3.4 IT Staff Ticket Detail & Operational View (`/staff/tickets/:id`)
- **Header**: Ticket # (`TKT-YYYY-XXXXXX`), Date, Status Badge, "Back to Queue" button.
- **Operational Toolbar (IT Staff / Admin Only)**:
  - **Ownership Selector**: Dropdown listing active IT Staff & Admin users + "Claim Ticket" quick action button.
  - **IT Priority Selector**: Dropdown to update `itPriority` (`LOW`, `MEDIUM`, `HIGH`, `URGENT`).
  - **Status Transition Selector**: Dropdown displaying ONLY permitted statuses based on BR-10 matrix + "Update Status" button.
- **Read-Only Ticket Metadata Grid**: Summary, Detailed Description, Category, Related System, Requester Info (Name, Email).
- **Requester Resolution Indicator**: Highlighted callout if Requester marked `isRequesterResolved = true` ("Requester indicates problem appears resolved").
- **Tabbed / Dual Communication Stream**:
  - **Public Comments Tab**: Shared message stream visible to Requester, IT Staff, and Admin. Display author name, role badge, timestamp, and message. Append textarea form (`1-1000` chars) with "Post Public Comment" button.
  - **Internal Notes Tab (Staff & Admin Only)**: Distinct amber-shaded container (`#FEF3C7`) with clear header "Confidential Internal Notes (Staff & Admin Only)". Display author name, staff role badge, timestamp, and private note. Append textarea form with "Add Internal Note" button.
- **File Attachments Section**: Active attachments list with Download buttons + Soft-Removed metadata list (Download Disabled - 410 Gone).

### 3.5 Administrator User Management View (`/admin/users`)
- **Layout**: Centered container (`max-width: 1100px`).
- **Header**: Title "User Management", "+ Create User" Primary Button.
- **Toolbar**: Search input (Name or Email), Role Filter (`All Roles`, `REQUESTER`, `IT_STAFF`, `ADMINISTRATOR`).
- **User Data Table**:
  - **Columns**: Name, Email, Role Badge, Account Status (`Active` green badge / `Inactive` gray badge), Actions (`Edit`, `Reset Password`).
- **Create / Edit User Modal Dialog**:
  - Modal surface (`max-width: 520px`).
  - **Fields**: Full Name (`*`), Email Address (`*`), Role (`*` select), Account Active Toggle (`Yes / No`).
  - **Initial Password Field (Create Only)**: Password field set by Admin, flagged for first-login change.
  - **Safety Checks**: Server-side error alert if attempting self-deactivation or deactivating the last Admin.
- **Reset Initial Password Modal Dialog**:
  - Text warning: "This will set a new initial password. The user will be required to change this password upon their next login."
  - New Initial Password input (`*`), "Set Initial Password" button.

---

## 4. Responsive Behavior Matrix

| Viewport Size | Layout Adaptation |
| :--- | :--- |
| **Desktop (≥ 992px)** | Full multi-column data tables, side-by-side filter grids, modal dialogs centered at `max-width: 540px`. |
| **Tablet (768px - 991px)** | 2-column filter grids, table horizontal scroll wrappers, touch-friendly dropdown controls. |
| **Mobile (< 768px)** | Single-column stacked forms, data tables collapse into stacked cards, full-width touch targets (≥ 44px), zero horizontal page overflow. |

---

## 5. Accessibility & Interaction Rules (a11y)

- All form controls have associated `<label htmlFor="...">` elements and `aria-required="true"` markers.
- Interactive controls feature visible focus rings (`2px solid #0B7A46`, `outline-offset: 2px`).
- Status badges use text labels alongside background color styling (never color alone).
- Modal dialogs trap focus, handle `Escape` key close, and return focus upon closure.
