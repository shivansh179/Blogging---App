"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "../../../firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

export default function UserProfile() {
  const { id } = useParams(); // id is of type string | string[]
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!id || Array.isArray(id)) {
          throw new Error("Invalid user ID format");
        }

        // Decode the email ID (handle URL encoding)
        const decodedId = decodeURIComponent(id);

        // Fetch user data from Firestore
        const userDoc = doc(db, "users", decodedId);
        const userSnapshot = await getDoc(userDoc);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          setUser(userData);

          // Fetch posts created by the user
          const postsQuery = query(
            collection(db, "posts"),
            where("email", "==", decodedId)
          );
          const postsSnapshot = await getDocs(postsQuery);

          const userPosts = postsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setPosts(userPosts);

          // Fetch followers and following from userStats collection
          const statsDoc = doc(db, "userStats", decodedId);
          const statsSnapshot = await getDoc(statsDoc);

          if (statsSnapshot.exists()) {
            setUserStats(statsSnapshot.data());
          }
        } else {
          console.error("User not found");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-purple-300 to-indigo-400">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <div className="text-center mt-10 text-lg text-gray-700">User not found</div>;
  }

  return (
    <>
      {/* Navbar */}
      <nav className="bg-indigo-600 shadow-md py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-white text-2xl font-bold">UniFy Blog</h1>
          <div>
            <a
              href="/Feed"
              className="text-white text-sm font-medium hover:underline transition-all"
            >
              Home
            </a>
          </div>
        </div>
      </nav>

      <div className="p-8 bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-200 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row bg-white shadow-lg rounded-lg overflow-hidden">
            {/* Profile Section */}
            <div className="w-full md:w-1/3 flex flex-col items-center bg-gradient-to-b from-indigo-500 to-purple-600 text-white py-10 px-6">
              <img
                src={user.image || "/avatar.png"}
                alt={`${user.name}'s profile`}
                className="rounded-full w-32 h-32 border-4 border-white object-cover shadow-lg"
              />
              <h1 className="text-3xl font-bold mt-4">{user.name}</h1>
              <p className="text-sm opacity-75">{user.email}</p>
              <div className="flex space-x-6 mt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold">{posts.length}</p>
                  <p className="text-sm opacity-75">Posts</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {userStats?.followerCount || 0}
                  </p>
                  <p className="text-sm opacity-75">Followers</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {userStats?.followingCount || 0}
                  </p>
                  <p className="text-sm opacity-75">Following</p>
                </div>
              </div>
            </div>

            {/* Posts Section */}
            <div className="w-full md:w-2/3 p-8 bg-gray-50">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                {user.name}'s Posts
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1 hover:scale-105"
                  >
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-800 truncate">
                        {post.title}
                      </h3>
                      <div
                        className="text-sm text-gray-600 mt-2 line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                      />
                      <p className="text-xs text-gray-400 mt-4">
                        {new Date(post.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-indigo-600 text-white py-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm">&copy; 2024 UniFy Blog. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
