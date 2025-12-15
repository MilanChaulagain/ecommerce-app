'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from "@/components/Navbar";
import BottomNavigation from "@/components/BottomNavigation";

// Define the paths where the navigation components should NOT appear
const excludedPaths = [
  '/search', // Assuming your search page route is /search
  '/admin', // Hide navigation for all admin pages
  // Add other routes here if needed, e.g., '/login', '/checkout'
];

/**
 * Conditionally renders the Navbar and BottomNavigation based on the current route.
 */
export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Check if the current path starts with any of the excluded paths
  const shouldHideNav = excludedPaths.some(path => pathname.startsWith(path));
  
  // Note: If your search page route is complex (e.g., /search/results), 
  // pathname.startsWith('/search') is the correct way to check.

  return (
    <>
      {/* Hide Navbar only if not on an excluded path */}
      {!shouldHideNav && <Navbar />}
      
      {/* Render the children (the main page content) */}
      {children}
      
      {/* Hide BottomNavigation only if not on an excluded path */}
      <BottomNavigation />
    </>
  );
}