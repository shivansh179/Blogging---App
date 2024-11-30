"use client";

import { useState, useEffect } from "react";
import { auth, db } from "../../firebase"; // Firebase imports
import { onAuthStateChanged, updateProfile, deleteUser } from "firebase/auth";
import { doc, updateDoc, getDocs, collection, query, where, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [userImage, setUserImage] = useState<string | null>(null); // To store user's existing image URL
  const [imageFile, setImageFile] = useState<File | null>(null); // Store selected file
  const [followersCount, setFollowersCount] = useState(0); // Store follower count
  const [followingCount, setFollowingCount] = useState(0); // Store following count
  const [isLoading, setIsLoading] = useState(false); // Loading state for updates
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
    if (!user) return;

    let imageUrl = userImage; // Use existing image if no new file is uploaded
    setIsLoading(true); // Start loading

    try {
      if (imageFile) {
        // Upload the image to Cloudinary
        const formData = new FormData();
        formData.append("file", imageFile); // The selected file
        formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ""); // Cloudinary preset
        formData.append("cloud_name", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || ""); // Cloudinary cloud name

        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          formData
        );

        imageUrl = response.data.secure_url; // Get the uploaded image URL
      }

      // Save the new name and image URL to Firestore
      const userDocRef = doc(db, "users", user.email || ""); // Reference to user's Firestore document
      await setDoc(
        userDocRef,
        { name, image: imageUrl, email: user.email },
        { merge: true }
      );

      // Update local state
      setUserImage(imageUrl);
      setImageFile(null); // Clear selected file
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  const handleDeleteAccount = async () => {
    if (user) {
      try {
        await deleteUser(user); // Delete the user account
        alert("Account deleted successfully!");
        router.push("/Auth"); // Redirect to login after deletion
      } catch (error) {
        console.error("Error deleting account:", error);
        alert("Failed to delete account. Please try again.");
      }
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
            type="file"
            accept="image/*" // Accept only image files
            onChange={(e) => setImageFile(e.target.files?.[0] || null)} // Capture selected file
            className="mt-2"
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
          disabled={isLoading} // Disable button during loading
          className={`w-full py-3 px-4 rounded-lg text-lg font-semibold transition ${
            isLoading
              ? "bg-indigo-300 cursor-not-allowed"
              : "bg-indigo-500 text-white hover:bg-indigo-600"
          }`}
        >
          {isLoading ? "Updating..." : "Update Profile"}
        </button>

        {/* Delete Account Button */}
        <button
          onClick={handleDeleteAccount}
          className="w-full mt-4 py-3 px-4 rounded-lg text-lg font-semibold bg-red-500 text-white hover:bg-red-600 transition"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}
