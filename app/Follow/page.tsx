"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Navbar from "../Navbar/Navbar";
import { FaUserPlus, FaUserMinus } from "react-icons/fa"; // Import follow/unfollow icons

const SearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null); // Logged-in user email
  const [followedAuthors, setFollowedAuthors] = useState<string[]>([]); // List of followed authors
  const [followedDocs, setFollowedDocs] = useState<{ [author: string]: string }>({}); // Store author and follow document ID

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
        fetchFollowedAuthors(user.email!); // Non-null assertion since we know user.email exists
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

    const postsRef = collection(db, "posts");
    const q = query(postsRef, where("author", ">=", searchTerm), where("author", "<=", searchTerm + "\uf8ff"));

    try {
      const querySnapshot = await getDocs(q);
      const results: any[] = [];
      querySnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });
      setSuggestions(results);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowedAuthors = async (email: string) => {
    try {
      const followRef = collection(db, "follow");
      const q = query(followRef, where("followedBy", "==", email)); // Query where the logged-in user has followed
      const querySnapshot = await getDocs(q);
      const followed: string[] = [];
      const followedDocMap: { [author: string]: string } = {};
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.author) {
          followed.push(data.author);
          followedDocMap[data.author] = doc.id; // Map author to document ID for unfollowing
        }
      });
      setFollowedAuthors(followed);
      setFollowedDocs(followedDocMap);
    } catch (error) {
      console.error("Error fetching followed authors:", error);
    }
  };

  const handleFollow = async (author: string) => {
    if (!userEmail) {
      alert("You must be logged in to follow authors");
      return;
    }

    try {
      await addDoc(collection(db, "follow"), {
        author,
        followedBy: userEmail, // Add the logged-in user's email to the follow document
        followedAt: new Date(),
      });
      setFollowedAuthors((prev) => [...prev, author]); // Update followed authors list locally
      alert(`${author} added to your follow list!`);
    } catch (error) {
      console.error("Error adding to follow:", error);
    }
  };

  const handleUnfollow = async (author: string) => {
    if (!userEmail) {
      alert("You must be logged in to unfollow authors");
      return;
    }

    const docId = followedDocs[author];
    if (!docId) {
      return; // Author not followed
    }

    try {
      await deleteDoc(doc(db, "follow", docId)); // Delete the follow document from Firestore
      setFollowedAuthors((prev) => prev.filter((a) => a !== author)); // Remove from local list
      alert(`${author} has been unfollowed.`);
    } catch (error) {
      console.error("Error removing follow:", error);
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
