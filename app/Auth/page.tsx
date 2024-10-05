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
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-purple-600 via-pink-600 to-red-600">
      <div className=" backdrop-blur-sm backdrop-brightness-150  rounded-lg shadow-lg p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          {isRegistering ? "Register" : "Login"}
        </h2>

        {error && <div className="text-red-500 text-center mb-4">{error}</div>}

        {/* Name Input (Only for Registration) */}
        {isRegistering && (
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mb-4 w-full p-3 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        )}

        {/* Email Input */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full p-3 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
        />

        {/* Password Input */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6 w-full p-3 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
        />

        {/* Auth Button */}
        <button
          onClick={handleAuth}
          className="w-full p-3 bg-gradient-to-r from-purple-600 to-red-600 text-white font-semibold rounded-lg hover:bg-gradient-to-r hover:from-purple-700 hover:to-red-700 transition duration-200"
        >
          {isRegistering ? "Register" : "Login"}
        </button>

        {/* Toggle Between Register and Login */}
        <button
          onClick={() => setIsRegistering(!isRegistering)}
          className="mt-4 w-full text-center text-purple-700 hover:underline"
        >
          {isRegistering
            ? "Already have an account? Login"
            : "Need an account? Register"}
        </button>
      </div>
    </div>
  );
}
