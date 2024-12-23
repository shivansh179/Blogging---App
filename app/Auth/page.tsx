"use client";

import { useState, useEffect } from "react";
import { auth, db } from "../../firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { motion } from "framer-motion"; // Framer Motion for animations
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai"; // Icons for the eye button

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // State for name input
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const [rememberMe, setRememberMe] = useState(false); // State for "Remember Me"

  useEffect(() => {
    // Check if there are saved credentials in localStorage
    const savedEmail = localStorage.getItem("email");
    const savedPassword = localStorage.getItem("password");

    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleAuth = async () => {
    setError(null); // Reset error before starting
    try {
      if (isRegistering) {
        // Check if user already exists using email
        const userQuery = await getDoc(doc(db, "users", email));

        if (userQuery.exists()) {
          setError("User already exists. Please login.");
          return;
        }

        const userCred = await createUserWithEmailAndPassword(auth, email, password);

        // Save user name and email in Firestore
        await setDoc(doc(db, "users", userCred.user.uid), {
          email,
          name,
        });
        handleRememberMe();
        window.location.href = "/Feed"; // Redirect after registration
      } else {
        // Handle login
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        handleRememberMe();
        window.location.href = "/Feed"; // Redirect after login
      }
    } catch (err) {
      console.log(err);
      setError("Authentication failed. Please try again.");
    }
  };

  const handleRememberMe = () => {
    if (rememberMe) {
      // Save credentials in localStorage
      localStorage.setItem("email", email);
      localStorage.setItem("password", password);
    } else {
      // Clear credentials from localStorage
      localStorage.removeItem("email");
      localStorage.removeItem("password");
    }
  };

  return (
    <div
      className="flex items-center justify-center h-screen bg-cover bg-center p-6 relative overflow-hidden"
      style={{ backgroundImage: "url('/blog.jpg')" }}
    >
      {/* Background Particles Animation */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      >
        <div className="absolute w-20 h-20 bg-blue-400 rounded-full opacity-50 blur-xl animate-float"></div>
        <div className="absolute w-24 h-24 bg-pink-400 rounded-full opacity-50 blur-xl animate-float animation-delay-2000"></div>
      </motion.div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900 via-black to-purple-900 opacity-80 z-0"></div>

      {/* Authentication Box */}
      <motion.div
        className="relative bg-white bg-opacity-90 backdrop-blur-lg rounded-3xl shadow-2xl p-10 w-full max-w-md z-10"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          {isRegistering ? "Create Account" : "Welcome Back"}
        </h2>

        {error && (
          <motion.div
            className="text-red-600 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.div>
        )}

        {/* Name Input (Only for Registration) */}
        {isRegistering && (
          <motion.input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mb-4 w-full p-4 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-purple-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          />
        )}

        {/* Email Input */}
        <motion.input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full p-4 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-purple-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        />

        {/* Password Input with Eye Icon */}
        <motion.div
          className="relative mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <input
            type={showPassword ? "text" : "password"} // Toggle input type
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-purple-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)} // Toggle visibility
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-800"
          >
            {showPassword ? <AiFillEyeInvisible size={24} /> : <AiFillEye size={24} />}
          </button>
        </motion.div>

        {/* Remember Me Checkbox */}
        <motion.div
          className="flex items-center mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={() => setRememberMe(!rememberMe)}
            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
          <label
            htmlFor="rememberMe"
            className="ml-2 text-gray-700 text-sm"
          >
            Remember Me
          </label>
        </motion.div>

        {/* Auth Button */}
        <motion.button
          onClick={handleAuth}
          className="w-full py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white font-bold rounded-xl hover:scale-105 transform transition-all duration-300 shadow-lg hover:shadow-2xl"
          whileHover={{ scale: 1.05 }}
        >
          {isRegistering ? "Sign Up" : "Log In"}
        </motion.button>

        {/* Toggle Between Register and Login */}
        <motion.button
          onClick={() => setIsRegistering(!isRegistering)}
          className="mt-4 text-purple-600 hover:underline transition-all duration-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          {isRegistering
            ? "Already have an account? Log In"
            : "Don't have an account? Sign Up"}
        </motion.button>
      </motion.div>
    </div>
  );
}
