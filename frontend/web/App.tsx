import React, { useState, useMemo } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Container, Typography } from '@mui/material';
import Navbar from './Navbar';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
        },
      }),
    [darkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navbar darkMode={darkMode} onToggleDarkMode={() => setDarkMode(!darkMode)} />

      <Container sx={{ mt: 4 }}>

        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>

          Tauri + React + TypeScript
        </Typography>
        <Typography sx={{ mt: 1 }}>Your desktop window is connected!</Typography>
      </Container>
    </ThemeProvider>
  );
}

export default App;
