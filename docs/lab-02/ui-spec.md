# Lab 2 Zen Green Theme & UI Specification

## 1. Design Tokens & Color Palette

The interface adheres strictly to the **Zen Green Theme** visual language across all screens:

| Token / Element | Color Code / Style | Intended Usage |
| :--- | :--- | :--- |
| **Primary Green** | `#006B3C` | App header background, primary call-to-action buttons, strong brand emphasis. |
| **Secondary Green** | `#0B7A46` | Active tab indicators, link hover states, focus accents, interactive highlights. |
| **Pale Green** | `#EAF6EF` | Selected item background, success callouts, subtle section highlights. |
| **Page Background** | `#F5F7F6` | Main page background (quiet off-white). |
| **Surface / Cards** | `#FFFFFF` | Form cards, table containers, modal surfaces with `border: 1px solid #E0E6E2` and subtle shadow (`0 2px 4px rgba(0,0,0,0.05)`). |
| **Primary Text** | `#1F2925` | Dark charcoal-green for high-contrast, comfortable reading. |
| **Muted Text** | `#65756E` | Subtitles, helper text, timestamps, read-only labels. |
| **Editable Field** | `#FFFFFF` | Background for input controls with neutral border (`#C8D2CC`). |
| **Read-Only Field** | `#F0F4F2` | Soft gray-green shading clearly distinguishing non-editable values. |
| **Error State** | `#C5221F` | Dark red text and border; validation message appears immediately below field. |
| **Warning State** | `#D97706` | Amber badge/callout for warning notifications. |
| **Success State** | `#006B3C` | Green confirmation callout with readable text and icon indicator. |

---

## 2. Typography & Spacing System
- **Font Family**: System UI Stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`).
- **Heading 1**: 24px, Bold, `#1F2925`.
- **Heading 2**: 20px, Semi-Bold, `#1F2925`.
- **Heading 3 / Subtitle**: 16px, Medium, `#1F2925`.
- **Body Text**: 14px, Regular, `#1F2925` (line-height: 1.5).
- **Caption / Helper**: 12px, Regular, `#65756E`.
- **Spacing Scale**: 4px, 8px, 12px, 16px, 24px, 32px padding/margin increments.

---

## 3. Component & Control Rules

### Labels & Fields
- Field labels appear above input controls using `13px, Medium, #1F2925`.
- Required fields display a red asterisk (`*` in `#C5221F`) after the label text.
- Validation error messages appear immediately below the affected field in red (`#C5221F`, 12px).
- All text inputs have a uniform height of `40px` (`min-height: 40px`). Multiline `Description` textareas have `min-height: 120px` and are vertically resizable only.

### Buttons & States
- **Primary Button**: Background `#006B3C`, Text `#FFFFFF`, Hover `#0B7A46`, Active `#00522E`.
- **Secondary Button**: Background `#FFFFFF`, Border `1px solid #C8D2CC`, Text `#1F2925`, Hover Background `#F5F7F6`.
- **Destructive Button**: Background `#C5221F`, Text `#FFFFFF`, Hover `#9E1B18`.
- **Disabled State**: Opacity `0.5`, `cursor: not-allowed`, background `#E0E6E2`, text `#65756E`.
- **Busy / Loading State**: Shows a spinner icon, disables user interaction, and retains visible label (e.g. "Submitting...").

---

## 4. Application Shell Navigation Layout
- **Header Bar**: Background `#006B3C`, Height `60px`, Padding `0 24px`.
- **Logo / Branding**: "TokTickIT" text and logo icon in white.
- **Navigation Links**:
  - `My Tickets` (`/tickets`)
  - `Create Ticket` (`/tickets/new`)
- **Active Navigation State**: Underlined or highlighted with Pale Green pill background (`#EAF6EF` at 20% opacity).
- **User Identity Display**: Right-aligned profile dropdown showing selected Development Requester name (e.g. "Jennifer Anderson") with a "Change Requester" action button.

---

## 5. Screen Layout Specifications

### 5.1 Development Requester Selection Screen
- **Layout**: Centered card surface (`max-width: 540px`) on `#F5F7F6` background.
- **Header**: Icon (`UserCheck`), Title "Select Development Requester", Subtitle explaining this is for Lab 2 testing purposes only.
- **Form Controls**:
  - Dropdown selector listing active Requesters from PostgreSQL.
  - Informational notice box in Pale Green (`#EAF6EF`) stating: "Authentication coming in Lab 3".
  - Actions: "Cancel" (Secondary) and "Continue" (Primary).
- **States**:
  - *Loading*: Skeleton loader inside select box.
  - *Empty*: Alert message "No active requesters available".
  - *API Error*: Red error banner with retry button.

### 5.2 Create Ticket Screen Layout
- **Layout**: Centered form container (`max-width: 800px`).
- **Header Section**: Page Title "Create Support Ticket", subtitle.
- **Fields Arrangement**:
  - Top Grid (2-column on desktop): Category dropdown, Related System dropdown.
  - Priority Section: Requested Priority selector (Radio group or Select: Low, Medium, High, Urgent).
  - Summary Field: Full width, required (`*`), 5-100 chars.
  - Description Field: Full width, multiline, required (`*`), 10-1000 chars.
  - Attachment Upload Box: Dropzone area accepting JPG, PNG, WEBP, PDF (max 5MB, max 5 files).
- **Footer Actions**: "Cancel" button and "Submit Ticket" primary button.

### 5.3 My Tickets Screen Layout
- **Header**: Title "My Tickets", "Create Ticket" primary button.
- **Filters & Search Toolbar**:
  - Search Input with magnifying glass icon (filters Ticket Number, Summary, Description).
  - Dropdown Filters: Category, Requested Priority, Status.
  - Sort Dropdown: Date (Newest first), Priority.
- **Desktop Table View (≥992px)**:
  - Columns: Ticket No., Created Date, Summary, Category, Priority Badge, Status Badge, Last Updated.
  - Hover row highlight: `#F5F7F6`.
- **Mobile Card Layout (<768px)**:
  - Stacked cards with Ticket No. at top left, Status badge top right, Summary in bold, Category and Date below.
- **Pagination Controls**: Page numbers, Previous / Next buttons, showing "Showing X-Y of Z tickets".
- **States**:
  - *Loading*: Table row skeleton loaders.
  - *Empty State*: "You have not submitted any tickets yet." with a Create Ticket CTA.
  - *No Results*: "No tickets found matching your filters." with a Clear Filters CTA.

### 5.4 Requester Ticket Detail Screen Layout
- **Layout**: Read-only form container (`max-width: 900px`).
- **Header**: Ticket Number (`TKT-YYYY-XXXXXX`), Date, Status Badge, "Back to My Tickets" button.
- **Field Grouping**: Read-only grid displaying Category, Related System, Requester Name, Requested Priority, Summary, Description. Read-only fields have soft gray-green background (`#F0F4F2`).
- **Attachment Section**:
  - Active Attachments Table: Filename, File Size, Upload Date, Download Action button, Soft-Remove Action button.
  - Soft-Removed Attachments Table: Filename, Size, Removed Reason, Removed Date (Download disabled, tagged with "Removed" badge).
  - Add Attachment button to append new files to existing ticket.
- **Soft Removal Confirmation Modal**:
  - Dialog title: "Confirm Attachment Removal".
  - Required textarea field: "Reason for removal" (min 5 chars).
  - Actions: "Cancel" and "Confirm Soft Removal" (Destructive red button).

---

## 6. Responsive Behavior Matrix

| Viewport Size | Layout Behavior |
| :--- | :--- |
| **Desktop (≥ 992 px)** | Multi-column grid layout; centered container with `max-width: 1000px`; full table view for My Tickets. |
| **Tablet (768 px - 991 px)** | 2-column forms collapse to 1-column where space is constrained; table remains visible with scroll wrapper. |
| **Mobile (< 768 px)** | 1-column stacked layout; My Tickets table transforms into responsive card list; touch-friendly buttons (`min-height: 44px`); zero horizontal scrolling. |

---

## 7. Accessibility Rules (a11y)
- All interactive controls have visible focus rings (`2px solid #0B7A46`, `outline-offset: 2px`).
- Icon-only buttons must include `aria-label` and `title` attributes.
- Badges and status indicators do not rely on color alone (text label always accompanies color styling).
- Form inputs have associated `<label htmlFor="...">` elements.
- Modal dialogs trap focus and respond to `Escape` key.
