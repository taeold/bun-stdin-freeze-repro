#!/usr/bin/env node
/**
 * Bun stdin freeze bug - Minimal reproduction
 * 
 * BUG: When React effect cleanup calls rl.close(), stdin freezes in Bun
 * 
 * Run: bun index.mjs  → Stdin freezes after 2 seconds
 * Run: node index.mjs → Works correctly
 */

import React, { useEffect, useState } from 'react';
import { render, Text, useInput, useStdin } from 'ink';
import readline from 'readline';

const App = () => {
  const [active, setActive] = useState(true);
  const { stdin } = useStdin();

  useInput((input, key) => {
    console.log(`[Input] ${key.name || input}`);
    if (key.ctrl && input === 'c') process.exit(0);
  });

  useEffect(() => {
    if (!active) return;

    console.log('Creating readline interface...');
    const rl = readline.createInterface({ input: stdin });

    return () => {
      console.log('Closing readline interface...');
      rl.close();  // This line causes the freeze in Bun
    };
  }, [active, stdin]);

  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('\nTriggering cleanup...');
      setActive(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const keepAlive = setInterval(() => {}, 1000);
    return () => clearInterval(keepAlive);
  }, []);

  return React.createElement(Text, {}, 
    `Active: ${active} - Type any key to test input`
  );
};

render(React.createElement(App));