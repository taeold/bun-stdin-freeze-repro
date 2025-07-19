# Bun stdin freeze: React effect cleanup + readline

## Bug

When React effect cleanup calls `rl.close()`, stdin becomes unresponsive in Bun (but not Node.js) if Ink's `useInput` is active.

## Reproduction

```bash
bun install
bun index.mjs  # Stdin freezes after 2 seconds ❌
node index.mjs # Works correctly ✅
```

## What You'll See

1. **0-2 seconds**: Type any key → see "[Input] keyname" logs
2. **After 2 seconds**: "Closing readline interface..." message
3. **In Bun**: No more input works, Ctrl+C doesn't exit
4. **In Node**: Everything continues working

## Root Cause

```javascript
// Ink is handling stdin
useInput((input, key) => {
  if (key.ctrl && input === 'c') process.exit(0);
});

// React effect creates and cleans up readline
useEffect(() => {
  const rl = readline.createInterface({ input: stdin });
  
  return () => {
    rl.close();  // ← This breaks stdin in Bun
  };
}, [dependency]);
```

The bug only occurs when `rl.close()` is called from React's cleanup lifecycle.

## Impact

Affects any Ink-based CLI that temporarily creates readline interfaces for features like autocomplete or special input modes.

## Environment

- Bun: 1.2.18 (broken)
- Node: 22.12.0 (works)
- Dependencies: ink@6.0.1, react@19.1.0