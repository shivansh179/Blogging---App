"use client";

import { useState, useEffect } from 'react';
import { AppBar, Toolbar, IconButton, Menu, MenuItem, Typography, Avatar, Button, Drawer, List, ListItem, ListItemText } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth, db } from '../../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import admin from "../../admin.json";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [dropdownAnchor, setDropdownAnchor] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [adminRights, setAdminRights] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const q = query(collection(db, 'users'), where('email', '==', user.email));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          setProfileImage(userData.image || '/avatar.png');
        }
        if (admin.email.includes(user.email)) {
          setAdminRights(true);
        }
      } else {
        setUser(null);
        setAdminRights(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/Auth');
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setDropdownAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setDropdownAnchor(null);
  };

  const toggleDrawer = (open: boolean) => {
    setDrawerOpen(open);
  };

  return (
    <AppBar position="static" color="default">
      <Toolbar>
        <IconButton edge="start" color="inherit" onClick={() => toggleDrawer(true)} sx={{ display: { md: 'none' } }}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          UniFy
        </Typography>
        
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/Feed" passHref>
            <Button color="inherit">Feed</Button>
          </Link>
          <Link href="/SearchUser" passHref>
            <Button color="inherit">Search Users</Button>
          </Link>
          <Link href="/CreatePost" passHref>
            <Button color="inherit">Create Post</Button>
          </Link>
          <Link href="/Follow" passHref>
            <Button color="inherit">Follow</Button>
          </Link>
        </div>

        {user ? (
          <>
            <IconButton onClick={handleMenuOpen} color="inherit">
              <Avatar src={profileImage || '/avatar.png'} />
            </IconButton>
            <Menu
              anchorEl={dropdownAnchor}
              open={Boolean(dropdownAnchor)}
              onClose={handleMenuClose}
            >
              <Link href="/Profiles" passHref>
                <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
              </Link>
              {adminRights && (
                <Link href="/Admin" passHref>
                  <MenuItem onClick={handleMenuClose}>Admin</MenuItem>
                </Link>
              )}
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </>
        ) : (
          <Link href="/Auth" passHref>
            <Button color="inherit">Login</Button>
          </Link>
        )}
      </Toolbar>

      {/* Mobile Drawer */}
      <Drawer anchor="left" open={drawerOpen} onClose={() => toggleDrawer(false)}>
        <List sx={{ width: 250 }}>
          <ListItem button onClick={() => toggleDrawer(false)}>
            <ListItemText primary="UniFy" />
          </ListItem>
          <Link href="/Feed" passHref>
            <ListItem button onClick={() => toggleDrawer(false)}>
              <ListItemText primary="Feed" />
            </ListItem>
          </Link>
          <Link href="/SearchUser" passHref>
            <ListItem button onClick={() => toggleDrawer(false)}>
              <ListItemText primary="Search Users" />
            </ListItem>
          </Link>
          <Link href="/CreatePost" passHref>
            <ListItem button onClick={() => toggleDrawer(false)}>
              <ListItemText primary="Create Post" />
            </ListItem>
          </Link>
          <Link href="/Follow" passHref>
            <ListItem button onClick={() => toggleDrawer(false)}>
              <ListItemText primary="Follow" />
            </ListItem>
          </Link>
          {user && (
            <Link href="/Profiles" passHref>
              <ListItem button onClick={() => toggleDrawer(false)}>
                <ListItemText primary="Profile" />
              </ListItem>
            </Link>
          )}
          {adminRights && (
            <Link href="/Admin" passHref>
              <ListItem button onClick={() => toggleDrawer(false)}>
                <ListItemText primary="Admin" />
              </ListItem>
            </Link>
          )}
          {user ? (
            <ListItem button onClick={() => { handleLogout(); toggleDrawer(false); }}>
              <ListItemText primary="Logout" />
            </ListItem>
          ) : (
            <Link href="/Auth" passHref>
              <ListItem button onClick={() => toggleDrawer(false)}>
                <ListItemText primary="Login" />
              </ListItem>
            </Link>
          )}
        </List>
      </Drawer>
    </AppBar>
  );
}
