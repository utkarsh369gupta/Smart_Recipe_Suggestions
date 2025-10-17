import React, { useState } from "react";
import { UserButton } from "@clerk/clerk-react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";


import ImageUploader from "./components/ImageUploader";
import GetRecipes from "./components/GetRecipes";
import AboutMe from "./components/AboutMe";
import Footer from "./components/Footer";
import Note from "./components/Note";

export default function App() {

    const [ingredients, setIngredients] = useState([]);
    const [diet, setDiet] = useState("");
    const [recipes, setRecipes] = useState([]);

    return (
        <div className="relative min-h-screen overflow-hidden text-white">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient"></div>

            {/* Subtle blur overlay */}
            <div className="absolute inset-0 backdrop-blur-[100px]"></div>

            {/* 🔹 Transparent Navbar */}
            <nav className="relative z-50 flex items-center justify-between px-6 py-4 bg-transparent">
                <AboutMe />
                <h1 className="text-lg font-semibold tracking-wide md:hidden lg:hidden">Smart Recipes</h1>

                <div className="flex items-center gap-4 md:gap-10 lg:gap-10">
                    <Note />

                    <SignedIn>
                        <UserButton afterSignOutUrl="/" />
                    </SignedIn>

                    <SignedOut>
                        <SignInButton mode="modal">
                            <button className="px-4 py-2 bg-white/20 rounded-lg text-white hover:bg-white/30">
                                Sign In
                            </button>
                        </SignInButton>
                    </SignedOut>
                </div>
            </nav>


            {/* 🔹 Main content layout */}
            <div className="flex flex-col md:flex-row min-h-screen text-center pb-24 gap-4">

                {/* Left Colored Section */}
                <div className="hidden md:flex flex-1 bg-gradient-to-b from-blue-500/30 to-purple-500/20 backdrop-blur-md shadow-inner rounded-r-[60px] p-6 md:mr-20 gap-2">
                    <div className="flex flex-col">
                        <img src="unthinkable.png" alt="Ad" className="w-50 h-50 object-contain" />
                        <p className="text-white font-semibold text-lg">Ad Section</p><hr /><br /><br /><hr /> <br /> <br /><br /> <br />
                        <p className="text-white font-semibold text-lg">Your contribution lets me run heavy AI models on powerful GPUs and keep those pricey APIs running.</p>
                    </div>
                </div>


                {/* Center Section — Main App Content */}
                <div className="flex flex-col items-center justify-start w-full md:w-auto max-w-2xl md:mx-4 px-4">
                    <h1 className="text-3xl font-bold mt-6 m-2 hidden sm:block relative z-10">
                        Smart Recipes
                    </h1>
                    <p className="text-3xl opacity-80 mt-8">Your smart cooking assistant 🍳</p>

                    {/* Image uploader */}
                    <ImageUploader onDetect={setIngredients} />

                    {/* Dietary Preferences */}
                    <div className="m-8 px-4 py-10 rounded-2xl bg-white/10 flex flex-col gap-3 items-center w-[90%] max-w-md shadow-lg backdrop-blur-md">
                        <label className="text-white text-base font-semibold">
                            Your Dietary Preference
                        </label>

                        <select
                            value={diet}
                            onChange={(e) => setDiet(e.target.value)}
                            className="bg-white/50 text-black px-3 pr-8 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/40 w-60"
                        >
                            <option value="">Select preference</option>
                            <option value="Vegetarian">Vegetarian</option>
                            <option value="Vegan">Vegan</option>
                            <option value="Gluten-Free">Gluten-Free</option>
                            <option value="Keto">Keto</option>
                            <option value="Non Vegetarian">Non Vegetarian</option>
                        </select>
                    </div>

                    <GetRecipes ingredients={ingredients} onDetect={setRecipes} />
                </div>

                {/* Right Colored Section */}
                <div className="hidden md:flex flex-1 bg-gradient-to-b from-pink-500/30 to-yellow-500/10 backdrop-blur-md shadow-inner rounded-l-[60px] p-6 md:ml-20">
                    <div className="flex flex-col">
                        <img src="unthinkable.png" alt="Ad" className="w-50 h-50 object-contain" />
                        <p className="text-white font-semibold text-lg">Ad Section</p><hr /><br /><br /><hr /> <br /> <br /><br /> <br />
                        <p className="text-white font-semibold text-lg">Your contribution lets me run heavy AI models on powerful GPUs and keep those pricey APIs running.</p>
                    </div>
                </div>

            </div>

            <Footer></Footer>

        </div>
    );
}
