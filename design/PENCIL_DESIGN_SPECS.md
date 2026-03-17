# Modology Cabinet Designer - Pencil.dev Design Specifications

This document contains design prompts and specifications for generating frontend designs using [Pencil.dev](https://pencil.dev).

## 🎨 Brand Guidelines

### Color Palette

```
Primary: #2563EB (Blue - Trust, Professionalism)
Secondary: #059669 (Green - Growth, Wood, Nature)
Accent: #D97706 (Orange - Creativity, DIY Spirit)
Neutral Dark: #1F2937 (Dark Gray - Text)
Neutral Light: #F9FAFB (Light Gray - Background)
Warning: #DC2626 (Red - Errors, Alerts)
Success: #10B981 (Green - Success States)
```

### Typography

```
Headings: Inter Bold (Modern, Clean, Professional)
Body: Inter Regular (Readable, Friendly)
Monospace: JetBrains Mono (Measurements, Code)
```

### Design Principles

1. **Clarity over complexity** - DIYers need intuitive interfaces
2. **Visual feedback** - Show progress and results clearly
3. **Mobile-first** - Many users will be in workshops/garages
4. **Accessibility** - High contrast, large touch targets
5. **Wood/Workshop aesthetic** - Warm tones, natural textures

---

## 📱 Screen Designs

### 1. Dashboard / Home Screen

**Pencil Prompt:**
```
Create a modern dashboard for a cabinet design app targeting woodworkers and DIY enthusiasts. 

Layout:
- Top navigation bar with logo, search, notifications, and user avatar
- Sidebar with main navigation (My Projects, Templates, Hardware, Settings)
- Main content area with:
  - Welcome card showing user's recent projects (2x2 grid)
  - Quick actions row (New Project, Import Template, Hardware Finder)
  - "Continue where you left off" section with last 3 projects
  - Statistics cards: Total Projects, Materials Saved, Hardware Items
  - Community highlights carousel

Style: Clean, modern SaaS dashboard with woodworking theme
Colors: Blue primary (#2563EB), wood-toned accents
Typography: Inter font family
Include: Search bar, notification bell, user dropdown menu
Mobile: Responsive sidebar that collapses to hamburger menu
```

---

### 2. Cabinet Builder (Main Workspace)

**Pencil Prompt:**
```
Design a professional cabinet builder workspace for DIY woodworkers.

Layout (Desktop):
- Left sidebar (300px): Component palette
  - Drag-and-drop cabinet components (boxes, doors, drawers, shelves)
  - Component categories with expandable sections
  - Search/filter components
  - Recent components section

- Center canvas (flexible): 
  - 3D preview viewport with orbit controls
  - Grid background with measurement markers
  - Zoom controls (zoom in/out, fit to screen, reset view)
  - View mode toggle (3D, 2D Top, 2D Front, 2D Side)
  - Component selection highlights with transform handles

- Right sidebar (320px): Properties panel
  - Selected component properties (dimensions, material, position)
  - Material selector with preview thumbnails
  - Hardware recommendations (context-aware)
  - Quick actions: Duplicate, Delete, Lock position
  - Cost preview card

- Bottom panel (collapsible):
  - Cut list preview with material breakdown
  - Timeline/version history
  - Notes and comments

Style: Professional CAD tool meets modern SaaS
Features: 
- Real-time 3D preview with Three.js style rendering
- Drag indicators when hovering
- Snap-to-grid visual feedback
- Measurement tooltips on hover
- Undo/redo toolbar
- Save status indicator
```

**Mobile Version Prompt:**
```
Design a mobile cabinet builder interface for tablets and phones.

Layout:
- Top bar: Back button, project name, save status, more menu
- Main area: 3D preview (touch to rotate, pinch to zoom)
- Bottom tab bar: Components | Preview | Properties | Export
- Floating action button: Add component

Components Tab:
- Scrollable list of component cards with thumbnails
- Tap to add, long-press for options

Preview Tab:
- Full-screen 3D view with gesture controls
- Tap to select, double-tap to edit

Properties Tab:
- Scrollable form with all properties
- Large touch targets (44px minimum)
- Steppers for numeric values

Export Tab:
- Export options as large buttons
- Preview thumbnails for each format
```

---

### 3. Template Gallery

**Pencil Prompt:**
```
Design a template gallery for pre-built cabinet configurations.

Layout:
- Top search and filter bar
  - Search input with icon
  - Filter chips: Kitchen, Bathroom, Garage, Office, Living Room
  - Sort dropdown: Popular, Newest, Easiest First

- Main grid (responsive):
  - Template cards (300px width, variable height)
  - Each card shows:
    - 3D preview thumbnail (16:9 aspect ratio)
    - Template name and category badge
    - Difficulty indicator (Beginner/Intermediate/Advanced)
    - Estimated time and cost
    - Star rating from community
    - "Use Template" button on hover

- Sidebar filters (desktop):
  - Style filters: Shaker, Flat-panel, Raised-panel, Modern
  - Difficulty level checkboxes
  - Price range slider
  - Room type checkboxes

Style: Pinterest-style grid with woodworking aesthetic
Cards: Hover effects showing quick preview and action buttons
Empty state: "No templates match your filters" with clear filters button
```

---

### 4. Hardware Finder

**Pencil Prompt:**
```
Design a hardware finder interface for cabinet hardware shopping.

Layout:
- Left sidebar (280px):
  - Category tree navigation
  - Active filters display
  - Price range slider
  - Supplier filter checkboxes

- Top bar:
  - Search input with autocomplete
  - View toggle (grid/list)
  - Sort dropdown

- Main area:
  - Product grid (4 columns desktop, 2 mobile)
  - Each product card:
    - Product image (200px)
    - Product name (2 lines max)
    - Price with supplier badge
    - Rating stars
    - "Add to Project" button
    - "Compare" checkbox
    - "Buy" link to supplier

- Comparison bar (bottom, when items selected):
  - Shows selected products side by side
  - Compare specifications table
  - Clear all / Remove individual items

- Quick view modal:
  - Product details
  - Specifications table
  - Compatible cabinets from user's projects
  - Similar products carousel

Style: E-commerce product grid with clean, minimal aesthetic
Suppliers: Show supplier logos (Rockler, Home Depot, Lowe's, etc.)
```

---

### 5. Cut List Export

**Pencil Prompt:**
```
Design a cut list generation and export interface.

Layout:
- Top section: Project summary
  - Project name and thumbnail
  - Total sheets needed
  - Waste percentage visualization
  - Cost breakdown card

- Main area: Cut list table
  - Sortable columns: Part Name, Quantity, Dimensions, Material, Edge Banding
  - Grouped by material type (collapsible sections)
  - Selectable rows with bulk actions
  - Search/filter within list

- Right sidebar: Preview panel
  - 2D sheet layout preview
  - Sheet navigation (Sheet 1, 2, 3...)
  - Zoom controls
  - Print preview button

- Bottom actions:
  - Export buttons: PDF, CSV, DXF, G-code
  - Share link button
  - Print button
  - Save to project button

- G-code specific modal:
  - Machine profile selector (ShopBot, Shapeoko, X-Carve)
  - Feed rate settings
  - Tab/bridge configuration
  - Preview generated code
  - Download button

Style: Technical but approachable, like professional CAD software
Tables: Alternating row colors, sticky headers
Exports: Clear icon buttons with format labels
```

---

### 6. Localization / Supplier Finder

**Pencil Prompt:**
```
Design a local supplier finder interface for woodworking materials.

Layout:
- Top section: Location input
  - Zip code input with autocomplete
  - "Use My Location" button with GPS icon
  - Radius slider (5-100 miles)

- Filter bar:
  - Category chips: Plywood, Hardware, Tools, Finishes, Hardwood
  - Store type chips: Big Box, Hardware Chain, Specialty, Lumber Yard

- Main area: Store cards
  - Store card design:
    - Store logo and name
    - Distance in miles
    - Address with directions link
    - Phone number (clickable)
    - Price tier indicator (Budget/Mid/Premium)
    - Category tags
    - "View Inventory" button
    - Store hours indicator (Open/Closed)

- Tabs: All Stores | By Category | Price Comparison

- Price comparison tab:
  - Item search input
  - Comparison table with prices from different stores
  - In-stock indicators
  - "Add to Cart" buttons

- Map view option:
  - Toggle between list and map
  - Markers for store locations
  - Current location blue dot
  - Click marker for store card popup

Style: Google Maps meets Yelp for woodworking
Cards: Clean, scannable, with quick action buttons
Mobile: Swipeable store cards with bottom sheet details
```

---

### 7. Design Doctor

**Pencil Prompt:**
```
Design a design analysis interface that checks for common mistakes.

Layout:
- Left panel: Issue list
  - Severity indicators (Critical, Warning, Info)
  - Issue category icons
  - Affected component name
  - Quick description
  - Click to highlight in design

- Center: Design preview
  - 3D view with highlighted problem areas
  - Red outline for critical issues
  - Yellow outline for warnings
  - Blue outline for suggestions
  - Click on highlight to see details

- Right panel: Issue details
  - Issue title and severity badge
  - Detailed explanation
  - Why it's a problem
  - Suggested fix with step-by-step
  - "Auto-fix" button (if available)
  - "Ignore" button with reason dropdown
  - "Learn more" link to documentation

- Top summary bar:
  - Total issues count
  - By severity breakdown
  - "Fix All" button
  - Export report button

- Bottom progress:
  - Issues fixed counter
  - Remaining issues
  - Overall design health score (0-100)

Style: IDE error panel meets medical interface
Severity: Use clear color coding and icons
Auto-fix: Show before/after preview
```

---

### 8. Cost Optimizer / "Best Bang for Your Buck"

**Pencil Prompt:**
```
Design a cost optimization report interface.

Layout:
- Top summary card:
  - Current total cost
  - Potential savings amount (highlighted in green)
  - Percentage savings possible
  - "Apply All Suggestions" button

- Main area: Optimization suggestions
  - Grouped by category (Materials, Hardware, Alternatives)
  - Each suggestion card:
    - Current item vs suggested alternative
    - Price comparison (old vs new)
    - Quality impact rating (None, Minor, Moderate)
    - Pros and cons bullet list
    - "Apply" button
    - "Dismiss" button

- Right sidebar: Impact preview
  - Updated cost breakdown chart
  - Quality score impact
  - Project timeline impact

- Bulk purchasing suggestions:
  - "Buy these items together" sections
  - Bundle savings amount
  - Supplier recommendation

- Bottom actions:
  - Export optimization report
  - Create shopping list
  - Share with team

Style: Financial dashboard with clear savings highlights
Charts: Bar charts for cost comparison, donut for breakdown
Suggestions: Cards with clear accept/reject actions
```

---

### 9. Community Gallery

**Pencil Prompt:**
```
Design a community showcase gallery for completed projects.

Layout:
- Hero section:
  - Featured build carousel
  - Large images with project title overlay
  - Builder name and avatar
  - Like count and comment count

- Filter bar:
  - Category tabs: All, Kitchen, Bathroom, Garage, Office, Other
  - Sort: Most Liked, Most Recent, Most Discussed
  - Search input

- Main grid (Masonry layout):
  - Variable height cards
  - Project photo (uploaded by user)
  - Project title
  - Builder info (avatar, name)
  - Quick stats: Cost, Time, Materials
  - Like button (heart icon)
  - Save to favorites button

- Project detail modal:
  - Full photo gallery with thumbnails
  - Project description
  - Materials list
  - Cost breakdown
  - Time invested
  - Lessons learned section
  - Builder profile card
  - Comments section
  - Related projects carousel

- User profile sidebar:
  - Avatar and stats
  - Total builds
  - Followers/Following
  - Badges earned

Style: Instagram/Pinterest hybrid for woodworking
Photos: High quality, workshop aesthetic
Engagement: Clear like/comment/share actions
```

---

### 10. Brag Sheet Generator

**Pencil Prompt:**
```
Design a social media share generator for completed projects.

Layout:
- Left panel: Project selection
  - Recent projects dropdown
  - Project preview thumbnail
  - Auto-populate button

- Center: Preview canvas
  - Social media post preview
  - Platform selector tabs: Instagram, Facebook, Pinterest, Twitter
  - Live preview updates as you edit

- Right panel: Customization
  - Template selector (carousel of templates)
  - Caption editor with character count
  - Hashtag suggestions (click to add)
  - Statistics to include (checkboxes):
    - Cost breakdown
    - Time invested
    - Materials used
    - Before/after photos
  - Photo selection grid
  - Watermark toggle

- Bottom actions:
  - Download image button
  - Copy caption button
  - Share directly buttons (platform icons)

Template options:
- "Before & After" split template
- "Stats Card" with key metrics
- "Timeline" showing project phases
- "Cost Breakdown" with pie chart
- "Material List" with icons

Style: Social media creation tool
Preview: Show exact dimensions for each platform
Templates: Professional, shareable designs
```

---

### 11. Mobile Companion App

**Pencil Prompt:**
```
Design a mobile companion app for cabinet builders in the workshop.

Home Screen:
- Top: Greeting with user name, today's projects
- Quick actions grid (2x2):
  - View Cut Lists
  - Scan Barcode
  - Material Calculator
  - Take Photo
- Active projects carousel
- Shopping list summary card
- Offline mode indicator

Bottom Navigation:
- Home | Projects | Tools | Profile

Cut List View:
- Material tabs (Plywood, MDF, Hardware)
- Each item shows:
  - Part name
  - Dimensions (large text)
  - Check off checkbox
  - Notes indicator
- Progress bar showing completion
- "Mark All Done" button

Barcode Scanner:
- Camera viewfinder with scanning frame
- Product info overlay when detected
- "Add to Inventory" button
- Manual search fallback

Material Calculator:
- Quick input fields (length, width, quantity)
- Material type selector
- Result: Sheets needed, cost estimate
- "Add to Shopping List" button

Photo Notes:
- Camera capture
- Annotate with drawings
- Voice note option
- Attach to project

Style: High contrast, large text, workshop-friendly
Dark mode: Default (easier to see in bright workshop)
Offline: Clear indicator when offline
```

---

### 12. Authentication Screens

**Sign Up Prompt:**
```
Design a sign up page for cabinet design app.

Layout:
- Left side (desktop only): Hero image of beautiful finished cabinets
- Right side: Sign up form
  - Logo at top
  - Welcome headline: "Start Building Your Dream Cabinets"
  - Social sign up: Google, Apple buttons
  - Divider: "or sign up with email"
  - Form fields: Name, Email, Password
  - Password strength indicator
  - Terms checkbox
  - "Create Account" button (primary)
  - "Already have an account? Sign in" link

Mobile:
- Full screen form
- Logo at top
- Collapsible hero image

Style: Clean, minimal, trustworthy
Trust signals: Security badges, testimonials snippet
```

**Sign In Prompt:**
```
Design a sign in page.

Layout:
- Similar structure to sign up
- Simplified form: Email, Password
- "Remember me" checkbox
- "Forgot password?" link
- "Sign In" button
- "Don't have an account? Sign up" link

Error states:
- Inline validation messages
- Shake animation on error
- Helpful recovery suggestions
```

---

### 13. Pricing Page

**Pencil Prompt:**
```
Design a pricing page for SaaS cabinet design tool.

Layout:
- Top section:
  - Headline: "Choose Your Plan"
  - Subheadline: "Start free, upgrade when you're ready"
  - Monthly/Annual toggle (with discount badge)

- Pricing cards (4 columns):
  - Free tier:
    - "Free" label
    - $0/month price
    - Feature list (checkmarks)
    - "Get Started" button (secondary)
  
  - Hobbyist tier:
    - "Hobbyist" label
    - $9/month price
    - Feature list
    - "Most Popular" badge
    - "Start Free Trial" button (primary)
  
  - Pro tier:
    - "Pro" label
    - $29/month price
    - Feature list
    - "Start Free Trial" button
  
  - Shop tier:
    - "Shop" label
    - $79/month price
    - Feature list
    - "Contact Sales" button

- Comparison table below cards
- FAQ accordion section
- Money-back guarantee badge

Style: Modern SaaS pricing with clear differentiation
Popular tier: Highlighted with border and badge
CTAs: Clear hierarchy between primary and secondary buttons
```

---

### 14. Settings Page

**Pencil Prompt:**
```
Design a settings page for user preferences.

Layout:
- Left sidebar navigation:
  - Profile
  - Account
  - Notifications
  - Units & Measurements
  - Default Materials
  - Connected Accounts
  - Billing
  - Privacy
  - Danger Zone

- Main content area:
  - Section header
  - Form fields organized by group
  - Save button at bottom

Profile section:
- Avatar upload
- Name, email, bio fields
- Timezone selector

Units section:
- Measurement system toggle (Imperial/Metric)
- Fraction display preferences
- Currency selector

Default Materials:
- Preferred plywood type
- Default edge banding
- Favorite suppliers

Style: Clean settings interface like GitHub or Notion
Forms: Logical grouping, clear labels
Actions: Destructive actions in red with confirmation
```

---

## 🧩 Component Library

### Buttons

**Pencil Prompt:**
```
Design a button component system for cabinet design app.

Button variants:
1. Primary (filled blue): Main actions like "Save", "Export", "Create"
2. Secondary (outline): Secondary actions like "Cancel", "Back"
3. Ghost (text only): Tertiary actions like "Learn More"
4. Danger (red): Destructive actions like "Delete", "Remove"
5. Success (green): Positive actions like "Complete", "Approve"

Button sizes:
- Small (32px): Compact UIs, tables
- Medium (40px): Default
- Large (48px): Hero actions, mobile

States:
- Default, Hover, Active, Disabled, Loading

Include:
- Icon buttons (icon only)
- Icon + text combinations
- Button groups
- Split buttons with dropdown
```

### Form Inputs

**Pencil Prompt:**
```
Design form input components.

Input types:
1. Text input (single line)
2. Textarea (multi-line)
3. Number input with steppers
4. Dimension input (with unit selector)
5. Search input (with icon)
6. Dropdown select
7. Multi-select with chips
8. Checkbox
9. Radio button
10. Toggle switch
11. Date picker
12. File upload (drag and drop)

States:
- Default, Focused, Filled, Error, Disabled

Features:
- Labels (above input)
- Helper text (below input)
- Error messages (below input, red)
- Character count
- Required indicator (*)
```

### Cards

**Pencil Prompt:**
```
Design card component system.

Card types:
1. Project card (thumbnail, title, stats)
2. Template card (preview, name, difficulty)
3. Product card (image, price, supplier)
4. Stat card (icon, number, label)
5. Issue card (severity, description, action)
6. Suggestion card (before/after, action buttons)

Card anatomy:
- Header (optional)
- Body content
- Footer actions (optional)
- Hover state
- Selected state

Features:
- Clickable entire card
- Action buttons on hover
- Loading skeleton
- Empty state
```

### Navigation

**Pencil Prompt:**
```
Design navigation components.

1. Top navigation bar:
   - Logo (left)
   - Search (center)
   - User menu (right)
   - Notification bell
   - Breadcrumbs

2. Sidebar navigation:
   - Collapsible sections
   - Active state highlighting
   - Icon + text items
   - Nested items
   - Collapse/expand toggle

3. Bottom navigation (mobile):
   - 4-5 items max
   - Icon + label
   - Active indicator
   - Safe area padding

4. Tabs:
   - Horizontal tabs
   - Pill tabs
   - Underline tabs
   - Vertical tabs (sidebar)

5. Breadcrumbs:
   - Home > Category > Item
   - Truncation for deep nesting
```

### Modals

**Pencil Prompt:**
```
Design modal component system.

Modal types:
1. Alert/Confirm (simple message, OK/Cancel)
2. Form modal (larger, form content)
3. Full-screen modal (mobile)
4. Side panel modal (slides from right)
5. Bottom sheet (mobile)

Modal anatomy:
- Header with title
- Close button (X)
- Body content
- Footer with actions
- Overlay backdrop

Features:
- Dismissible by clicking outside
- Escape key to close
- Focus trap inside modal
- Scroll lock on body
- Responsive sizing
```

### Data Display

**Pencil Prompt:**
```
Design data display components.

1. Tables:
   - Sortable columns
   - Row selection
   - Pagination
   - Empty state
   - Loading state

2. Lists:
   - Simple list
   - List with actions
   - Expandable list

3. Badges:
   - Status badges (success, warning, error)
   - Category badges
   - Count badges

4. Progress:
   - Progress bar
   - Circular progress
   - Step progress

5. Charts:
   - Bar chart (cost comparison)
   - Pie/donut chart (material breakdown)
   - Line chart (project timeline)

6. Tooltips:
   - Info tooltip
   - Hover tooltip
   - Context menu
```

### Feedback

**Pencil Prompt:**
```
Design feedback components.

1. Toast notifications:
   - Success (green)
   - Error (red)
   - Warning (yellow)
   - Info (blue)
   - Position: top-right
   - Auto-dismiss after 5s
   - Action button optional

2. Loading states:
   - Spinner
   - Skeleton loader
   - Progress bar
   - Shimmer effect

3. Empty states:
   - Icon
   - Message
   - Call to action button

4. Error states:
   - Icon
   - Error message
   - Retry button
   - Support link

5. Success states:
   - Checkmark animation
   - Success message
   - Next action
```

---

## 📐 Responsive Breakpoints

```css
/* Mobile first approach */
--breakpoint-sm: 640px;   /* Small tablets */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Small laptops */
--breakpoint-xl: 1280px;  /* Desktops */
--breakpoint-2xl: 1536px; /* Large screens */
```

---

## ♿ Accessibility Guidelines

- **Color contrast**: Minimum 4.5:1 for text, 3:1 for large text
- **Focus indicators**: Visible focus rings on all interactive elements
- **Touch targets**: Minimum 44px for mobile
- **Screen readers**: Proper ARIA labels and roles
- **Keyboard navigation**: Full keyboard support
- **Motion**: Respect prefers-reduced-motion

---

## 🎬 Animations

**Micro-interactions:**
- Button hover: 150ms ease-out
- Modal open: 200ms ease-out
- Toast slide in: 250ms ease-out
- Loading spinner: 1s linear infinite
- Success checkmark: 300ms spring animation

**Page transitions:**
- Fade in: 150ms
- Slide in from right: 200ms

---

## 📁 File Structure for Designs

```
/designs/
├── /screens/
│   ├── dashboard.fig
│   ├── cabinet-builder.fig
│   ├── template-gallery.fig
│   ├── hardware-finder.fig
│   ├── cut-list.fig
│   ├── localization.fig
│   ├── design-doctor.fig
│   ├── cost-optimizer.fig
│   ├── community-gallery.fig
│   ├── brag-sheet.fig
│   ├── mobile-app.fig
│   ├── auth.fig
│   ├── pricing.fig
│   └── settings.fig
├── /components/
│   ├── buttons.fig
│   ├── inputs.fig
│   ├── cards.fig
│   ├── navigation.fig
│   ├── modals.fig
│   ├── data-display.fig
│   └── feedback.fig
├── /assets/
│   ├── logo.svg
│   ├── icons/
│   └── illustrations/
└── design-tokens.json
```

---

## 🚀 How to Use with Pencil.dev

1. **Sign up for Pencil.dev** at https://pencil.dev
2. **Create a new project** called "Modology Cabinet Designer"
3. **Copy the prompts** from this document
4. **Paste into Pencil's AI prompt** field
5. **Iterate** on generated designs with follow-up prompts
6. **Export** designs to Figma or as images
7. **Commit** exported assets to this repository

### Tips for Better Results

- Be specific about layout dimensions
- Mention the target audience (woodworkers, DIYers)
- Include color hex codes for consistency
- Describe interactions and animations
- Provide examples of similar apps
- Specify mobile vs desktop layouts separately

---

## 🔗 Related Resources

- [Pencil.dev Documentation](https://pencil.dev/docs)
- [Figma Community - Cabinet Design Inspiration](https://www.figma.com/community)
- [Tailwind UI Components](https://tailwindui.com)
- [Headless UI](https://headlessui.com)

---

*Last updated: March 2026*
*Version: 1.0*
