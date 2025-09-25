import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  CircularProgress,
  Alert
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom'; // Import useNavigate

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate(); // Hook for programmatic navigation

  const backendUrl = 'http://localhost:5000/api/auth'; // Your backend URL

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!username || !email || !password) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        setSuccess('Registration successful! Redirecting to login...');
        console.log('Registration successful, token:', data.token);
        // Redirect to login page after a short delay
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setError(data.msg || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Network error or server is unreachable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 3,
          boxShadow: 3,
          borderRadius: 2,
          bgcolor: 'background.paper',
        }}
      >
        <Typography component="h1" variant="h4" sx={{ mb: 2 }}>
          Create Account
        </Typography>
        <Typography component="h2" variant="h5" sx={{ mb: 3 }}>
          Sign Up
        </Typography>
        {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ width: '100%', mb: 2 }}>{success}</Alert>}
        <Box component="form" onSubmit={handleRegister} noValidate sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
          </Button>
          <Link component={RouterLink} to="/" variant="body2" sx={{ mt: 2, display: 'block', textAlign: 'center' }}>
            {"Already have an account? Sign In"}
          </Link>
        </Box>
      </Box>
    </Container>
  );
};

export default RegisterPage;