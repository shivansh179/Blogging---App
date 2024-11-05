"use client";

import { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, doc, query, onSnapshot, deleteDoc, setDoc } from "firebase/firestore";
import Link from "next/link";
import Navbar from "../Navbar/Navbar";
import AdminRouteGuard from "@/Components/AdminRouteGuard";

export default function Admin() {
  const [posts, setPosts] = useState<any[]>([]);
  const [deletedPosts, setDeletedPosts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"allPosts" | "deletedPosts">("allPosts");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const qPosts = query(collection(db, "posts"));
    const unsubscribePosts = onSnapshot(qPosts, (snapshot) => {
      setPosts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false); // Set loading to false once posts are loaded
    });

    const qDeleted = query(collection(db, "deleted"));
    const unsubscribeDeleted = onSnapshot(qDeleted, (snapshot) => {
      setDeletedPosts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false); // Set loading to false once deleted posts are loaded
    });

    return () => {
      unsubscribePosts();
      unsubscribeDeleted();
    };
  }, []);

  const handleDeletePost = async (post: any) => {
    try {
      await setDoc(doc(db, "deleted", post.id), post);
      await deleteDoc(doc(db, "posts", post.id));
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleRestorePost = async (post: any) => {
    try {
      await setDoc(doc(db, "posts", post.id), post);
      await deleteDoc(doc(db, "deleted", post.id));
    } catch (error) {
      console.error("Error restoring post:", error);
    }
  };

  return (
    <AdminRouteGuard>
      <div>
        <Navbar />
        <div className="p-6 bg-gradient-to-b from-gray-100 to-gray-300 min-h-screen">
          <h1 className="text-4xl font-bold text-gray-800 mb-10 text-center">Admin Dashboard</h1>

          <div className="flex justify-center mb-8 space-x-4">
            <button
              onClick={() => setActiveTab("allPosts")}
              className={`px-6 py-2 font-semibold rounded-md ${
                activeTab === "allPosts" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700"
              } hover:bg-indigo-500 hover:text-white transition-colors duration-200`}
            >
              Show Posts
            </button>
            <button
              onClick={() => setActiveTab("deletedPosts")}
              className={`px-6 py-2 font-semibold rounded-md ${
                activeTab === "deletedPosts" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700"
              } hover:bg-indigo-500 hover:text-white transition-colors duration-200`}
            >
              Show Deleted Posts
            </button>
          </div>

          <div className="max-w-6xl mx-auto space-y-10">
            {/* Loading Spinner */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
              </div>
            ) : (
              <>
                {/* All Posts Section */}
                {activeTab === "allPosts" && (
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">All Posts</h2>
                    {posts.length === 0 ? (
                      <p className="text-center text-gray-500">No posts available.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {posts.map((post) => (
                          <div
                            key={post.id}
                            className="bg-white shadow-md rounded-lg p-5 hover:shadow-lg transition-shadow duration-300 relative"
                          >
                            <Link href={`/${post.id}`}>
                              <h3 className="text-lg font-semibold text-gray-800 cursor-pointer hover:text-indigo-600">
                                {post.title}
                              </h3>
                            </Link>
                            <p className="text-sm text-gray-600 mb-2">by {post.author}</p>
                            <p className="text-sm text-gray-500 mb-4">
                              Created on: {new Date(post.date).toLocaleDateString()}
                            </p>

                            <div className="flex justify-end space-x-4 mt-4">
                              <button
                                onClick={() => handleDeletePost(post)}
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Deleted Posts Section */}
                {activeTab === "deletedPosts" && (
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Deleted Posts</h2>
                    {deletedPosts.length === 0 ? (
                      <p className="text-center text-gray-500">No deleted posts available.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {deletedPosts.map((post) => (
                          <div
                            key={post.id}
                            className="bg-gray-100 shadow-md rounded-lg p-5 hover:shadow-lg transition-shadow duration-300 relative"
                          >
                            <h3 className="text-lg font-semibold text-gray-700">{post.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">
                              Deleted on: {new Date(post.date).toLocaleDateString()}
                            </p>

                            <div className="flex justify-end space-x-4 mt-4">
                              <button
                                onClick={() => handleRestorePost(post)}
                                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-200"
                              >
                                Restore
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </AdminRouteGuard>
  );
}
