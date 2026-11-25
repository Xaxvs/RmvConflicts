import React, { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import { invoke } from '@tauri-apps/api/core';

interface LoginFormProps {
  onSuccess: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (mode === 'login') {
        const status = await invoke<number>('login', { email, password });

        if (status === 200) {
          onSuccess();
        } else if (status === 401) {
          setError('Invalid email or password.');
        } else {
          setError(`Login failed (status ${status}).`);
        }
      } else {
        const status = await invoke<number>('register', {
          username: displayName,
          email,
          password,
        });

        if (status === 201 || status === 200) {
          onSuccess();
        } else if (status === 409) {
          setError('An account with that email or username already exists.');
        } else if (status === 400) {
          setError('Password must be 8+ characters and include a number and special character.');
        } else {
          setError(`Registration failed (status ${status}).`);
        }
      }
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Could not connect to server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
      <Tabs
        value={mode}
        onChange={(_, val) => {
          setMode(val);
          setError(null);
        }}
        variant="fullWidth"
        sx={{ mb: 3 }}
      >
        <Tab label="Sign In" value="login" />
        <Tab label="Create Account" value="register" />
      </Tabs>

      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
        {mode === 'login' ? 'Welcome back' : 'Create your account'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {mode === 'register' && (
          <TextField
            label="Username"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            fullWidth
          />
        )}

        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
        />

        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
          slotProps={mode === 'register' ? { htmlInput: { minLength: 8 } } : undefined}
          helperText={
            mode === 'register'
              ? 'At least 8 characters, including a number and special character (!@#$...)'
              : undefined
          }
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={submitting}
          sx={{ mt: 1 }}
        >
          {submitting
            ? 'Please wait...'
            : mode === 'login'
              ? 'Sign In'
              : 'Create Account'}
        </Button>
      </Box>
    </Paper>
  );
}
