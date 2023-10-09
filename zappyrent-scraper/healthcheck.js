process.exit((await fetch("http://localhost:3434/ping")).ok ? 0 : 1);
