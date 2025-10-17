import React, { useState, useRef, useEffect } from "react";
import { TbMessageFilled } from "react-icons/tb";

const Note = () => {
  const [showNotice, setShowNotice] = useState(false);
  const popupRef = useRef(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowNotice(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block">
      {/* Icon Button */}
      <button
        className="p-2 rounded-md hover:bg-white/10 transition relative"
        onClick={() => setShowNotice(!showNotice)}
        title="Notice"
      >
        <TbMessageFilled className="w-8 h-8 text-yellow-400" />
      </button>

      {/* Popup */}
      {showNotice && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
        >
          <div
            ref={popupRef}
            className="bg-white/10 backdrop-blur-lg border border-white/20 text-white p-5 rounded-2xl shadow-2xl w-[90%] max-w-md mx-auto"
          >
            <h3 className="text-lg font-semibold text-yellow-300 mb-2">
              Notice ⚠️
            </h3>

            <p className="text-sm text-gray-200 leading-relaxed">
              To use the{" "}
              <span className="font-semibold text-white">
                highly proficient model
              </span>
              , please contact me. <br />
              <a
                href="mailto:utk369gupta@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-2 text-blue-400 hover:underline"
              >
                utk369gupta@gmail.com
              </a>
              <br />
              The current deployment uses the free-tier services, which has limited
              performance.
            </p>

            <div className="mt-3 text-sm">
              The full application with the advanced model is available on GitHub:
              <a
                href="https://github.com/utkarsh369gupta/Smart_Recipe_Suggestions.git"
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-2 text-blue-400 hover:underline"
              >
                🔗 View on GitHub
              </a>
            </div>

            <button
              onClick={() => setShowNotice(false)}
              className="mt-4 w-full bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-300 font-medium py-2 rounded-xl transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Note;
