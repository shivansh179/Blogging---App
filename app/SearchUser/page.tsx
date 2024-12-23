"use client";

import { useState, useEffect } from "react";
import { db } from "../../firebase";
import {
  collection,
  query,
  onSnapshot,
  where,
  getDocs,
  limit,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Navbar from "../Navbar/Navbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function SearchUser() {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [authors, setAuthors] = useState<any[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [followedAuthors, setFollowedAuthors] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Get the logged-in user's email
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user?.email) {
        setUserEmail(user.email);
        fetchFollowedAuthors(user.email);
      } else {
        setUserEmail(null);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const fetchFollowedAuthors = async (email: string) => {
    const q = query(collection(db, "follow"), where("followedBy", "==", email));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const followed = new Set<string>();
      snapshot.forEach((doc) => {
        followed.add(doc.data().author);
      });
      setFollowedAuthors(followed);
    });

    return unsubscribe;
  };

  useEffect(() => {
    // Fetch all authors from the posts collection
    const qAuthors = query(collection(db, "posts"));
    const unsubscribeAuthors = onSnapshot(qAuthors, (snapshot) => {
      const authorsSet = new Set(
        snapshot.docs.map((doc) => doc.data().author) // Collect unique authors
      );
      setAuthors([...authorsSet]);
    });

    return () => unsubscribeAuthors();
  }, []);

  useEffect(() => {
    if (searchTerm.length > 1) {
      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);

  const fetchSuggestions = async () => {
    setError(null);
    setLoading(true);

    try {
      const q = query(
        collection(db, "posts"),
        where("author", ">=", searchTerm),
        where("author", "<=", searchTerm + "\uf8ff"),
        limit(5)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setSuggestions([]);
      } else {
        setSuggestions(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      }

      updateSearchHistory(searchTerm);
    } catch (err) {
      console.error("Error fetching suggestions:", err);
      setError("Error fetching suggestions.");
    }

    setLoading(false);
  };

  const updateSearchHistory = (term: string) => {
    setSearchHistory((prev) => {
      const updatedHistory = [...prev];
      if (!updatedHistory.includes(term)) {
        updatedHistory.unshift(term); // Add the new term to the top
      }
      return updatedHistory.slice(0, 5); // Keep only the last 5 terms
    });
  };

  const handleSearchHistoryClick = (term: string) => {
    setSearchTerm(term);
    fetchSuggestions();
  };

  const handleFollow = async (author: string) => {
    if (!userEmail) {
      toast.error("You must be logged in to follow authors.");
      return;
    }

    try {
      await addDoc(collection(db, "follow"), {
        author,
        followedBy: userEmail,
        followedAt: Timestamp.now(),
      });
      setFollowedAuthors((prev) => new Set([...prev, author]));
      toast.success(`You are now following ${author}`);
    } catch (error) {
      console.error("Error following author:", error);
      toast.error("Failed to follow the author. Please try again.");
    }
  };

  return (
    <>
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-5xl mt-5 mx-auto bg-gradient-to-b from-gray-50 to-white p-6 shadow-lg rounded-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-indigo-800">Search Users</h1>

        <div className="p-6 bg-indigo-50 shadow-lg rounded-lg">
          <input
            type="text"
            placeholder="Search by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-3 w-full border-2 border-indigo-300 rounded-md focus:outline-none focus:border-indigo-500 transition duration-200"
          />

          {/* Error Message */}
          {error && (
            <p className="mt-4 text-center text-red-600 font-semibold">
              {error}
            </p>
          )}

          {/* Suggestions Dropdown */}
          <div className="relative mt-2">
            {loading ? (
              <p className="p-2 text-gray-500 text-center">Loading...</p>
            ) : (
              suggestions.length > 0 && (
                <div className="absolute w-full bg-white shadow-lg rounded-md text-gray-800 z-10">
                  {suggestions.map((user) => (
                    <div
                      key={user.id}
                      className="p-3 border-b cursor-pointer hover:bg-gray-100"
                    >
                      <p>{user.author}</p>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>

          {/* Search Button */}
          <button
            onClick={fetchSuggestions}
            className="mt-4 w-full p-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-md hover:from-indigo-700 hover:to-purple-700 transition duration-200"
          >
            Search
          </button>

          {/* Search History */}
          {searchHistory.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-indigo-800 mb-3">Recent Searches</h3>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((term, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearchHistoryClick(term)}
                    className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg shadow-sm hover:bg-indigo-200 transition duration-150"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Authors List */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4 text-indigo-800">All Authors</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {authors.map((author, index) => (
              <div
                key={index}
                className="bg-white shadow-md rounded-lg p-4 flex justify-between items-center"
              >
                <p className="text-lg font-semibold text-gray-800">{author}</p>
                {followedAuthors.has(author) ? (
                  <button
                    className="px-4 py-2 bg-gray-400 text-white rounded-md cursor-default"
                    disabled
                  >
                    Followed
                  </button>
                ) : (
                  <button
                    onClick={() => handleFollow(author)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200"
                  >
                    Follow
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
