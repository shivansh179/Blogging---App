"use client";

import { useState, useEffect } from "react";
import { auth, db } from "../../firebase"; // Firebase imports
import { onAuthStateChanged, updateProfile, deleteUser } from "firebase/auth";
import { doc, updateDoc, getDocs, collection, query, where, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState<string>(""); // Direct URL for the image
  const [userImage, setUserImage] = useState<string | null>(null); // To store user's existing image URL
  const [followersCount, setFollowersCount] = useState(0); // Store follower count
  const [followingCount, setFollowingCount] = useState(0); // Store following count
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        setName(user.displayName || "");

        // Query the users collection to find a document with matching email
        const q = query(collection(db, "users"), where("email", "==", user.email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // If the user exists in Firestore, get their data
          const userData = querySnapshot.docs[0].data();
          setUserImage(userData.image || null); // Set existing image URL if present
          setName(userData.name || ""); // Set existing name if available
        }

        // Fetching follower count
        const followersRef = collection(db, "users", user.uid, "followers");
        const followersSnapshot = await getDocs(followersRef);
        setFollowersCount(followersSnapshot.size);

        // Fetching following count
        const followingRef = collection(db, "users", user.uid, "following");
        const followingSnapshot = await getDocs(followingRef);
        setFollowingCount(followingSnapshot.size);
      } else {
        router.push("/Auth"); // Redirect to login if not authenticated
      }
    });

    return () => unsubscribe(); // Clean up on component unmount
  }, [router]);

  const handleUpdateProfile = async () => {
    if (user) {
      // Query the users collection to check if the user exists based on their email
      const q = query(collection(db, "users"), where("email", "==", user.email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // If the user exists, update their document with name and image URL
        const userDocRef = querySnapshot.docs[0].ref; // Get reference to the document
        await updateDoc(userDocRef, { name, image: imageUrl });
      } else {
        // If the user does not exist, create a new document
        const userDocRef = doc(db, "users", user.uid); // Use UID for new document
        await setDoc(userDocRef, { name, image: imageUrl, email: user.email });
      }

      // Update the user's display name in Firebase Authentication
      await updateProfile(user, { displayName: name });
      setUserImage(imageUrl);

      // Update the local state
    }
  };

  const handleDeleteAccount = async () => {
    if (user) {
      await deleteUser(user); // Delete the user account
      router.push("/Auth"); // Redirect to login after deletion
    }
  };

  return (
    <div className="p-6 bg-gradient-to-r from-indigo-100 to-blue-100 min-h-screen">
      <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Profile</h1>

        {/* Profile Image Section */}
        <div className="flex flex-col items-center mb-4">
          <img
            src={userImage || "/avatar.png"} // Show user's image if available or default avatar
            alt="Profile"
            className="h-32 w-32 rounded-full object-cover border-2 border-indigo-400"
          />
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="mt-2 border border-gray-300 rounded-lg p-2 w-full"
            placeholder="Enter the image URL"
          />
        </div>

        {/* Name Input */}
        <div className="mb-4">
          <label className="block text-gray-700">Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 w-full"
            placeholder="Enter your name"
          />
        </div>

        {/* Follower and Following Count */}
        <div className="mb-4 text-center">
          <div className="inline-block text-gray-700 mx-4">
            <span className="font-bold text-lg">{followersCount}</span> Followers
          </div>
          <div className="inline-block text-gray-700 mx-4">
            <span className="font-bold text-lg">{followingCount}</span> Following
          </div>
        </div>

        {/* Update Button */}
        <button
          onClick={handleUpdateProfile}
          className="bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600 transition"
        >
          Update Profile
        </button>

        {/* Delete Account Button */}
        <button
          onClick={handleDeleteAccount}
          className="mt-4 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}
