"use client"

import { FC } from "react";
import { FaPencilAlt, FaUsers, FaRocket } from "react-icons/fa";
import { motion } from "framer-motion";

const HomePage: FC = () => {
  return (
    <div className="bg-gray-50">

      {/* Hero Section */}
      <section
        className="relative text-white py-32 md:py-40 lg:py-48"
        style={{
          backgroundImage: 'url(/bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          height: '100vh',
        }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent"></div>
        
        {/* "Get Started" Button */}
        <a
          href="/Auth"
          className="absolute top-6 right-6 md:top-8 md:right-8 bg-blue-600 text-white py-2 px-4 rounded-full text-sm font-semibold hover:bg-blue-500 transition transform hover:scale-105"
        >
          Get Started
        </a>

        {/* Hero Content */}
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 text-white">
            Welcome to <span className="text-blue-400">MyBlog</span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-6 max-w-3xl mx-auto text-gray-100 leading-relaxed">
            A simple platform for you to express your ideas, share your creativity, and engage with the world.
          </p>
          <a
            href="#features"
            className="bg-blue-600 text-white py-3 px-6 sm:px-8 rounded-full text-lg sm:text-xl font-semibold transition-all transform hover:scale-105 hover:bg-blue-500 duration-200"
          >
            Discover Features
          </a>
        </div>
      </section>

      <section id="features" className="py-20 text-center bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-semibold mb-8 sm:mb-12 text-gray-800">Key Features</h2>
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
            {/* Feature 1 */}
            <motion.div
              className="bg-white shadow-lg rounded-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <FaPencilAlt className="text-blue-600 text-4xl sm:text-5xl mb-4 sm:mb-6 transition transform hover:rotate-12" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Easy Post Creation</h3>
              <p className="text-gray-600 mt-2">
                Write, edit, and publish your posts effortlessly with an intuitive editor.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              className="bg-white shadow-lg rounded-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <FaUsers className="text-blue-600 text-4xl sm:text-5xl mb-4 sm:mb-6 transition transform hover:rotate-12" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Engage with Readers</h3>
              <p className="text-gray-600 mt-2">
                Connect with readers through comments, feedback, and social media sharing.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              className="bg-white shadow-lg rounded-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <FaRocket className="text-blue-600 text-4xl sm:text-5xl mb-4 sm:mb-6 transition transform hover:rotate-12" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Expand Your Reach</h3>
              <p className="text-gray-600 mt-2">
                Share your posts on social media to increase visibility and grow your audience.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="bg-blue-800 text-white py-20 text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-semibold mb-4">Start Your Blogging Journey</h2>
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            Join MyBlog today, share your ideas, and be part of a growing community of creators!
          </p>
          <a
            href="/Auth"
            className="bg-white text-blue-800 py-3 px-8 rounded-full text-xl font-semibold transition transform hover:scale-105 hover:bg-gray-100 duration-200"
          >
            Get Started
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white text-center py-6">
        <p>© 2024 MyBlog. All rights reserved.</p>
      </footer>
    </div>
     
     
  );
};

export default HomePage;
