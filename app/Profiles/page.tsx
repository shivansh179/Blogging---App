"use client";

import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify"; // Import Toastify
import "react-toastify/dist/ReactToastify.css"; // Import Toastify CSS
import { auth, db } from "../../firebase"; // Firebase imports
import { onAuthStateChanged, updateProfile, deleteUser } from "firebase/auth";
import { doc, updateDoc, getDocs, collection, query, where, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link"; // For navigation to dynamic route

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [userImage, setUserImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [userPosts, setUserPosts] = useState<any[]>([]); // State for user posts
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {

     console.log('====================================');
     console.log(user);
     console.log('====================================');
      if (user) {
        setUser(user);
        setName(user.displayName || "");

        // Fetch user data from Firestore
        const q = query(collection(db, "users"), where("email", "==", user.email));
        const querySnapshot = await getDocs(q);

        

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          setUserImage(userData.image || null);
          setName(userData.name || "");
        }

        

// <<<<<<< HEAD
        const loggedInUserName = querySnapshot.docs[0]?.data()?.author || user.displayName;

        // Fetch user posts 
        const postsRef = collection(db, "posts");
        const postsQuery = query(postsRef, where("author", "==", loggedInUserName));
        const postsSnapshot = await getDocs(postsQuery);

        const posts = postsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUserPosts(posts); // Store user posts in state

        // Fetch followers and following count
        const followersRef = collection(db, "follow");
        const followersQuery = query(followersRef, where("author", "==", loggedInUserName));
        const followersSnapshot = await getDocs(followersQuery);
        setFollowersCount(followersSnapshot.size);

        const followingRef = collection(db, "follow");
        const followingQuery = query(followingRef, where("followedBy", "==", user.email));
// =======
//         // Fetching follower count
//         const followersQuery = query(collection(db, "follow"), where("author", "==", user.email));
//         const followersSnapshot = await getDocs(followersQuery);
//         setFollowersCount(followersSnapshot.size);

//         // Fetching following count
//         const followingQuery = query(collection(db, "follow"), where("followedBy", "==", user.email));
// >>>>>>> b800458da6b1f99cc00678d71974bb2207d4d115
        const followingSnapshot = await getDocs(followingQuery);
        setFollowingCount(followingSnapshot.size);
      } else {
        router.push("/Auth");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleUpdateProfile = async () => {
    if (!user) return;

    let imageUrl = userImage;
    setIsLoading(true);

    try {
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "");
        formData.append("cloud_name", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "");

        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          formData
        );

        imageUrl = response.data.secure_url;

        console.log(imageUrl);
      }

      const userDocRef = doc(db, "users", user.email || "");
      await setDoc(
        userDocRef,
        { name, image: imageUrl, email: user.email },
        { merge: true }
      );

      setUserImage(imageUrl);
// <<<<<<< HEAD
      setImageFile(null);
      alert("Profile updated successfully!");
// =======
//       setImageFile(null); // Clear selected file
//       toast.success("Profile updated successfully!"); // Success toast
// >>>>>>> b800458da6b1f99cc00678d71974bb2207d4d115
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again."); // Error toast
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (user) {
      try {
         await deleteUser(user);
        alert("Account deleted successfully!");
        router.push("/Auth");
 
       } catch (error) {
        console.error("Error deleting account:", error);
        toast.error("Failed to delete account. Please try again."); // Error toast
      }
    }
  };

  return (
    <div className="p-6 bg-gradient-to-r from-indigo-100 to-blue-100 min-h-screen">
      <ToastContainer /> {/* Add Toastify container */}
      <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Profile</h1>

        <div className="flex flex-col items-center mb-4">
          <img
            src={userImage || "/avatar.png"}
            alt="Profile"
            className="h-32 w-32 rounded-full object-cover border-2 border-indigo-400"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="mb-2"
          />
        </div>

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

        <div className="mb-4 text-center">
          <div className="inline-block text-gray-700 mx-4">
            <span className="font-bold text-lg">{followersCount}</span> Followers
          </div>
          <div className="inline-block text-gray-700 mx-4">
            <span className="font-bold text-lg">{followingCount}</span> Following
          </div>
        </div>

        <button
          onClick={handleUpdateProfile}
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-lg text-lg font-semibold transition ${
            isLoading
              ? "bg-indigo-300 cursor-not-allowed"
              : "bg-indigo-500 text-white hover:bg-indigo-600"
          }`}
        >
          {isLoading ? "Updating..." : "Update Profile"}
        </button>

        <button
          onClick={handleDeleteAccount}
          className="w-full mt-4 py-3 px-4 rounded-lg text-lg font-semibold bg-red-500 text-white hover:bg-red-600 transition"
        >
          Delete Account
        </button>
      </div>

      {/* User's Posts Grid */}
      <div className="mt-8 max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Your Posts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {userPosts.map((post) => (
            <Link key={post.id} href={`/${post.id}`}>
              <div className="block p-6 bg-white shadow rounded-lg hover:shadow-lg transition">
                <h3 className="text-lg font-semibold text-gray-800">{post.title}</h3>
               </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
