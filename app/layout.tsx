import type { Metadata } from "next";
 import "./globals.css";
 import { Toaster } from "react-hot-toast";


 

export const metadata: Metadata = {
  title: "Unify Blog App",
  description: "Created by Prashansa and Shivansh",
   icons: {
    icon: '/blog.jpg', // Path to your favicon
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
       >
         <Toaster />
        {children}
      </body>
    </html>
  );
}
