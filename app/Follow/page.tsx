"use client"

// pages/search.tsx
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const SearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null); // Logged-in user email
  const [followedAuthors, setFollowedAuthors] = useState<string[]>([]); // List of followed authors

  // Fetch logged-in user's email and followed authors
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
        fetchFollowedAuthors(user.email); // Fetch followed authors for the logged-in user
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch suggestions based on the search term
  const fetchSuggestions = async () => {
    if (searchTerm.trim() === '') {
      setSuggestions([]);
      return;
    }

    setLoading(true);

    const postsRef = collection(db, 'posts');
    const q = query(postsRef, where('author', '>=', searchTerm), where('author', '<=', searchTerm + '\uf8ff'));

    try {
      const querySnapshot = await getDocs(q);
      const results: any[] = [];
      querySnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });
      setSuggestions(results);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch followed authors for the logged-in user
  const fetchFollowedAuthors = async (email: string) => {
    try {
      const followRef = collection(db, 'follow');
      const q = query(followRef, where('followedBy', '==', email)); // Query where the logged-in user has followed
      const querySnapshot = await getDocs(q);
      const followed: string[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.author) {
          followed.push(data.author); // Store all followed authors
        }
      });
      setFollowedAuthors(followed);
    } catch (error) {
      console.error('Error fetching followed authors:', error);
    }
  };

  // Add the author to the "follow" collection along with the logged-in user's email
  const handleFollow = async (author: string) => {
    if (!userEmail) {
      alert('You must be logged in to follow authors');
      return;
    }

    try {
      await addDoc(collection(db, 'follow'), {
        author,
        followedBy: userEmail, // Add the logged-in user's email to the follow document
        followedAt: new Date(),
      });
      setFollowedAuthors((prev) => [...prev, author]); // Update followed authors list locally
      alert(`${author} added to your follow list!`);
    } catch (error) {
      console.error('Error adding to follow:', error);
    }
  };

  // Update suggestions when the search term changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSuggestions();
    }, 300); // Debounce for 300ms

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Search Authors</h1>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search by author"
        className="border p-2 rounded w-full mb-4"
      />
      
      {loading && <p>Loading...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Search Suggestions Section */}
        <div>
          <h2 className="text-xl font-bold mb-2">Search Results</h2>
          <ul className="list-none">
            {suggestions.map((suggestion) => (
              <li key={suggestion.id} className="flex justify-between items-center mb-2 p-2 border rounded">
                <span>{suggestion.author}</span>
                {followedAuthors.includes(suggestion.author) ? (
                  <button className="bg-gray-500 text-white p-1 rounded" disabled>
                    Followed
                  </button>
                ) : (
                  <button
                    onClick={() => handleFollow(suggestion.author)}
                    className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600"
                  >
                    + Follow
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Followed Authors Section */}
        <div>
          <h2 className="text-xl font-bold mb-2">Authors You Follow</h2>
          <ul className="list-none">
            {followedAuthors.length > 0 ? (
              followedAuthors.map((author, index) => (
                <li key={index} className="flex justify-between items-center mb-2 p-2 border rounded">
                  <span>{author}</span>
                </li>
              ))
            ) : (
              <p>You are not following anyone yet.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
