import React, { useState, useEffect, useRef } from "react";

export default function ImageUploader({ onDetect }) {
    const [image, setImage] = useState(null);
    const [imageSource, setImageSource] = useState("");
    const [ingredients, setIngredients] = useState([]);
    const [manualInput, setManualInput] = useState("");
    const [loading, setLoading] = useState(false);

    const [showSamples, setShowSamples] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowSamples(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Predefined sample images and their ingredients
    const sampleImages = [
        {
            name: "Pasta Ingredients",
            src: "pasta_ingredients.jpg",
            ingredients: ["Tomato", "Garlic", "Basil", "Olive Oil", "Pasta", "Onion", "Spinach"],
        },
        {
            name: "Salad Ingredients",
            src: "salad_ingredients.jpg",
            ingredients: ["Lettuce", "Cucumber", "Tomato", "Carrot", "Capcicum", "Spices"],
        },
        {
            name: "Smoothie Ingredients",
            src: "Smoothie_Ingredients.jpg",
            ingredients: ["Banana", "Strawberry", "Milk", "Honey", "Lemon", "Yogurt"],
        },
    ];

    // Handle single file selection
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImageSource("upload");
        }
    };

    // Handle sample image selection
    const handleSampleSelect = (sample) => {
        setImage(sample);
        setImageSource("sample");
    };

    // Detect ingredients
    const detectIngredients = async () => {
        if (!image) {
            alert("Please upload or select an image first.");
            return;
        }

        // If user selected sample image → show predefined ingredients
        if (imageSource === "sample") {
            setIngredients(image.ingredients);
            if (onDetect) onDetect(image.ingredients);
            return;
        }

        // Otherwise → use API detection
        setLoading(true);
        const formData = new FormData();
        formData.append("file", image);

        try {
            const res = await fetch("http://10.229.155.141:8000/detect-ingredients", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            setIngredients(data.ingredients || []);
            if (onDetect) onDetect(data.ingredients || []);
        } catch {
            alert("Error detecting ingredients.");
        } finally {
            setLoading(false);
        }
    };

    // Add manual ingredient
    const addManualIngredient = () => {
        const trimmed = manualInput.trim();
        if (trimmed && !ingredients.includes(trimmed)) {
            const updated = [...ingredients, trimmed];
            setIngredients(updated);
            if (onDetect) onDetect(updated); // ✅ update parent
            setManualInput("");
        }
    };

    const removeIngredient = (ingToRemove) => {
        const updated = ingredients.filter((ing) => ing !== ingToRemove);
        setIngredients(updated);
        if (onDetect) onDetect(updated); // ✅ update parent
    };


    const handleKeyPress = (e) => {
        if (e.key === "Enter") addManualIngredient();
    };

    return (
        <div className="flex flex-col items-center gap-4 z-20 relative mt-10">
            {/* Upload Section */}
            <div className="rounded-2xl bg-white/5 p-4 items-center justify-center flex flex-col md:p-8 lg:p-8">
                <div className="rounded-2xl bg-white/9 py-6 px-4 flex flex-col items-center justify-center md:p-8 lg:p-8">
                    <div className="flex flex-col gap-4 items-center px-6 py-10 shadow-2xl/20 backdrop-blur-md rounded-lg mb-6">
                        <div className="flex items-center justify-center gap-3 mb-4 md:w-120 lg:w-130">
                            <h2 className="text-xl font-semibold">Upload Ingredient Image</h2>
                            <img src="ingredients.png" alt="ingredient" className="w-20 h-20 object-contain" />
                        </div>

                        <div className="flex flex-wrap gap-4 justify-center">
                            {/* Upload from Gallery */}
                            <label className="cursor-pointer bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition">
                                {imageSource === "upload" ? "Change Image" : "Upload from Gallery"}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </label>

                            {/* Capture from Camera */}
                            <label className="cursor-pointer bg-green-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-green-500 transition">
                                Take Photo
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={(e) => {
                                        handleImageUpload(e);
                                        setImageSource("camera");
                                    }}
                                    className="hidden"
                                />
                            </label>

                            {/* Choose Sample Dropdown */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setShowSamples(!showSamples)}
                                    className="bg-purple-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-purple-500 transition"
                                >
                                    Choose Sample
                                </button>

                                {/* Dropdown menu */}
                                {showSamples && (
                                    <div className="absolute top-full mt-2 left-0 bg-white/90 rounded-xl shadow-lg p-3 w-60 z-50">
                                        {sampleImages.map((sample, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => {
                                                    handleSampleSelect(sample);
                                                    setShowSamples(false); // close dropdown on select
                                                }}
                                                className="cursor-pointer hover:bg-purple-100 p-2 rounded-lg flex items-center gap-3 transition"
                                            >
                                                <img
                                                    src={sample.src}
                                                    alt={sample.name}
                                                    className="w-10 h-10 rounded-md object-cover"
                                                />
                                                <span className="text-gray-800 font-medium">{sample.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Image Preview */}
                        {image && (
                            <img
                                src={imageSource === "sample" ? image.src : URL.createObjectURL(image)}
                                alt="Preview"
                                className="w-120 object-cover rounded-xl shadow-lg mt-4"
                            />
                        )}
                    </div>

                    {/* Detect Ingredients Button */}
                    <button
                        onClick={detectIngredients}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-4 rounded-lg font-semibold my-4 flex flex-col items-center justify-center gap-2 text-lg transition-transform active:scale-95"
                        disabled={!image || loading}
                    >
                        <span>{loading ? "Detecting..." : "Detect Ingredients"}</span>
                        <img src="grocery.png" alt="grocery" className="w-15 h-15 object-contain" />
                    </button>
                </div>

                {/* Ingredients Section */}
                <div className="flex flex-col items-center justify-center gap-4 w-full py-4 mt-6 mb-4 md:w-120 md:p-2 lg:w-130">
                    {ingredients.length > 0 && (
                        <>
                            <div className="w-full max-w-3xl mx-auto text-center mb-3">
                                <h3 className="text-lg font-semibold text-white underline underline-offset-4 decoration-white/40">
                                    Detected Ingredients
                                </h3>
                            </div>

                            <div className="w-full max-w-3xl mx-auto flex flex-wrap justify-center gap-3 rounded-2xl bg-white/10 p-5 shadow-md backdrop-blur-sm">
                                {ingredients.map((ing, idx) => (
                                    <span
                                        key={idx}
                                        className="relative bg-white/20 px-4 py-2 rounded-full text-base font-medium text-white flex items-center gap-2 hover:bg-white/25 transition-all"
                                    >
                                        {ing}
                                        <button
                                            onClick={() => removeIngredient(ing)}
                                            className="flex items-center justify-center w-5 h-5 rounded-full bg-white/20 border border-white/40 hover:bg-white/30 transition-all"
                                            title="Remove"
                                        >
                                            <img src="no.png" alt="cancel" className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Manual ingredient input */}
                    <div className="flex justify-center gap-2">
                        <input
                            type="text"
                            placeholder="Add ingredient"
                            value={manualInput}
                            onChange={(e) => setManualInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <button
                            onClick={addManualIngredient}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                        >
                            Add
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
