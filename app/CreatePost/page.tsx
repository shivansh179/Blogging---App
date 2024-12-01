"use client";

import { useState, useEffect, FormEvent } from 'react';
import { addDoc, collection, getDoc, doc } from 'firebase/firestore';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { auth, db } from '../../firebase';
import { User } from 'firebase/auth';
import Navbar from '../Navbar/Navbar';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const NewBlog = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [email, setEmail] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        setEmail(user.email || ''); // Automatically set the email of the logged-in user
        
        // Fetch user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        console.log("data exists :",user.uid);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setAuthor(userData.name || ''); // Set author name from Firestore
        }
      } else {
        setUser(null);
        setAuthor(''); // Clear author if user is logged out
      }
      setLoading(false);
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const currentDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
    const blog = { title, content, author, email, date: currentDate };

    try {
      await addDoc(collection(db, 'posts'), blog); // Save to posts collection
      toast.success('Blog submitted successfully!');
      setTitle('');
      setContent('');
      setAuthor('');
    } catch (error) {
      toast.error('Failed to submit blog');
      console.error('Error adding document: ', error);
    }
  };

  if (loading) return <p>Loading...</p>;

  if (isSmallScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black text-white text-2xl font-bold p-6">
        <div className="relative p-8 bg-gray-900 rounded-lg shadow-lg">
          <span>Please use  laptop or larger screen to write the blog.</span>
        </div>
      </div>
    );
  }

  return (
    <>
    <Navbar/>
    <div className="container mx-auto p-4 bg-white text-black">
      {user ? (
        <>
          <h1 className="text-3xl font-bold text-center mb-6">Welcome to the Blog Section!!!</h1>
          <form onSubmit={handleSubmit} className="space-y-6 p-8 shadow-lg rounded-lg bg-white">
            <div className="space-y-4">
              <label htmlFor="title" className="block text-lg font-semibold">Title</label>
              <input
                id="title"
                type="text"
                placeholder="Enter your blog title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-200"
                required
              />

              <label htmlFor="content" className="block text-lg font-semibold">Content</label>
              <ReactQuill
                value={content}
                onChange={setContent}
                className="h-64"
                modules={{
                  toolbar: [
                    [{ header: '1' }, { header: '2' }, { font: [] }],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                    [{ color: [] }, { background: [] }],
                    [{ align: [] }],
                    ['link', 'video'],
                    ['image'],
                    ['clean'],
                    ['emoji'],
                  ],
                }}
              />

              <label htmlFor="author" className="block text-lg font-semibold">Author Name</label>
              <input
                id="author"
                type="text"
                placeholder="Enter your name"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full p-3 border border-gray-300 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-200"
                required
              />

              <label htmlFor="email" className="block text-lg font-semibold">Email (Auto-filled)</label>
              <input
                id="email"
                type="text"
                value={email}
                readOnly
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition duration-200"
            >
              Submit
            </button>
          </form>
          <ToastContainer />
        </>
      ) : (
        <div className="fixed inset-0 flex items-center justify-center bg-black text-white text-2xl font-bold p-6">
          <div className="relative p-8 bg-gray-900 rounded-lg shadow-lg">
            <span>Please log in to create a blog post.</span>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default NewBlog;
