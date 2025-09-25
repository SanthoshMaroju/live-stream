import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage'; // Import the new page
import { CssBaseline, ThemeProvider, createTheme, Box } from '@mui/material';

// Create a basic Material UI theme
const theme = createTheme({
  palette: {
    mode: 'dark', // Or 'light'
    primary: {
      main: '#90caf9', // A light blue for primary actions
    },
    secondary: {
      main: '#f48fb1', // A light pink for secondary actions
    },
    background: {
      default: '#121212', // Dark background
      paper: '#1e1e1e', // Slightly lighter dark for cards/boxes
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Resets CSS and applies basic Material Design styles */}
      <Router>
        {/* This Box ensures automatic centering and full viewport coverage */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center', // Centers horizontally
            alignItems: 'center',     // Centers vertically
            minHeight: '100vh',       // Ensures the Box takes full viewport height
            bgcolor: 'background.default', // Applies the theme's default background color
          }}
        >
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            {/* We will add more routes here later, like a dashboard */}
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;