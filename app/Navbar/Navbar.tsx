"use client";

import { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Avatar,
  Button,
  Drawer,
  List,
  Divider,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Search as SearchIcon,
  Create as CreateIcon,
  Group as GroupIcon,
  AdminPanelSettings as AdminIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth, db } from "../../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { ListItem, ListItemButton, ListItemText } from "@mui/material";
import { collection, getDocs, query, where } from "firebase/firestore";
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
        const q = query(collection(db, "users"), where("email", "==", user.email));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          setProfileImage(userData.image || "/avatar.png");
        }
        if (user.email && admin.email.includes(user.email)) {
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
    router.push("/");
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
    <AppBar
      position="sticky"
      sx={{
        background: "linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)",
        color: "#fff",
      }}
      elevation={4}
    >
      <Toolbar>
        {/* Mobile Drawer Toggle */}
        <IconButton
          edge="start"
          color="inherit"
          onClick={() => toggleDrawer(true)}
          sx={{ display: { md: "none" } }}
        >
          <MenuIcon />
        </IconButton>
        <Typography
          variant="h5"
          sx={{
            flexGrow: 1,
            fontFamily: "Poppins, sans-serif",
            fontWeight: 600,
            cursor: "pointer",
          }}
          onClick={() => router.push("/Feed")}
        >
          UniFy
        </Typography>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/Feed" passHref>
            <Button color="inherit" startIcon={<HomeIcon />} sx={{ fontWeight: "bold" }}>
              Feed
            </Button>
          </Link>
          <Link href="/SearchUser" passHref>
            <Button color="inherit" startIcon={<SearchIcon />} sx={{ fontWeight: "bold" }}>
              Search Users
            </Button>
          </Link>
          <Link href="/CreatePost" passHref>
            <Button color="inherit" startIcon={<CreateIcon />} sx={{ fontWeight: "bold" }}>
              Create Post
            </Button>
          </Link>
          <Link href="/Follow" passHref>
            <Button color="inherit" startIcon={<GroupIcon />} sx={{ fontWeight: "bold" }}>
              Follow
            </Button>
          </Link>
        </div>

        {/* User Section */}
        {user ? (
          <>
            <IconButton onClick={handleMenuOpen} color="inherit">
              <Avatar src={profileImage || "/avatar.png"} />
            </IconButton>
            <Menu
              anchorEl={dropdownAnchor}
              open={Boolean(dropdownAnchor)}
              onClose={handleMenuClose}
            >
              <Link href="/Profiles" passHref>
                <MenuItem onClick={handleMenuClose}>
                  <AccountIcon sx={{ marginRight: 1 }} />
                  Profile
                </MenuItem>
              </Link>
              {adminRights && (
                <Link href="/Admin" passHref>
                  <MenuItem onClick={handleMenuClose}>
                    <AdminIcon sx={{ marginRight: 1 }} />
                    Admin
                  </MenuItem>
                </Link>
              )}
              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ marginRight: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Link href="/Auth" passHref>
            <Button color="inherit" sx={{ fontWeight: "bold" }}>
              Login
            </Button>
          </Link>
        )}
      </Toolbar>

      {/* Mobile Drawer */}
              <Drawer anchor="left" open={drawerOpen} onClose={() => toggleDrawer(false)}>
          <List sx={{ width: 250 }}>
            <ListItem>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                UniFy
              </Typography>
            </ListItem>
            <Divider />
            <Link href="/Feed" passHref>
              <ListItemButton component="a" onClick={() => toggleDrawer(false)}>
                <HomeIcon sx={{ marginRight: 5 }} />
                <ListItemText primary="Feed" />
              </ListItemButton>
            </Link>
            <Link href="/SearchUser" passHref>
              <ListItemButton component="a" onClick={() => toggleDrawer(false)}>
                <SearchIcon sx={{ marginRight: 5 }} />
                <ListItemText primary="Search Users" />
              </ListItemButton>
            </Link>
            <Link href="/CreatePost" passHref>
              <ListItemButton component="a" onClick={() => toggleDrawer(false)}>
                <CreateIcon sx={{ marginRight: 5 }} />
                <ListItemText primary="Create Post" />
              </ListItemButton>
            </Link>
            <Link href="/Follow" passHref>
              <ListItemButton component="a" onClick={() => toggleDrawer(false)}>
                <GroupIcon sx={{ marginRight: 5 }} />
                <ListItemText primary="Follow" />
              </ListItemButton>
            </Link>
            {user && (
              <Link href="/Profiles" passHref>
                <ListItemButton component="a" onClick={() => toggleDrawer(false)}>
                  <AccountIcon sx={{ marginRight: 5 }} />
                  <ListItemText primary="Profile" />
                </ListItemButton>
              </Link>
            )}
            {adminRights && (
              <Link href="/Admin" passHref>
                <ListItemButton component="a" onClick={() => toggleDrawer(false)}>
                  <AdminIcon sx={{ marginRight: 5 }} />
                  <ListItemText primary="Admin" />
                </ListItemButton>
              </Link>
            )}
            {user ? (
              <ListItemButton onClick={() => { handleLogout(); toggleDrawer(false); }}>
                <LogoutIcon sx={{ marginRight: 5 }} />
                <ListItemText primary="Logout" />
              </ListItemButton>
            ) : (
              <Link href="/Auth" passHref>
                <ListItemButton component="a" onClick={() => toggleDrawer(false)}>
                  <AccountIcon sx={{ marginRight: 5 }} />
                  <ListItemText primary="Login" />
                </ListItemButton>
              </Link>
            )}
          </List>
</Drawer>

    </AppBar>
  );
}
