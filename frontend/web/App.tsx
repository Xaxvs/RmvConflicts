import React, { useState, useMemo, useEffect } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import { invoke } from '@tauri-apps/api/core';
import Navbar from './Navbar';
import LoginForm from './LoginForm';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
        },
      }),
    [darkMode]
  );

  // Verify saved keyring JWT on startup
  useEffect(() => {
    invoke<boolean>('check_session')
      .then((isValid) => {
        setAuthStatus(isValid ? 'authenticated' : 'unauthenticated');
      })
      .catch(() => {
        setAuthStatus('unauthenticated');
      });
  }, []);

  // Wipe keyring JWT and return to LoginForm
  const handleLogout = async () => {
    try {
      await invoke('logout');
    } finally {
      setAuthStatus('unauthenticated');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navbar
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        isAuthenticated={authStatus === 'authenticated'}
        onLogout={handleLogout}
      />

      {authStatus === 'loading' && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 12 }}>
          <CircularProgress />
        </Box>
      )}

      {authStatus === 'unauthenticated' && (
        <Container maxWidth="xs" sx={{ mt: 8 }}>
          <LoginForm onSuccess={() => setAuthStatus('authenticated')} />
        </Container>
      )}

      {authStatus === 'authenticated' && (
        <Container sx={{ mt: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Tauri + React + TypeScript
          </Typography>
          <Typography sx={{ mt: 1 }}>Your desktop window is connected!</Typography>
        </Container>
      )}
    </ThemeProvider>
  );
}

export default App;
