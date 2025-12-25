import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#0b0b0b] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* Top Row */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">

          {/* Brand / Copyright */}
          <div className="text-center md:text-left">
            <p className="text-sm font-semibold tracking-wide text-white">
              SHOECREATIFY
            </p>
            <p className="mt-2 text-xs text-gray-400">
              © {new Date().getFullYear()} ShoeCreatify. All rights reserved.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-6 text-xs uppercase tracking-widest font-semibold">
            <Link
              to="/privacy"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              to="/contact"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Contact
            </Link>
          </div>

        </div>

        {/* Divider */}
        <div className="my-10 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Bottom Row */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>
            Crafted with precision. Designed for individuality.
          </p>
          <p className="tracking-widest uppercase">
            Made for Creators
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
