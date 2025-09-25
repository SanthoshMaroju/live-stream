import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import { styled } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom'; // Import RouterLink

const SocialButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1, 0),
  padding: theme.spacing(1.5),
  textTransform: 'none',
  fontSize: '1rem',
}));

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const backendUrl = 'http://localhost:5000/api/auth'; // Your backend URL

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${backendUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        setSuccess('Login successful! Redirecting...');
        // In a real app, you'd redirect the user to a dashboard or home page
        console.log('Login successful, token:', data.token);
        // window.location.href = '/dashboard'; // Example redirect
      } else {
        setError(data.msg || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error or server is unreachable.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${backendUrl}/google`;
  };

  const handleFacebookLogin = () => {
    window.location.href = `${backendUrl}/facebook`;
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
          Welcome Back!
        </Typography>
        <Typography component="h2" variant="h5" sx={{ mb: 3 }}>
          Sign In
        </Typography>
        {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ width: '100%', mb: 2 }}>{success}</Alert>}
        <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            variant="outlined"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            variant="outlined"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
          </Button>
          <Link href="#" variant="body2" sx={{ display: 'block', textAlign: 'center', mb: 2 }}>
            Forgot password?
          </Link>
          <Divider sx={{ my: 2 }}>OR</Divider>
          <SocialButton
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleLogin}
            sx={{ borderColor: '#DB4437', color: '#DB4437' }}
          >
            Sign in with Google
          </SocialButton>
          <SocialButton
            fullWidth
            variant="outlined"
            startIcon={<FacebookIcon />}
            onClick={handleFacebookLogin}
            sx={{ borderColor: '#4267B2', color: '#4267B2' }}
          >
            Sign in with Facebook
          </SocialButton>
          <Link component={RouterLink} to="/register" variant="body2" sx={{ mt: 2, display: 'block', textAlign: 'center' }}>
            {"Don't have an account? Sign Up"}
          </Link>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;