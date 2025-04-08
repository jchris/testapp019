# Browser Hang in use-fireproof v0.20.0

## Description
When upgrading from use-fireproof v0.19.124 to v0.20.0, the application experiences a complete browser hang as soon as a user types a character in any input field. This happens even after removing the `useDocument` hook from the application, suggesting the issue is not related to that specific hook.

## Environment
- React 19.0.0
- TypeScript
- Vite 6.2.5
- Browser: Chrome/Firefox/Safari (all affected)
- OS: macOS

## Steps to Reproduce
1. Clone the repository: `git clone https://github.com/jchris/testapp019.git`
2. Check out the main branch (working version with v0.19.124): `git checkout main`
3. Install dependencies: `pnpm install`
4. Start the development server: `pnpm dev`
5. Observe that the Todo app works correctly - you can type in the input field without issues
6. Stop the server
7. Check out the branch with v0.20.0: `git checkout zerotwenty`
8. Install dependencies: `pnpm install`
9. Start the development server: `pnpm dev`
10. Try to type a character in the "New Todo" input field
11. Observe that the browser immediately hangs/freezes

## Expected Behavior
The application should allow typing in the input field without any performance issues or browser hangs.

## Actual Behavior
The browser completely hangs as soon as a single character is typed in any input field. The UI becomes unresponsive, and developer tools may also freeze. The only solution is to force-close the browser tab.

## Additional Information
- The issue persists even after removing the `useDocument` hook and replacing it with React's native `useState` (see the latest commit in the `zerotwenty` branch)
- The main branch using v0.19.124 works perfectly with the same codebase
- No console errors are visible before the hang occurs
- The hang happens immediately on the first keystroke in any input field
- We've tested multiple dev-preview versions (0.20.14, 0.20.52, 0.20.60, and others) and all exhibit the same hanging behavior
- This issue has been present in all 0.20.x versions we've tested, though we're unsure how we missed it during earlier testing phases

## Minimal Reproduction Code
```tsx
import { useFireproof } from 'use-fireproof'
import type { DocBase } from 'use-fireproof'
import { useState } from 'react'

interface Todo extends Partial<DocBase> {
  todo: string
  type: string
  completed: boolean
  createdAt: number
}

function App() {
  const { useLiveQuery, database } = useFireproof("todo-list-db")
  const [newTodo, setNewTodo] = useState('')

  const { docs } = useLiveQuery("type", { 
    key: "todo",
    descending: true 
  })
  
  // Type assertion to treat the docs as Todo items
  const todos = docs as Todo[]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTodo(e.target.value)
  }

  // Rest of the component...
}
```

## Workaround
Downgrade to use-fireproof v0.19.124 until the issue is resolved.

## Impact
This issue completely blocks development and usage of applications that depend on use-fireproof v0.20.0, as basic form input functionality is broken.

## Update (2025-04-08)
Even after completely removing useLiveQuery and useDocument in favor of direct database.put API calls and database.allDocs with useEffect, the browser hang issue persists. This further suggests that the problem is fundamental to the core library functionality in v0.20.0 and not limited to specific hooks.
