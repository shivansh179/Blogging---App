"use client";

import { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, query, onSnapshot } from "firebase/firestore";
import Link from "next/link";
import Navbar from "../Navbar/Navbar";
import RouteGuard from "@/Components/RouteGuard";

export default function Feed() {
  const [posts, setPosts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    // Fetching posts
    const qPosts = query(collection(db, "posts"));
    const unsubscribePosts = onSnapshot(qPosts, (snapshot) => {
      setPosts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    // Fetching users
    const qUsers = query(collection(db, "users"));
    const unsubscribeUsers = onSnapshot(qUsers, (snapshot) => {
      setUsers(snapshot.docs.map((doc) => ({ email: doc.data().email, image: doc.data().image })));
    });

    return () => {
      unsubscribePosts();
      unsubscribeUsers();
    };
  }, []);

  // Helper function to get the avatar of the author from the users collection
  const getUserAvatar = (email: string) => {
    const user = users.find((user) => user.email === email);
    
    console.log(user);
    return user ? user.image : "/avatar.png"; // Default avatar if user not found
  };

  return (
    <RouteGuard>
      <>
        <Navbar />
        <div className="p-6 bg-gradient-to-r from-indigo-800 to-purple-100 min-h-screen">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
              Blog Feed
            </h1>

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
          </div>
        </div>
      </>
    </RouteGuard>
  );
}
