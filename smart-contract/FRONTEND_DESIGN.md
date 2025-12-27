# Fhunda Frontend UI/UX Design

## Overview

A privacy-preserving crowdfunding platform where users can create campaigns and contribute with encrypted donation
amounts. The UI should balance functionality with privacy-first design principles.

---

## 1. Navigation & Layout

### Header

- **Logo/Brand**: "Fhunda" with a lock icon symbolizing privacy
- **Navigation Menu** (top-right):
  - Home
  - Discover Campaigns
  - My Campaigns
  - My Contributions
  - Wallet Connection Status
  - User Profile/Settings
- **Connect Wallet Button**: Prominent, top-right corner (changes to address/avatar when connected)

### Sidebar (optional, for desktop)

- Quick filters for campaign discovery
- User stats dashboard

---

## 2. Landing Page / Home

### Hero Section

```
┌─────────────────────────────────────────────────────────┐
│                    FHUNDA                               │
│         Privacy-First Crowdfunding                       │
│                                                          │
│    Fund ideas while keeping your contributions private   │
│                                                          │
│    [Create Campaign]  [Discover Campaigns]              │
└─────────────────────────────────────────────────────────┘
```

### Key Statistics Section

- Total campaigns active
- Total funded (with privacy badge "Amounts encrypted")
- Number of contributors
- Average campaign success rate

### Featured/Trending Campaigns

- 3-4 campaign cards in a grid showing:
  - Campaign title
  - Creator name/avatar
  - Progress bar (funded/target)
  - Days remaining
  - Category tag
  - "View Details" button

### Call-to-Action Sections

- "Start Your Campaign" section
- "How Fhunda Works" with 3-4 steps explaining privacy benefits
- Privacy statement: "All contribution amounts are encrypted using FHE"

---

## 3. Campaign Discovery Page

### Search & Filter Bar

```
┌─────────────────────────────────┐
│ 🔍 Search campaigns...               │
├──────────────┬──────────────────────┤
│ Category ▼   │ Status ▼              │
│ Funding ▼    │ Timeline ▼            │
└──────────────┴──────────────────────┘
```

**Filters:**

- Category (Technology, Arts, Social Cause, etc.)
- Status (Active, Successful, Closed)
- Funding Range (25%-50%, 50%-100%, 100%+)
- Time Left (Today, This Week, This Month, Ending Soon)
- Sort (Trending, Recently Created, Most Funded, Ending Soon)

### Campaign Cards Grid

Each card displays:

- Campaign thumbnail image
- Title (max 60 chars)
- Creator name with avatar
- Short description (max 100 chars)
- **Progress Bar** with visual indicator:
  ```
  ████████░░░░  65% Funded ($6.5K of $10K)
  ```
- Days remaining with urgency color coding (green→yellow→red)
- Category badge
- Quick stats: # of contributors, avg contribution (if not sensitive)
- **"View" or "Contribute" button**

### Pagination or Infinite Scroll

- Load 12 campaigns per page
- Smooth infinite scroll option

---

## 4. Campaign Detail Page

### Header Section

```
┌────────────────────────────────────────────────┐
│ [Back Button]                  [Share] [Report] │
│                                                 │
│           Campaign Hero Image / Banner          │
│                                                 │
│         CAMPAIGN TITLE (max 100 chars)          │
│                                                 │
│  Creator Avatar | Creator Name | Created 2w ago│
└────────────────────────────────────────────────┘
```

### Three-Column Layout

#### Left Column (60%) - Campaign Details

- **Full Description** (markdown support)
- **Key Details Section**:
  - Target Amount: $10,000 (with decimals/currency)
  - Current Funding: $6,500 (65%)
  - Days Left: 12 days
  - Total Contributors: 147
  - Category: Technology
- **Progress Section**:

  ```
  Progress Bar: ████████░░░░ 65%

  Funded: $6,500
  Target: $10,000
  Remaining: $3,500

  Timeline: Campaign ends on [Date & Time]
  ```

- **Campaign Story** (Rich text)
- **Risks & Challenges** section
- **Comments/Discussion** section (if applicable)

#### Right Column (40%) - Contribution Panel

**Contribution Card** (Sticky, follows scroll)

```
┌─────────────────────────────────┐
│  CONTRIBUTE TO THIS CAMPAIGN    │
│                                 │
│  Amount to contribute: [Input]  │
│  ETH or USD selector            │
│                                 │
│  🔒 Your amount is encrypted    │
│     and private                 │
│                                 │
│  [+ Add Custom Amount]          │
│                                 │
│  Transaction Fee: ~$X           │
│  ─────────────────────────────  │
│  Total: $X                      │
│                                 │
│  [CONTRIBUTE] [CANCEL]          │
│                                 │
│  By contributing, you agree to  │
│  our Terms & Privacy Policy     │
└─────────────────────────────────┘
```

**Post-Contribution State:**

```
┌─────────────────────────────────┐
│  ✓ CONTRIBUTION CONFIRMED       │
│                                 │
│  Amount: [Encrypted]            │
│  Tx Hash: [0x...]              │
│  Timestamp: [Date & Time]       │
│                                 │
│  Your contributions are tracked │
│  privately for future refunds   │
│  if needed.                     │
│                                 │
│  [View Transaction]             │
│  [Back to Campaign]             │
└─────────────────────────────────┘
```

### Contributor List Section

- Show recent contributors (anonymized):
  ```
  Avatar (generic) | "Anonymous" | "$X contributed" | "2 hours ago"
  ```
- No exact amounts shown (privacy)
- Option to sort: Most Recent, Top Contributors (by count, not amount)

---

## 5. Create Campaign Page

### Step-by-Step Form (Multi-step or Single Page)

**Step 1: Basic Information**

- Campaign Title (required, max 100 chars, with char counter)
- Short Description (required, max 500 chars)
- Category Dropdown (required)
- Campaign Type (Personal, Business, Non-profit, etc.)

**Step 2: Goals & Timeline**

- Target Funding Amount (required, numeric input with currency selector)
- Campaign Duration (required, date picker)
  - Start Date (defaults to today)
  - End Date (calculated from duration or custom date)
  - Display: "X days remaining"
- Minimum Contribution Amount (optional, default $1)

**Step 3: Details & Media**

- Full Campaign Description (rich text editor)
- Risks & Challenges (optional, markdown)
- Upload Hero Image (drag-drop or file select)
- Add Video (optional, URL input)
- Upload Additional Images (gallery, max 5)

**Step 4: Review & Launch**

- Preview of campaign as it will appear
- Confirmation of all details
- Terms & Conditions checkbox
- [Edit] [Launch Campaign] buttons

### Form Features

- **Auto-save** to localStorage (draft campaigns)
- **Field validation** with clear error messages
- **Character counters** for title/description
- **Date picker** with calendar UI
- **Currency selector** (ETH, USD, etc.)
- **Progress indicator** showing current step

---

## 6. User Profile / Dashboard

### Tabs Section

- **My Campaigns** (campaigns created)
- **My Contributions** (campaigns funded)
- **Settings**

### My Campaigns Tab

```
┌────────────────────────────────────────────┐
│ Active Campaigns                [+ Create]  │
├────────────────────────────────────────────┤
│ Campaign Card with Status Badge:           │
│ ┌──────────────────────────────────────┐   │
│ │ Campaign Title                       │   │
│ │ Progress: 65% ($6.5K/$10K)          │   │
│ │ Status: [Active] [12 days left]      │   │
│ │ Contributors: 147                    │   │
│ │ [View] [Edit] [Analytics] [Close]    │   │
│ └──────────────────────────────────────┘   │
│                                            │
│ (Repeat for each active campaign)          │
└────────────────────────────────────────────┘

Closed/Completed Campaigns Section
├────────────────────────────────────────────┤
│ Campaign Card - Completed Status           │
│ ✓ Successfully Funded                      │
│ Final Amount: $10,500 (105% of goal)      │
│ [View Details] [Download Report]           │
```

**Campaign Analytics** (Expandable for each campaign):

- Funding timeline chart
- Contributor count over time
- Average contribution size
- Withdrawal status
- Total raised vs target

### My Contributions Tab

```
┌────────────────────────────────────────────┐
│ Your Contributions                         │
├────────────────────────────────────────────┤
│ Campaign Name      │ Status    │ Actions   │
│ ─────────────────────────────────────────  │
│ Tech Innovation    │ Active    │ [View]    │
│ Art Project        │ Successful│ [Receipt] │
│ Community Fund     │ Failed    │ [Refund]  │
│                                            │
│ 🔒 Your contribution amounts remain       │
│    encrypted. Refunds are calculated      │
│    from your encrypted record.            │
└────────────────────────────────────────────┘
```

### Settings Tab

- Account Information (name, email, wallet address)
- Privacy Settings
  - Opt-in to public contributor list
  - Notification preferences
- Two-Factor Authentication
- Session Management
- Data Export (GDPR compliance)
- Account Deletion

---

## 7. Key UI Components

### Privacy Badge/Indicator

```
🔒 [Your contribution amount is encrypted and only visible to you]
```

Appears on:

- Contribution confirmation
- User dashboard
- Campaign contribution history

### Status Badges

- **Active** (green): Campaign is live and accepting contributions
- **Successful** (blue): Campaign reached its goal
- **Failed** (gray): Campaign ended without reaching goal
- **Closed** (red): Creator closed campaign early
- **Withdrawn** (purple): Funds have been withdrawn

### Progress Indicators

- Visual progress bar (filled/unfilled segments)
- Percentage text
- Amount text ($X of $Y)
- Color coding:
  - 0-33%: Yellow
  - 34-66%: Light Green
  - 67-99%: Green
  - 100%+: Dark Green with checkmark

### Time Indicators

- "X days left" (green if >7 days, yellow if 1-7 days, red if <24 hours)
- Countdown timer for urgent campaigns
- Campaign ended date/time

---

## 8. Modals & Overlays

### Contribution Modal

```
┌──────────────────────────────────┐
│ Contribute to: Campaign Title  ✕  │
│                                  │
│ Enter Amount:                    │
│ [Input field] ETH ▼              │
│                                  │
│ 🔒 This amount will be encrypted │
│    using Fully Homomorphic       │
│    Encryption (FHE)              │
│                                  │
│ Estimated Gas Fee: $X.XX         │
│ ─────────────────────────────    │
│ Total: $XXX.XX                   │
│                                  │
│ ⚠️ Review transaction details    │
│    in your wallet before          │
│    confirming.                    │
│                                  │
│ [Cancel]  [Confirm in Wallet]   │
└──────────────────────────────────┘
```

### Withdrawal Modal (Creator)

```
┌──────────────────────────────────┐
│ Withdraw Funds                 ✕  │
│                                  │
│ Campaign: Campaign Title         │
│ Total Raised: $10,500           │
│ Wallet Address: 0x...           │
│                                  │
│ ✓ Campaign deadline passed      │
│ ✓ Target reached ($10K)         │
│ ✓ Ready for withdrawal          │
│                                  │
│ Gas Fee: ~$X.XX                 │
│ You'll Receive: $10,499.XX      │
│                                  │
│ [Cancel]  [Withdraw Now]        │
└──────────────────────────────────┘
```

### Refund Modal (Contributor - Failed Campaign)

```
┌──────────────────────────────────┐
│ Request Refund                 ✕  │
│                                  │
│ Campaign: Campaign Title         │
│ Status: Failed (deadline passed) │
│                                  │
│ Your Contribution: [Encrypted]  │
│ Refund Amount: $X.XX            │
│                                  │
│ Gas Fee: ~$X.XX                 │
│ You'll Receive: $XX.XX          │
│                                  │
│ [Cancel]  [Request Refund]      │
└──────────────────────────────────┘
```

### Transaction Confirmation Modal

```
┌──────────────────────────────────┐
│ Transaction Pending            ✕  │
│                                  │
│ Encrypting your contribution...  │
│ [████████░░░░░░░░] 45%          │
│                                  │
│ This may take a few moments     │
│ Do not close this window.       │
│                                  │
│ Tx Hash: 0x... [Copy]           │
│ [View on BlockExplorer]         │
│                                  │
│ [Waiting...]                    │
└──────────────────────────────────┘
```

---

## 9. Color Scheme & Design System

### Primary Colors

- **Privacy Purple**: `#7C3AED` (primary action, trust)
- **Success Green**: `#10B981` (funded, success states)
- **Warning Yellow**: `#F59E0B` (urgent, low time)
- **Error Red**: `#EF4444` (failed, errors)
- **Neutral Gray**: `#6B7280` (text, disabled states)

### Backgrounds

- **Light Mode** (default):
  - Primary BG: `#FFFFFF`
  - Secondary BG: `#F9FAFB`
  - Card BG: `#FFFFFF` with subtle shadow
- **Dark Mode** (optional):
  - Primary BG: `#1F2937`
  - Secondary BG: `#111827`
  - Card BG: `#1F2937`

### Typography

- **Headings**: Bold, sans-serif (Interop, SF Pro, Roboto)
- **Body Text**: Regular weight, 16px, line-height 1.5
- **Captions/Labels**: 12-14px, gray color
- **Monospace**: For addresses/hashes (`0x...`)

---

## 10. Responsive Design

### Breakpoints

- **Mobile**: < 768px
  - Single column layout
  - Stacked cards
  - Bottom sheet modals
- **Tablet**: 768px - 1024px
  - Two column layout where applicable
  - Medium-sized cards
- **Desktop**: > 1024px
  - Full three-column layouts
  - Side-by-side panels
  - Sticky sidebars

### Mobile-Specific Considerations

- Bottom navigation bar for main sections
- Large touch targets (min 44x44px)
- Simplified campaign creation (wizard-style)
- Sticky contribution button
- Collapsible sections for long content

---

## 11. Accessibility & Privacy UX

### Privacy Indicators

- 🔒 Lock icons next to encrypted fields
- Privacy badges explaining what's hidden
- Tooltips explaining FHE concepts

### Accessibility Features

- High contrast text (WCAG AAA)
- ARIA labels on all interactive elements
- Keyboard navigation support
- Screen reader friendly
- Focus indicators on all interactive elements

### Help & Onboarding

- Tooltip on first visit explaining FHE privacy
- "How it works" modal for new users
- FAQ section
- Contact support link

---

## 12. Loading & Empty States

### Loading States

```
┌─────────────────────────────────┐
│ Loading campaigns...            │
│ [████░░░░░░░░░░░░░░] 30%      │
│                                 │
│ Fetching latest campaigns       │
└─────────────────────────────────┘
```

### Empty States

```
┌─────────────────────────────────┐
│                                 │
│          📭 No campaigns found  │
│                                 │
│    Try adjusting your filters   │
│    or create your own campaign  │
│                                 │
│         [Create Campaign]       │
└─────────────────────────────────┘
```

### Error States

```
┌─────────────────────────────────┐
│         ⚠️ Something went wrong  │
│                                 │
│    Failed to load campaigns     │
│                                 │
│    [Retry]  [Go Home]          │
└─────────────────────────────────┘
```

---

## 13. Key Interaction Patterns

### Contribution Flow

1. User clicks "Contribute" on campaign
2. Modal opens with amount input
3. User enters amount (preview shows encrypted status)
4. User reviews transaction details
5. User clicks "Confirm in Wallet"
6. Wallet extension opens for signature
7. Transaction confirmed with receipt modal
8. User redirected to campaign or dashboard

### Campaign Creation Flow

1. User clicks "Create Campaign"
2. Multi-step form with progress indicator
3. Each step has clear validation
4. Review page before launch
5. Confirmation of successful creation
6. Redirect to campaign page

### Refund Flow

1. User navigates to failed campaign
2. "Request Refund" button visible post-deadline
3. Click triggers refund modal
4. Confirms encrypted amount will be refunded
5. Wallet signature required
6. Refund processed
7. Confirmation with receipt

---

## 14. Notifications & Alerts

### Toast Notifications

- Campaign created successfully ✓
- Contribution received ✓
- Withdrawal processed ✓
- Error: Transaction failed ✗
- Warning: Low gas price detected ⚠️

### In-App Alerts

- Campaign near deadline
- You're a top contributor
- Campaign successfully funded
- Refund available
- Withdrawal ready

### Email Notifications (Optional)

- Campaign updates
- Contribution confirmations
- Refund processed
- Campaign milestones reached

---

## 15. Analytics Dashboard (Optional - Creator View)

### Campaign Analytics Page

```
Campaign: Tech Innovation

┌─────────────────────────────────┐
│ Key Metrics                     │
│ ┌─────────┬─────────┬─────────┐ │
│ │ Funded  │ Contrib.│ Contributors│
│ │ $6.5K   │ Average │ 147         │
│ │ (65%)   │ $44.22  │             │
│ └─────────┴─────────┴─────────┘ │
└─────────────────────────────────┘

Chart: Funding Over Time
[Line chart showing funding progression]

Chart: Contributions Timeline
[Bar chart by day]
```

---

This design prioritizes privacy, clarity, and trust while maintaining an intuitive user experience for both campaign
creators and contributors.
