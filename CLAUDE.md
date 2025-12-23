# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Cuentas Claras** is a Next.js expense splitter application with real-time persistence via Firebase. It helps groups divide expenses fairly by tracking who paid for what and calculating who owes whom. Users can create sessions and share unique URLs with friends for collaborative expense tracking.

## Architecture

### Stack
- **Framework**: Next.js 15 (React 19)
- **Database**: Firestore (real-time listeners)
- **Styling**: Tailwind CSS + TypeScript
- **Icons**: Lucide React

### Core Modules

**`lib/types.ts`**
- Defines TypeScript interfaces: `Participant`, `Expense`, `Session`, `Settlement`, `Balances`

**`lib/firebase.ts`**
- Firestore initialization (client-side only)
- Collection references for sessions and expenses
- Helper functions: `getSessionRef()`, `getExpensesCollection()`, `getExpenseRef()`

**`lib/calculations.ts`**
- `calculateTotalAmount()`: Sum of all expenses
- `calculatePerPersonAmount()`: Average split
- `calculateBalances()`: Computes each person's net balance
- `calculateSettlements()`: Greedy algorithm to minimize transfers (optimized settlement)

**`lib/hooks.ts`** (Client-side custom hooks)
- `useSession(sessionId)`: Real-time listener for session + participants (Firestore snapshot)
- `useExpenses(sessionId)`: Real-time listener for expenses subcollection
- `useParticipants(sessionId)`: Convenience hook wrapping useSession

### Component Structure

**`components/App.tsx`** (Main app logic)
- Receives `sessionId` as prop
- Uses hooks to sync state with Firestore
- Handlers for add/remove participants and expenses
- Coordinates all sub-components
- Firestore operations: `addDoc()`, `setDoc()`, `deleteDoc()`, `arrayUnion()`, `arrayRemove()`

**UI Components** (Presentational)
- `ParticipantForm.tsx`: Input field + button to add participant
- `ParticipantsList.tsx`: Display participants + balances card
- `ExpenseForm.tsx`: Modal form to register expense
- `ExpenseList.tsx`: Display expenses with delete button
- `Settlement.tsx`: Shows "who owes whom" with optimized transfers

### Pages

**`app/page.tsx`** (Landing page)
- Create new session (generates UUID, creates Firestore doc)
- Join existing session (accepts sessionId input)
- Shows shareable URL with copy button

**`app/gastos/[sessionId]/page.tsx`** (Dynamic route)
- Server component that passes `sessionId` to `App` component
- Handles async params from Next.js 15

**`app/layout.tsx`**
- Root layout with Tailwind global CSS
- Metadata configuration

## Firestore Data Structure

```
/sessions/{sessionId}
  ├── createdAt: Timestamp
  ├── updatedAt: Timestamp
  └── participants: Participant[]

/sessions/{sessionId}/expenses/{expenseId}
  ├── description: string
  ├── amount: number
  ├── paidBy: string (participant UUID)
  ├── date: string (toLocaleDateString())
  └── createdAt: Timestamp
```

## Settlement Algorithm

Located in `lib/calculations.ts:calculateSettlements()`

**Goal**: Minimize number of transfers needed

**Process**:
1. Separate participants into debtors (balance < 0) and creditors (balance > 0)
2. Use greedy matching: pair largest debtor with largest creditor
3. Create payment for min(debtor amount, creditor amount)
4. Remove matched amounts, advance pointers when either is fully settled

**Example**: If A owes $30 total, B owes $20, and C is owed $50:
- A pays C $30
- B pays C $20
- Result: 2 transactions (not 3)

## Environment Configuration

**`.env.local`** (must create manually):
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```

All variables are `NEXT_PUBLIC_` (exposed to browser - Firebase config is meant to be public).

## Firestore Security Rules

Configured in Firebase Console. Current setup allows open read/write:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /sessions/{sessionId} {
      allow read, write;
      match /expenses/{expenseId} {
        allow read, write;
      }
    }
  }
}
```

⚠️ This is development-only. For production, add authentication.

## Development Commands

```bash
npm run dev      # Start Next.js dev server (http://localhost:3000)
npm run build    # Production build
npm run start    # Run production build
npm run lint     # ESLint check
```

## Common Tasks

### Adding a New Field to Expenses
1. Update `Expense` interface in `lib/types.ts`
2. Update Firestore document writes in `components/App.tsx` (the `addDoc()` call)
3. Update component rendering in `components/ExpenseList.tsx`

### Modifying Balance Calculation
- Edit `calculateBalances()` in `lib/calculations.ts`
- Test with sample data in `components/App.tsx`

### Real-time Sync Issues
- Check Firestore listeners in `lib/hooks.ts` - they use `onSnapshot()`
- Verify `.env.local` has correct Firebase credentials
- Check browser console for unsubscribe cleanup

### Adding Authentication
- Initialize Firebase Auth in `lib/firebase.ts`
- Wrap components with auth context
- Update Firestore rules to check `request.auth`
- Store user sessions separately from expense sessions
