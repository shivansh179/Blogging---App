"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import Navbar from "../Navbar/Navbar";
import { FaHeart, FaComment, FaShareAlt } from "react-icons/fa";

export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState<any>(null);
  const [likes, setLikes] = useState<string[]>([]);
  const [comments, setComments] = useState<{ text: string; email: string }[]>([]);
  const [comment, setComment] = useState<string>("");
  const [users, setUsers] = useState<any[]>([]);
  const [showComments, setShowComments] = useState<boolean>(false);
  const [followersCount, setFollowersCount] = useState<number>(0); // Follower count
  const [followingCount, setFollowingCount] = useState<number>(0); // Following count
  const currentUserEmail = "user@example.com"; // Replace with authenticated user's email.

  useEffect(() => {
    // Fetch all user data for mapping
    const unsubscribeUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      setUsers(snapshot.docs.map((doc) => doc.data()));
    });

    return () => unsubscribeUsers();
  }, []);

  useEffect(() => {
    if (id) {
      const fetchPost = async () => {
        const docRef = doc(db, "posts", id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const postData = docSnap.data();
          setPost({ id: docSnap.id, ...postData });
          setLikes(postData.likes || []);
          setComments(postData.comments || []);

          // Fetch followers and following counts
          const followersSnapshot = await getDocs(
            query(collection(db, "follow"), where("author", "==", postData.email))
          );
          setFollowersCount(followersSnapshot.size);

          const followingSnapshot = await getDocs(
            query(collection(db, "follow"), where("followedBy", "==", postData.email))
          );
          setFollowingCount(followingSnapshot.size);
        } else {
          console.error("Post not found in Firestore.");
        }
      };

      fetchPost();
    }
  }, [id]);

  const handleLike = async () => {
    if (!post) return;

    const postRef = doc(db, "posts", id as string);
    const alreadyLiked = likes.includes(currentUserEmail);

    if (!alreadyLiked) {
      await updateDoc(postRef, {
        likes: arrayUnion(currentUserEmail),
      });

      setLikes((prevLikes) => [...prevLikes, currentUserEmail]);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const postRef = doc(db, "posts", id as string);
    const newComment = { text: comment, email: currentUserEmail };

    await updateDoc(postRef, {
      comments: arrayUnion(newComment),
    });

    setComments((prevComments) => [...prevComments, newComment]);
    setComment("");
  };

  const getUserAvatar = (email: string) => {
    const user = users.find((user) => user.email === email);
    return user ? user.image : "/avatar.png";
  };

  const getUserName = (email: string) => {
    const user = users.find((user) => user.email === email);
    return user ? user.name : "Anonymous";
  };

  const handleShare = () => {
    const postUrl = window.location.href;
    navigator.clipboard.writeText(postUrl);
    alert("Post link copied to clipboard!");
  };

  if (!post) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="p-4 bg-gradient-to-r from-indigo-100 to-blue-100 min-h-screen">
        <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Post Header */}
          <div className="flex items-center p-6 bg-indigo-50">
            <img
              src={getUserAvatar(post.email)} // Fetch author's avatar
              alt="Author Avatar"
              className="h-12 w-12 rounded-full object-cover border-2 border-indigo-400"
            />
            <div className="ml-4">
              <h2 className="text-xl font-semibold text-indigo-700">{getUserName(post.email)}</h2>
              <p className="text-sm text-gray-500">{new Date(post.date).toLocaleDateString()}</p>
              {/* Follower and Following Counts */}
              <div className="mt-2 flex space-x-4 text-gray-600">
                <div>
                  <span className="font-semibold">{followersCount}</span> Followers
                </div>
                <div>
                  <span className="font-semibold">{followingCount}</span> Following
                </div>
              </div>
            </div>
          </div>

          {/* Post Content */}
          <div className="p-6">
            <h1 className="text-4xl font-bold mb-6 text-gray-800">{post.title}</h1>
            <div
              className="content leading-relaxed text-gray-700 text-lg"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          {/* Post Footer */}
          <div className="flex justify-between px-6 py-4 bg-gray-100 text-sm text-gray-500 border-t">
            <span>Created by: {getUserName(post.email)}</span>
            <span>Posted on: {new Date(post.date).toLocaleDateString()}</span>
          </div>

          {/* Like, Comment, Share Buttons */}
          <div className="flex justify-around items-center px-6 py-4 bg-gray-50 border-t">
            <button
              className={`flex items-center space-x-2 ${
                likes.includes(currentUserEmail)
                  ? "text-red-500"
                  : "text-gray-700 hover:text-red-500"
              } transition-colors`}
              onClick={handleLike}
            >
              <FaHeart className="h-6 w-6" />
              <span>{likes.length} Likes</span>
            </button>
            <button
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
              onClick={() => setShowComments(!showComments)}
            >
              <FaComment className="h-6 w-6" />
              <span>{comments.length} Comments</span>
            </button>
            <button
              className="flex items-center space-x-2 text-blue-500 hover:text-blue-600 transition-colors"
              onClick={handleShare}
            >
              <FaShareAlt className="h-6 w-6" />
              <span>Share</span>
            </button>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="p-4 bg-gray-100">
              <h3 className="text-xl font-semibold mb-4">Comments:</h3>
              <ul className="space-y-4 mb-4">
                {comments.map((comment, index) => (
                  <li key={index} className="border-b pb-2">
                    <div className="flex items-center space-x-2">
                      <img
                        src={getUserAvatar(comment.email)}
                        alt="User Avatar"
                        className="h-8 w-8 rounded-full object-cover"
                      />
                      <span className="font-semibold text-gray-700">
                        {getUserName(comment.email)}
                      </span>
                    </div>
                    <p className="text-gray-600">{comment.text}</p>
                  </li>
                ))}
              </ul>
              <form onSubmit={handleCommentSubmit} className="flex space-x-4">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-grow p-2 border rounded focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors"
                >
                  Comment
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
