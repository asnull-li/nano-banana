"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function HashScroll() {
  const pathname = usePathname();

  // Handle initial hash on page load and hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash) {
        // Remove the # from the hash
        const id = hash.substring(1);
        // Small delay to ensure the element is rendered
        setTimeout(() => {
          const element = document.getElementById(id);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 100);
      }
    };

    // Check initial hash on mount
    handleHashChange();

    // Listen for hash changes
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [pathname]);

  return null;
}