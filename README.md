# Bun stdin freeze: Ink + readline.close()

## Bug

Calling `rl.close()` after a delay causes stdin to become completely unresponsive in Bun (but not Node.js) when Ink's `useInput` is active.

## Reproduction

```bash
bun install
bun index.mjs  # Stdin freezes after 2 seconds ❌
node index.mjs # Works correctly ✅
```

## What You'll See

1. **First 100ms**: Type any key → see "[Input] keyname" logs
2. **After 100ms**: "Closing readline..." message
3. **In Bun**: No more input works, Ctrl+C doesn't exit
4. **In Node**: Everything continues working

## The Code

```javascript
// 1. Ink is handling stdin
useInput((input, key) => {
  if (key.ctrl && input === 'c') process.exit(0);
});

// 2. Create readline interface
const rl = readline.createInterface({ input: stdin });

// 3. Close it after a delay
setTimeout(() => {
  rl.close();  // ← This breaks stdin in Bun!
}, 100);
```

No React effects needed. Just Ink + readline + delay + close = freeze.

## Impact

Affects any Ink-based CLI that temporarily creates readline interfaces for features like autocomplete or special input modes.

## Environment

- OS: macOS 15.5 (Sequoia)
- Bun: 1.2.18 (broken)
- Node: 22.12.0 (works)
- Dependencies: ink@6.0.1, react@19.1.0