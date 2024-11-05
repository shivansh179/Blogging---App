"use client"

import CreatePost from "../CreatePost/page";
import Navbar from "../Navbar/Navbar";
import AdminRouteGuard from "@/Components/AdminRouteGuard";

export default function Admin() {
  return (
    <AdminRouteGuard>
      <div>
        <Navbar/>
      </div>
      </AdminRouteGuard>
  );
}
