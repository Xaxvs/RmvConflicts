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
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Collapse,
  Avatar,
  Tooltip,
  Chip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

interface NavbarProps {
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  isAuthenticated?: boolean;
  onLogout?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  darkMode = false,
  onToggleDarkMode,
  isAuthenticated = false,
  onLogout,
}) => {
  // Desktop Dropdown States
  const [servicesAnchorEl, setServicesAnchorEl] = useState<null | HTMLElement>(null);
  const [userAnchorEl, setUserAnchorEl] = useState<null | HTMLElement>(null);

  // Mobile Drawer States
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState<boolean>(false);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleLogoutClick = () => {
    setUserAnchorEl(null);
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          {/* 1. Mobile Hamburger Icon */}
          {isAuthenticated && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          )}

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
            RmvConflicts
          </Typography>

          {/* 3. Desktop Navigation Links & Dropdown (only shown when authenticated) */}
          {isAuthenticated && (
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
              <Button color="inherit" href="/">
                Home
              </Button>

              <Button
                color="inherit"
                endIcon={<KeyboardArrowDownIcon />}
                onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                  setServicesAnchorEl(e.currentTarget)
                }
              >
                Services
              </Button>
              <Menu
                anchorEl={servicesAnchorEl}
                open={Boolean(servicesAnchorEl)}
                onClose={() => setServicesAnchorEl(null)}
              >
                <MenuItem
                  onClick={() => setServicesAnchorEl(null)}
                  component="a"
                  href="/services/web"
                >
                  Web Development
                </MenuItem>
                <MenuItem
                  onClick={() => setServicesAnchorEl(null)}
                  component="a"
                  href="/services/design"
                >
                  UI/UX Design
                </MenuItem>
                <MenuItem
                  onClick={() => setServicesAnchorEl(null)}
                  component="a"
                  href="/services/seo"
                >
                  SEO & Marketing
                </MenuItem>
              </Menu>

              <Button color="inherit" href="/about">
                About
              </Button>
            </Box>
          )}

          <Box sx={{ flexGrow: 1 }} />

          {/* 5. Dark Mode Toggle */}
          <Tooltip title="Toggle theme">
            <IconButton color="inherit" onClick={onToggleDarkMode} sx={{ mr: 1.5 }}>
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>

          {/* 6. Authenticated User Avatar & Logout Menu */}
          {isAuthenticated && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Chip
                icon={<VerifiedUserIcon />}
                label="Signed In"
                color="success"
                size="small"
                sx={{ display: { xs: 'none', sm: 'flex' } }}
              />
              <Tooltip title="Account settings">
                <IconButton
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                    setUserAnchorEl(e.currentTarget)
                  }
                  sx={{ p: 0 }}
                >
                  <Avatar
                    alt="User Profile"
                    sx={{ width: 34, height: 34, bgcolor: 'secondary.main' }}
                  >
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
                <MenuItem onClick={handleLogoutClick}>Logout</MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Navigation Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen && isAuthenticated}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            RmvConflicts
          </Typography>
          <List>
            <ListItem disablePadding>
              <ListItemButton component="a" href="/" onClick={handleDrawerToggle}>
                <ListItemText primary="Home" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton onClick={() => setMobileServicesOpen(!mobileServicesOpen)}>
                <ListItemText primary="Services" />
                {mobileServicesOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
            <Collapse in={mobileServicesOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton sx={{ pl: 4 }} component="a" href="/services/web">
                  <ListItemText primary="Web Development" />
                </ListItemButton>
                <ListItemButton sx={{ pl: 4 }} component="a" href="/services/design">
                  <ListItemText primary="UI/UX Design" />
                </ListItemButton>
                <ListItemButton sx={{ pl: 4 }} component="a" href="/services/seo">
                  <ListItemText primary="SEO & Marketing" />
                </ListItemButton>
              </List>
            </Collapse>

            <ListItem disablePadding>
              <ListItemButton component="a" href="/about" onClick={handleDrawerToggle}>
                <ListItemText primary="About" />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton onClick={handleLogoutClick}>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
