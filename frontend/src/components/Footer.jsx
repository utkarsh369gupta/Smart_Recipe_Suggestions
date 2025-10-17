import React from "react";
import { Github, Linkedin, Mail, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-r from-purple-500/20 via-pink-400/10 to-blue-500/20 backdrop-blur-md text-white py-8 mt-10 border-t border-white/10 shadow-inner">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left side */}
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold tracking-wide bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">
            Ingredient & Recipe Detector 🍲
          </h2>
          <p className="text-sm text-white/70 mt-1">
            Powered by AI · Helping you cook smarter
          </p>
        </div>

        {/* Right side - Social icons */}
        <div className="flex items-center gap-4">
          <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition">
            <Github size={20} />
          </a>
          <a href="https://www.linkedin.com/in/utkarshgupta369/" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition">
            <Linkedin size={20} />
          </a>
          <a href="mailto:utk369gupta@gmail.com" className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition">
            <Mail size={20} />
          </a>
        </div>
      </div>

      {/* Bottom line */}
      <div className="text-center text-white/60 text-sm mt-6 border-t border-white/10 pt-4">
        Made with <Heart size={14} className="inline text-pink-400 mx-1" /> by{" "}
        <span className="font-medium text-purple-300">Utkarsh Gupta</span> © {new Date().getFullYear()}
      </div>
    </footer>
  );
}
