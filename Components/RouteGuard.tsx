// components/RouteGuard.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function RouteGuard({ children }: { children: JSX.Element }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        router.push("/");
      }
      setLoading(false);
    });

    return () => unsubscribe(); // Clean up subscription on unmount
  }, [router]);

  if (loading) {
    return <div>loading...</div>; // Show a loading indicator while checking auth
  }

  if (!isAuthenticated) {
    return null; // Prevent rendering of the content until authenticated
  }

  return <>{children}</>;
}
