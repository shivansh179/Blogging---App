"use client";

import { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, query, where, getDocs, limit, onSnapshot } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function SearchUser() {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<any[]>([]);

  const router = useRouter(); // Use Next.js router for navigation

  useEffect(() => {
    // Fetching posts
    const qPosts = query(collection(db, "posts"));
    const unsubscribePosts = onSnapshot(qPosts, (snapshot) => {
      setPosts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribePosts(); // Unsubscribe when component unmounts
  }, []);

  useEffect(() => {
    if (searchTerm.length > 1) {  // Suggest only if 2 or more characters are typed
      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);

  const fetchSuggestions = async () => {
    setError(null); // Reset error before searching
    setLoading(true);

    try {
        const q = query(
            collection(db, "posts"),
            where("author", ">=", searchTerm),
            where("author", "<=", searchTerm + "\uf8ff"), // Firestore search range trick
            limit(5) // Limit the number of suggestions
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            setSuggestions([]);
        } else {
            setSuggestions(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }
    } catch (err) {
        console.error("Error fetching suggestions:", err);
        setError("Error fetching suggestions.");
    }

    setLoading(false);
};

  // Function to handle navigation to user-specific page
  const goToUserProfile = (id: string) => {
    router.push(`/${id}`); // Dynamically route to user profile
  };

  return (
    <div className="max-w-5xl mx-auto bg-white p-6 shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">Search Users</h1>

      <div className="p-4 shadow-lg bg-indigo-600 text-black shadow-white">
        <input
          type="text"
          placeholder="Search by name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-3 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                {suggestions.map(user => (
                  <div
                    key={user.id}
                    onClick={() => goToUserProfile(user.id)}
                    className="p-3 border-b cursor-pointer hover:bg-gray-100"
                  >
                    <p>{user.author}</p>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* Search Button - Optional if suggestions are enough */}
        <button
          onClick={fetchSuggestions}
          className="mt-4 w-full p-3 bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold rounded-md hover:from-blue-700 hover:to-green-700 transition duration-200"
        >
          Search
        </button>
      </div>
    </div>
  );
}
