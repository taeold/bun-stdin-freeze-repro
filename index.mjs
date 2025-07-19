#!/usr/bin/env node
/**
 * Simplest reproduction: Ink + readline.close() after delay
 * 
 * No React effects needed - just setTimeout
 */

import React from 'react';
import { render, Text, useInput, useStdin } from 'ink';
import readline from 'readline';

const App = () => {
  const { stdin } = useStdin();
  
  // Ink handles stdin
  useInput((input, key) => {
    console.log(`[Input] ${key.name || input}`);
    if (key.ctrl && input === 'c') process.exit(0);
  });

  // Create readline, close after delay
  const rl = readline.createInterface({ input: stdin });
  
  setTimeout(() => {
    console.log('\nClosing readline...');
    rl.close();  // This freezes Bun!
    console.log('Bun: frozen ❌ | Node: works ✅\n');
  }, 100);  // Even 100ms is enough

  setInterval(() => {}, 1000);
  return React.createElement(Text, {}, 'Type any key');
};

render(React.createElement(App));