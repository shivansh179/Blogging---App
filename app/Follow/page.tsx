"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { db } from "@/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Navbar from "../Navbar/Navbar";
import { FaUserPlus, FaUserMinus } from "react-icons/fa"; // Import follow/unfollow icons
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";

const SearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null); // Logged-in user email
  const [followedAuthors, setFollowedAuthors] = useState<string[]>([]); // List of followed authors
  const [followedDocs, setFollowedDocs] = useState<{ [author: string]: string }>({}); // Store author and follow document ID
  const [authorName, setAuthorName] = useState<{ [author: string]: string }>({}); // Store author and follow document ID
 
  useEffect(() => {
    const auth = getAuth();
  
    const fetchUserNameFromPosts = async (email: string) => {
      try {
        const postsRef = collection(db, "posts");
        const q = query(postsRef, where("email", "==", email)); // Search by email
        const querySnapshot = await getDocs(q);
  
        if (!querySnapshot.empty) {
          const data = querySnapshot.docs[0].data();
          setAuthorName(data.author); // Store the corresponding author name
        } else {
          console.log("No posts found for this email.");
        }
      } catch (error) {
        console.error("Error fetching author name by email:", error);
      }
    };
  
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
// <<<<<<< HEAD
        setUserEmail(user.email); // Set logged-in user's email
        fetchFollowedAuthors(user.email!); // Fetch followed authors
        
        // Fetch author name using email
        fetchUserNameFromPosts(user.email!);
// =======
//         setUserEmail(user.email);
//         fetchFollowedAuthors(user.email!); // Fetch followed authors in real time
// >>>>>>> b800458da6b1f99cc00678d71974bb2207d4d115
      }
    });
  
    return () => unsubscribe();
  }, []);

  const fetchSuggestions = async () => {
    if (searchTerm.trim() === "") {
      setSuggestions([]);
      return;
    }
  
    setLoading(true);
  
    try {
// <<<<<<< HEAD
      const postsRef = collection(db, "posts");
      const q = query(
        postsRef,
        where("author", ">=", searchTerm),
        where("author", "<=", searchTerm + "\uf8ff")
      );
  
      const querySnapshot = await getDocs(q);
      const results: any[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Exclude the logged-in user's name
        if (data.author !== authorName) {
          results.push({ id: doc.id, ...data });
        }
      });
  
      setSuggestions(results);
// =======
//       const unsubscribe = onSnapshot(q, (snapshot) => {
//         const results: any[] = [];
//         snapshot.forEach((doc) => {
//           results.push({ id: doc.id, ...doc.data() });
//         });
//         setSuggestions(results);
//         setLoading(false);
//       });

//       return () => unsubscribe(); // Clean up
// >>>>>>> b800458da6b1f99cc00678d71974bb2207d4d115
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setLoading(false);
      toast.error("Failed to fetch suggestions. Please try again.");
    }
  };
  

  const fetchFollowedAuthors = (email: string) => {
    const followRef = collection(db, "follow");
    const q = query(followRef, where("followedBy", "==", email));

    return onSnapshot(q, (snapshot) => {
      const followed: string[] = [];
      const followedDocMap: { [author: string]: string } = {};

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.author) {
          followed.push(data.author);
          followedDocMap[data.author] = doc.id;
        }
      });

      setFollowedAuthors(followed);
      setFollowedDocs(followedDocMap);
    });
  };

  const handleFollow = async (author: string) => {
    if (!userEmail) {
      toast.error("You must be logged in to follow authors");
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "follow"), {
        author,
        followedBy: userEmail,
        followedAt: new Date(),
      });

      setFollowedAuthors((prev) => [...prev, author]); // Add author locally
      setFollowedDocs((prev) => ({ ...prev, [author]: docRef.id })); // Map new Firestore doc ID
      toast.success(`${author} added to your follow list!`);
    } catch (error) {
      console.error("Error adding follow:", error);
      toast.error("Failed to follow the author. Please try again.");
    }
  };

  const handleUnfollow = async (author: string) => {
    if (!userEmail) {
      toast.error("You must be logged in to unfollow authors");
      return;
    }

    const docId = followedDocs[author];
    if (!docId) return; // Author not followed

    try {
      await deleteDoc(doc(db, "follow", docId)); // Remove follow document from Firestore
      setFollowedAuthors((prev) => prev.filter((a) => a !== author)); // Remove locally
      setFollowedDocs((prev) => {
        const { [author]: _, ...rest } = prev;
        return rest;
      });
      toast.success(`${author} has been unfollowed.`);
    } catch (error) {
      console.error("Error removing follow:", error);
      toast.error("Failed to unfollow the author. Please try again.");
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSuggestions();
    }, 300); // Debounce for 300ms

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  return (
    <>
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto bg-white p-4 sm:p-6 shadow-lg rounded-lg">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 mb-4 sm:mb-6">
            Search Authors
          </h1>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by author"
            className="border border-gray-300 p-2 sm:p-3 rounded-lg w-full mb-4 sm:mb-6 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
          />

          {loading && <p className="text-indigo-500">Loading...</p>}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-8 mt-4 sm:mt-6">
            {/* Search Suggestions Section */}
            <div className="bg-indigo-50 p-4 sm:p-5 rounded-lg shadow-md">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4">
                Search Results
              </h2>
              <ul className="list-none space-y-3 sm:space-y-4">
                {suggestions.map((suggestion) => (
                  <li
                    key={suggestion.id}
                    className="flex justify-between items-center p-3 sm:p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <span className="text-gray-700 text-lg font-medium">
                      {suggestion.author}
                    </span>
                    {followedAuthors.includes(suggestion.author) ? (
                      <button
                        onClick={() => handleUnfollow(suggestion.author)}
                        className="bg-red-600 text-white py-1 px-2 sm:py-1 sm:px-4 rounded-lg hover:bg-red-700 transition-all flex items-center"
                      >
                        <FaUserMinus className="mr-1 sm:mr-2" />
                        Unfollow
                      </button>
                    ) : (
                      <button
                        onClick={() => handleFollow(suggestion.author)}
                        className="bg-indigo-600 text-white py-1 px-2 sm:py-1 sm:px-4 rounded-lg hover:bg-indigo-700 transition-all flex items-center"
                      >
                        <FaUserPlus className="mr-1 sm:mr-2" />
                        + Follow
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Followed Authors Section */}
            <div className="bg-indigo-50 p-4 sm:p-5 rounded-lg shadow-md">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4">
                Authors You Follow
              </h2>
              <ul className="list-none space-y-3 sm:space-y-4">
                {followedAuthors.length > 0 ? (
                  followedAuthors.map((author, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center p-3 sm:p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    >
                      <span className="text-gray-700 text-lg font-medium">
                        {author}
                      </span>
                      <button
                        onClick={() => handleUnfollow(author)}
                        className="bg-red-600 text-white py-1 px-2 sm:py-1 sm:px-4 rounded-lg hover:bg-red-700 transition-all flex items-center"
                      >
                        <FaUserMinus className="mr-1 sm:mr-2" />
                        Unfollow
                      </button>
                    </li>
                  ))
                ) : (
                  <p className="text-gray-500">You are not following anyone yet.</p>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchPage;
