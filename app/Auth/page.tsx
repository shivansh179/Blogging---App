"use client";

import { useState } from "react";
import { auth, db } from "../../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // State for name input
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        window.location.href = "/Feed"; // Redirect after registration
      } else {
        // Handle login
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        window.location.href = "/Feed"; // Redirect after login
      }
    } catch (err) {
      console.log(err);
      setError("Authentication failed. Please try again.");
    }
  };

  return (
    <div
      className="flex items-center justify-center h-screen bg-cover bg-center p-6"
      style={{ backgroundImage: "url('/blog.jpg')" }}
    >
      <div className="absolute inset-0 bg-black opacity-40"></div> {/* Background Overlay */}

      <div className="relative bg-white bg-opacity-90 backdrop-blur-lg rounded-xl shadow-2xl p-10 w-full max-w-lg border border-gray-300 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-6">
          {isRegistering ? "Create Account" : "Welcome Back"}
        </h2>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        {/* Name Input (Only for Registration) */}
        {isRegistering && (
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mb-4 w-full p-3 border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}

        {/* Email Input */}
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full p-3 border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Password Input */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6 w-full p-3 border rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Auth Button */}
        <button
          onClick={handleAuth}
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105"
        >
          {isRegistering ? "Sign Up" : "Log In"}
        </button>

        {/* Toggle Between Register and Login */}
        <button
          onClick={() => setIsRegistering(!isRegistering)}
          className="mt-4 text-blue-600 hover:underline transition-all duration-200"
        >
          {isRegistering
            ? "Already have an account? Log In"
            : "Don't have an account? Sign Up"}
        </button>
      </div>
    </div>
  );
}
