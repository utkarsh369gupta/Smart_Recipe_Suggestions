import React, { useState } from "react";
import { Menu } from "lucide-react";

const AboutMe = () => {
    const [showPopupMe, setShowPopupMe] = useState(false);

    const openPopupMe = () => {
        setShowPopupMe(true);
    }

    const closePopupMe = () => {
        setShowPopupMe(false);
    }


    return (
        <div>
            <button className="p-2 rounded-md hover:bg-white/10 transition" onClick={openPopupMe}>
                <Menu className="w-8 h-8 text-yellow-400" />
            </button>

            {
                showPopupMe && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
                        <div className="bg-white/10 p-8 rounded-2xl shadow-2xl w-[90%] max-w-md text-white relative border border-white/20">
                            {/* Close Button */}
                            <button
                                onClick={closePopupMe}
                                className="absolute top-3 right-3 text-white bg-red-500 hover:bg-red-600 rounded-full w-8 h-8 flex items-center justify-center font-bold"
                            >
                                ✕
                            </button>

                            {/* Header */}
                            <h2 className="text-2xl font-bold mb-4 text-center text-yellow-400">
                                About Me
                            </h2>

                            {/* Content */}
                            <div className="flex flex-col gap-3 text-center">
                                <p className="text-white/90">
                                    Hi! I’m <span className="font-semibold text-yellow-300">Utkarsh Gupta</span>, a passionate developer focused on building AI-powered and interactive web applications.
                                </p>

                                <div className="mt-4 space-y-2">
                                    <p>
                                        💼 <span className="text-white/80">LinkedIn:</span>{" "}
                                        <a
                                            href="https://www.linkedin.com/in/utkarshgupta369" // replace with your actual profile
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-400 hover:underline"
                                        >
                                            linkedin.com/in/utkarshgupta
                                        </a>
                                    </p>
                                    <p>
                                        📄 <span className="text-white/80">Resume:</span>{" "}
                                        <a
                                            href="https://drive.google.com/file/d/1e_v_wPYIqU4rel6t7TMGsIdVmGpsFUXS/view?usp=sharing" // replace with actual file or link
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-400 hover:underline"
                                        >
                                            View Resume
                                        </a>
                                    </p>
                                    <p>
                                        ✉️ <span className="text-white/80">Email:</span>{" "}
                                        <a
                                            href="mailto:utk369gupta@email.com" // replace with your actual email
                                            className="text-blue-400 hover:underline"
                                        >
                                            utk369gupta@email.com
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    )
}

export default AboutMe