"use client";

import { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Link from "next/link";
import Navbar from "../Navbar/Navbar";
import RouteGuard from "@/Components/RouteGuard";

export default function Feed() {
  const [posts, setPosts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [followedAuthors, setFollowedAuthors] = useState<string[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get the logged-in user's email
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
        fetchFollowedAuthors(user.email); // Fetch authors the user follows
      } else {
        setUserEmail(null);
        setFollowedAuthors([]); // Clear followed authors if logged out
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Fetch authors that the logged-in user follows
  const fetchFollowedAuthors = async (email: string) => {
    const qFollow = query(collection(db, "follow"), where("followedBy", "==", email));
    onSnapshot(qFollow, (snapshot) => {
      const followed: string[] = [];
      snapshot.forEach((doc) => {
        followed.push(doc.data().author); // Collect authors the user follows
      });
      setFollowedAuthors(followed);
    });
  };

  useEffect(() => {
    if (followedAuthors.length > 0) {
      setLoading(true); // Start loading when posts fetching begins

      // Fetch posts only from followed authors
      const qPosts = query(collection(db, "posts"), where("author", "in", followedAuthors));
      const unsubscribePosts = onSnapshot(qPosts, (snapshot) => {
        setPosts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setLoading(false); // Stop loading once posts are loaded
      });

      // Fetching users to get author avatars
      const qUsers = query(collection(db, "users"));
      const unsubscribeUsers = onSnapshot(qUsers, (snapshot) => {
        setUsers(snapshot.docs.map((doc) => ({ email: doc.data().email, image: doc.data().image })));
      });

      return () => {
        unsubscribePosts();
        unsubscribeUsers();
      };
    } else {
      setLoading(false); // Stop loading if no followed authors
    }
  }, [followedAuthors]);

  // Helper function to get the avatar of the author from the users collection
  const getUserAvatar = (email: string) => {
    const user = users.find((user) => user.email === email);
    return user ? user.image : "/avatar.png"; // Default avatar if user not found
  };

  return (
    <RouteGuard>
      <>
        <Navbar />
        <div className="p-6 bg-gradient-to-b from-purple-100 to-indigo-800 min-h-screen">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
              Blog Feed
            </h1>

            {loading ? (
              // Loading spinner
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
              </div>
            ) : (
              <>
                {posts.length === 0 && (
                  <p className="text-center text-gray-500">No posts available from authors you follow.</p>
                )}

                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white shadow-lg rounded-lg overflow-hidden mb-8 hover:shadow-xl transition-shadow duration-300"
                  >
                    {/* Author Info */}
                    <div className="flex items-center p-4 bg-indigo-50 border-b">
                      <img
                        src={getUserAvatar(post.email)} // Fetching the avatar based on post.email
                        alt="Author Avatar"
                        className="h-12 w-12 rounded-full object-cover border-2 border-indigo-400"
                      />
                      <div className="ml-4">
                        <h2 className="text-lg font-semibold text-indigo-700">
                          {post.author}
                        </h2>
                        <p className="text-sm text-gray-500">
                          {new Date(post.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Post Title (Clickable) */}
                    <div className="p-6">
                      <Link href={`/${post.id}`}>
                        <h3 className="text-2xl font-bold mb-4 text-gray-800 hover:text-indigo-700 transition-colors duration-200 cursor-pointer">
                          {post.title}
                        </h3>
                      </Link>
                    </div>

                    {/* Post Footer */}
                    <div className="flex justify-between px-6 py-4 bg-gray-50 text-sm text-gray-500 border-t">
                      <span>Created by: {post.author}</span>
                      <span>Posted on: {new Date(post.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </>
    </RouteGuard>
  );
}
