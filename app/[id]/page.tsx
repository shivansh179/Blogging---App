"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import Navbar from "../Navbar/Navbar";
import { FaHeart, FaComment, FaShareAlt } from "react-icons/fa";

export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState<any>(null);
  const [likes, setLikes] = useState<string[]>([]);
  const [comment, setComment] = useState<string>("");
  const [comments, setComments] = useState<string[]>([]);
  const [showLikes, setShowLikes] = useState<boolean>(false);
  const [showComments, setShowComments] = useState<boolean>(false);
  const [authorAvatar, setAuthorAvatar] = useState<string>("");

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

          // Fetch author avatar from users collection using email
          if (postData.author) {
            const usersQuery = doc(db, "users", postData.email); // Assuming postData.author is the email
            
            console.log("avalable ",usersQuery);
            const userSnap = await getDoc(usersQuery);
            if (userSnap.exists()) {
              const userData = userSnap.data();

              console.log("Image is avalable ",userData.image);
              
              setAuthorAvatar(userData.image || "/avatar.png");
            } else {
              console.log("Image is not avalable ");
              // console.log(userSnap.data());
              setAuthorAvatar("/avatar.png");
            }
          }
        } else {
          console.log("No such document!");
        }
      };

      fetchPost();
    }
  }, [id]);

  const handleLike = async () => {
    if (!post) return;

    const currentUser = "user@example.com"; // Replace with actual user

    if (!likes.includes(currentUser)) {
      const postRef = doc(db, "posts", id as string);
      await updateDoc(postRef, {
        likes: arrayUnion(currentUser),
      });

      setLikes((prevLikes) => [...prevLikes, currentUser]);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!post || !comment.trim()) return;

    const postRef = doc(db, "posts", id as string);
    await updateDoc(postRef, {
      comments: arrayUnion(comment),
    });

    setComments((prevComments) => [...prevComments, comment]);
    setComment(""); // Clear input field
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
              src={authorAvatar} // Use fetched author avatar or fallback
              alt="Author Avatar"
              className="h-12 w-12 rounded-full object-cover border-2 border-indigo-400"
            />
            <div className="ml-4">
              <h2 className="text-xl font-semibold text-indigo-700">{post.author}</h2>
              <p className="text-sm text-gray-500">
                {new Date(post.date).toLocaleDateString()}
              </p>
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
          <div className="flex flex-col md:flex-row justify-between px-6 py-4 bg-gray-50 text-sm text-gray-500 border-t">
            <span>Created by: {post.author}</span>
            <span>Posted on: {new Date(post.date).toLocaleDateString()}</span>
          </div>

          {/* Like, Comment, Share Buttons */}
          <div className="flex justify-around items-center px-6 py-4 bg-gray-50 border-t">
            <button
              className="flex items-center space-x-2 text-red-500 hover:text-red-600 transition-colors"
              onClick={handleLike}
            >
              <FaHeart className="h-6 w-6" />
              <span className="hidden md:inline">{likes.length} Likes</span> {/* Hide text on mobile */}
              <span className="md:hidden">{likes.length}</span> {/* Show only number on mobile */}
            </button>
            <button
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
              onClick={() => setShowComments(!showComments)}
            >
              <FaComment className="h-6 w-6" />
              <span className="hidden md:inline">{comments.length} Comments</span> {/* Hide text on mobile */}
              <span className="md:hidden">{comments.length}</span> {/* Show only number on mobile */}
            </button>
            <button
              className="flex items-center space-x-2 text-blue-500 hover:text-blue-600 transition-colors"
              onClick={handleShare}
            >
              <FaShareAlt className="h-6 w-6" />
              <span className="hidden md:inline">Share</span> {/* Hide text on mobile */}
              <span className="md:hidden">🔗</span> {/* Optional: Show a different icon or nothing on mobile */}
            </button>
          </div>

          {/* Likes List */}
          {showLikes && (
            <div className="p-4 bg-gray-100">
              <h3 className="text-xl font-semibold mb-2">Liked by:</h3>
              <ul className="space-y-1">
                {likes.map((like, index) => (
                  <li key={index}>{like}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Comment Section */}
          {showComments && (
            <div className="p-4 bg-gray-100">
              <h3 className="hidden text-xl font-semibold mb-4">Comments:</h3>
              <ul className="space-y-4 mb-4">
                {comments.map((comment, index) => (
                  <li key={index} className="border-b pb-2">{comment}</li>
                ))}
              </ul>

              <form onSubmit={handleCommentSubmit} className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
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
