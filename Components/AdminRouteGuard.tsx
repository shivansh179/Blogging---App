// components/RouteGuard.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import admin from "../admin.json";

export default function AdminRouteGuard({ children }: { children: JSX.Element }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email?.includes(admin.email)) {
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
