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
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user?.email) {
        setUserEmail(user.email);
        fetchFollowedAuthors(user.email);
      } else {
        setUserEmail(null);
        setFollowedAuthors([]);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const fetchFollowedAuthors = async (email: string) => {
    const qFollow = query(collection(db, "follow"), where("followedBy", "==", email));
    onSnapshot(qFollow, (snapshot) => {
      const followed: string[] = [];
      snapshot.forEach((doc) => {
        followed.push(doc.data().author);
      });
      setFollowedAuthors(followed);
    });
  };

  useEffect(() => {
    if (followedAuthors.length > 0) {
      setLoading(true);

      const qPosts = query(collection(db, "posts"), where("author", "in", followedAuthors));
      const unsubscribePosts = onSnapshot(qPosts, (snapshot) => {
        setPosts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      });

      const qUsers = query(collection(db, "users"));
      const unsubscribeUsers = onSnapshot(qUsers, (snapshot) => {
        setUsers(snapshot.docs.map((doc) => ({ email: doc.data().email, image: doc.data().image })));
      });

      return () => {
        unsubscribePosts();
        unsubscribeUsers();
      };
    } else {
      setLoading(false);
    }
  }, [followedAuthors]);

  const getUserAvatar = (email: string) => {
    const user = users.find((user) => user.email === email);
    return user ? user.image : "/avatar.png";
  };

  return (
    <RouteGuard>
      <>
        <Navbar />
        <div className="p-6 bg-gradient-to-b from-blue-100 to-blue-50 min-h-screen">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Blog Feed</h1>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
              </div>
            ) : (
              <>
                {posts.length === 0 && (
                  <p className="text-center text-gray-500">No posts available from authors you follow.</p>
                )}

                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white shadow-lg rounded-lg overflow-hidden mb-8 transition-transform transform hover:-translate-y-1 hover:shadow-2xl duration-300"
                  >
                    <div className="flex items-center p-4 bg-gray-100 border-b">
                      <img
                        src={getUserAvatar(post.email)}
                        alt="Author Avatar"
                        className="h-10 w-10 rounded-full object-cover border-2 border-blue-300"
                      />
                      <div className="ml-3">
                        <h2 className="text-lg font-semibold text-gray-700">{post.author}</h2>
                        <p className="text-sm text-gray-400">{new Date(post.date).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="p-6">
                      <Link href={`/${post.id}`}>
                        <h3 className="text-2xl font-semibold mb-4 text-gray-800 hover:text-blue-600 transition duration-200 cursor-pointer">
                          {post.title}
                        </h3>
                      </Link>
                    </div>

                    <div className="flex justify-between px-6 py-4 bg-gray-100 text-sm text-gray-500 border-t">
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
