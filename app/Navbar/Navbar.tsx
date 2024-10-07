"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { auth, db } from '../../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDocs, query, where, collection } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { FiMenu, FiSearch, FiPlusCircle, FiUser } from 'react-icons/fi'; // Icons

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false); // Dropdown state for profile menu
  const [menuOpen, setMenuOpen] = useState(false); // Dropdown state for mobile menu
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
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/Auth');
  };

  return (
    <nav className="p-4 bg-gradient-to-r from-pink-500 to-indigo-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo Section */}
        <div className="flex items-center space-x-4">
          <FiMenu
            className="h-8 w-8 cursor-pointer md:hidden"
            onClick={() => setMenuOpen(!menuOpen)} // Toggle menu on mobile
          />
          <Link href="/">
            <div className="text-lg font-bold hover:text-blue-200 transition-colors duration-200">
              UniFy
            </div>
          </Link>
        </div>

        {/* Mobile and Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/Feed">
            <div className="text-lg font-semibold hover:text-blue-200 transition-colors duration-200">
              Feed
            </div>
          </Link>
          <Link href="/SearchUser">
            <div className="text-lg font-semibold hover:text-blue-200 transition-colors duration-200 flex items-center">
              <FiSearch className="mr-1" />
              Search Users
            </div>
          </Link>
          <Link href="/CreatePost">
            <div className="text-lg font-semibold hover:text-blue-200 transition-colors duration-200 flex items-center">
              <FiPlusCircle className="mr-1" />
              Create Post
            </div>
          </Link>
        </div>

        {/* Profile Section */}
        <div className="relative">
          {user ? (
            <img
              src={profileImage || '/avatar.png'}
              alt="Profile"
              className="h-10 w-10 rounded-full cursor-pointer hover:opacity-80"
              onClick={() => setDropdownOpen(!dropdownOpen)} // Toggle dropdown
            />
          ) : (
            <Link href="/Auth">
              <div className="text-lg font-semibold hover:text-blue-200 transition-colors duration-200">
                Login
              </div>
            </Link>
          )}

          {/* Dropdown for Mobile */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-lg shadow-lg z-50">
              <Link href="/Feed">
                <div className="px-4 py-2 hover:bg-gray-200 cursor-pointer">
                  Feed
                </div>
              </Link>
              <Link href="/SearchUser">
                <div className="px-4 py-2 hover:bg-gray-200 cursor-pointer">
                  Search Users
                </div>
              </Link>
              <Link href="/CreatePost">
                <div className="px-4 py-2 hover:bg-gray-200 cursor-pointer">
                  Create Post
                </div>
              </Link>
              <Link href="/Profiles">
                <div className="px-4 py-2 hover:bg-gray-200 cursor-pointer">
                  Profile
                </div>
              </Link>
              <div
                onClick={handleLogout}
                className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
              >
                Logout
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Items (Toggle Dropdown) */}
      {/* {menuOpen && (
        <div className="md:hidden mt-4 flex flex-col space-y-4">
          <Link href="/Feed">
            <div className="text-lg font-semibold hover:text-blue-200 transition-colors duration-200">
              Feed
            </div>
          </Link>
          <Link href="/SearchUser">
            <div className="text-lg font-semibold hover:text-blue-200 transition-colors duration-200 flex items-center">
              <FiSearch className="mr-1" />
              Search Users
            </div>
          </Link>
          <Link href="/CreatePost">
            <div className="text-lg font-semibold hover:text-blue-200 transition-colors duration-200 flex items-center">
              <FiPlusCircle className="mr-1" />
              Create Post
            </div>
          </Link>
          {user ? (
            <div
              onClick={handleLogout}
              className="text-lg font-semibold hover:text-blue-200 transition-colors duration-200"
            >
              Logout
            </div>
          ) : (
            <Link href="/Auth">
              <div className="text-lg font-semibold hover:text-blue-200 transition-colors duration-200">
                Login
              </div>
            </Link>
          )}
        </div>
      )} */}
    </nav>
  );
}
