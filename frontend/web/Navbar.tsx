import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  InputBase,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Collapse,
  Avatar,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { invoke } from '@tauri-apps/api/core';

interface NavbarProps {
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
      '&:focus': {
        width: '28ch',
      },
    },
  },
}));

const Navbar: React.FC<NavbarProps> = ({ darkMode = false, onToggleDarkMode }) => {
  // Desktop Dropdown States
  const [servicesAnchorEl, setServicesAnchorEl] = useState<null | HTMLElement>(null);
  const [userAnchorEl, setUserAnchorEl] = useState<null | HTMLElement>(null);

  // Mobile Drawer States
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState<boolean>(false);

  // Auth / Token Modal States
  const [authDialogOpen, setAuthDialogOpen] = useState<boolean>(false);
  const [tokenInput, setTokenInput] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  // Verify token against Rust -> Spring Boot
  const handleVerifyToken = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;

    setIsLoading(true);
    setAuthError(null);

    try {
      const status = await invoke<number>('check_whitelisted', {
        authenticate: tokenInput,
      });

      if (status === 200) {
        setIsAuthenticated(true);
        setAuthDialogOpen(false);
        setTokenInput('');
      } else {
        setAuthError(`Access denied (HTTP ${status}).`);
      }
    } catch (err) {
      setAuthError(typeof err === 'string' ? err : 'Failed to connect to backend.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserAnchorEl(null);
  };

  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          {/* 1. Mobile Hamburger Icon */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* 2. Brand Logo */}
          <Typography
            variant="h6"
            component="a"
            href="/"
            sx={{
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
              mr: 3,
            }}
          >
            BrandName
          </Typography>

          {/* 3. Desktop Navigation Links & Dropdown */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            <Button color="inherit" href="/">
              Home
            </Button>

            <Button
              color="inherit"
              endIcon={<KeyboardArrowDownIcon />}
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => setServicesAnchorEl(e.currentTarget)}
            >
              Services
            </Button>
            <Menu
              anchorEl={servicesAnchorEl}
              open={Boolean(servicesAnchorEl)}
              onClose={() => setServicesAnchorEl(null)}
            >
              <MenuItem onClick={() => setServicesAnchorEl(null)} component="a" href="/services/web">
                Web Development
              </MenuItem>
              <MenuItem onClick={() => setServicesAnchorEl(null)} component="a" href="/services/design">
                UI/UX Design
              </MenuItem>
              <MenuItem onClick={() => setServicesAnchorEl(null)} component="a" href="/services/seo">
                SEO & Marketing
              </MenuItem>
            </Menu>

            <Button color="inherit" href="/about">
              About
            </Button>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* 4. Search Bar */}
          <Search sx={{ display: { xs: 'none', sm: 'block' } }}>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search…"
              inputProps={{ 'aria-label': 'search' }}
            />
          </Search>

          {/* 5. Dark Mode Toggle */}
          <Tooltip title="Toggle theme">
            <IconButton color="inherit" onClick={onToggleDarkMode} sx={{ mr: 1.5 }}>
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>

          {/* 6. Auth State: Sign In Button OR Verified User Avatar */}
          {!isAuthenticated ? (
            <Button
              color="inherit"
              variant="outlined"
              startIcon={<LockOpenIcon />}
              onClick={() => setAuthDialogOpen(true)}
              sx={{ borderColor: 'rgba(255, 255, 255, 0.5)' }}
            >
              Sign In
            </Button>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Chip
                icon={<VerifiedUserIcon />}
                label="Whitelisted"
                color="success"
                size="small"
                sx={{ display: { xs: 'none', sm: 'flex' } }}
              />
              <Tooltip title="Account settings">
                <IconButton
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => setUserAnchorEl(e.currentTarget)}
                  sx={{ p: 0 }}
                >
                  <Avatar alt="User Profile" sx={{ width: 34, height: 34, bgcolor: 'secondary.main' }}>
                    U
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={userAnchorEl}
                open={Boolean(userAnchorEl)}
                onClose={() => setUserAnchorEl(null)}
              >
                <MenuItem onClick={() => setUserAnchorEl(null)}>Profile</MenuItem>
                <MenuItem onClick={() => setUserAnchorEl(null)}>Settings</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* 7. Token / Login Dialog Modal */}
      <Dialog
        open={authDialogOpen}
        onClose={() => setAuthDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <Box component="form" onSubmit={handleVerifyToken}>
          <DialogTitle>Authenticate Session</DialogTitle>
          <DialogContent>
            {authError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {authError}
              </Alert>
            )}
            <TextField
              autoFocus
              margin="dense"
              label="Access Token / API Key"
              type="password"
              fullWidth
              variant="outlined"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              disabled={isLoading}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setAuthDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={isLoading || !tokenInput.trim()}>
              {isLoading ? 'Verifying...' : 'Verify Token'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* 8. Mobile Slide-Out Drawer */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 260 },
        }}
      >
        <Box component="nav" aria-label="Mobile navigation" sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            BrandName
          </Typography>
          <List>
            <ListItem disablePadding>
              <ListItemButton component="a" href="/" onClick={() => setMobileOpen(false)}>
                <ListItemText primary="Home" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                onClick={() => setMobileServicesOpen((open) => !open)}
                aria-expanded={mobileServicesOpen}
              >
                <ListItemText primary="Services" />
                {mobileServicesOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <Collapse in={mobileServicesOpen} timeout="auto" unmountOnExit>
                <List disablePadding aria-label="Services">
                  {[
                    { href: '/services/web', label: 'Web Development' },
                    { href: '/services/design', label: 'UI/UX Design' },
                    { href: '/services/seo', label: 'SEO & Marketing' },
                  ].map(({ href, label }) => (
                    <ListItem key={href} disablePadding>
                      <ListItemButton
                        component="a"
                        href={href}
                        onClick={() => setMobileOpen(false)}
                        sx={{ pl: 4 }}
                      >
                        <ListItemText primary={label} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component="a" href="/about" onClick={() => setMobileOpen(false)}>
                <ListItemText primary="About" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
