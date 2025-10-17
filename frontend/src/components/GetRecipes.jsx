import React, { useState } from "react";
import { GoogleGenAI } from "@google/genai";

// Initialize Google GenAI

const ai = new GoogleGenAI({
    apiKey: "AIzaSyC2ImOE00xgHSNCdNkGygTAgPzfPqY1Slg", // ideally use env variable
});

const GetRecipes = ({ ingredients, onDetect }) => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [steps, setSteps] = useState("");
    const [stepsLoading, setStepsLoading] = useState(false);
    const [stepsModalOpen, setStepsModalOpen] = useState(false);
    const [userRating, setUserRating] = useState(0); // store selected rating


    // Fetch recipes from Spoonacular
    const getRecipes = async () => {
        if (!ingredients || ingredients.length === 0) {
            alert("No ingredients detected yet!");
            return;
        }

        setLoading(true);

        try {
            const apiKey = "2dc9379cbc55424495f006e1500d3e91"; // replace with env variable ideally
            const query = ingredients.join(",");
            const url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(
                query
            )}&number=9&ranking=1&ignorePantry=true&apiKey=${apiKey}`;

            const res = await fetch(url);
            const data = await res.json();

            const formattedRecipes = data.map((r) => ({
                id: r.id,
                title: r.title,
                image: r.image,
                usedCount: r.usedIngredientCount,
                missedCount: r.missedIngredientCount,
                usedIngredients: r.usedIngredients?.map((i) => i.name) || [],
                missedIngredients: r.missedIngredients?.map((i) => i.name) || [],
            }));

            setRecipes(formattedRecipes);
            if (onDetect) onDetect(formattedRecipes);
        } catch (err) {
            console.error(err);
            alert("Error fetching recipes from Spoonacular.");
        } finally {
            setLoading(false);
        }
    };

    // Open and close recipe modal
    const openPopup = (recipe) => {
        setSelectedRecipe(recipe);
        setSteps(""); // clear previous
    };
    const closePopup = () => {
        setSelectedRecipe(null);
        setSteps("");
    };

    // Generate recipe steps using Google GenAI and open steps modal
    const generateRecipeSteps = async (recipe) => {

        setStepsLoading(true);
        setSteps("Generating cooking steps...");

        try {
            const prompt = `
                You are a professional chef AI.

                Return the recipe *strictly in JSON format only*, with no extra text before or after.
                Structure:
                {
                "name": "<dish name>",
                "prep_time": <number in minutes>,
                "nutrition": {
                    "calories": "<value>",
                    "protein": "<value>",
                    "carbs": "<value>",
                    "fat": "<value>"
                },
                "steps": [
                    {"step_number": 1, "description": "<step>"},
                    {"step_number": 2, "description": "<step>"}
                ]
                }

                Now create a recipe for "${recipe.title}" 
                using these ingredients: ${[...recipe.usedIngredients, ...recipe.missedIngredients].join(", ")}.
                `;


            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
            });

            console.log("Google GenAI Response:", response);

            if (response?.text) {
                let parsedData;
                try {
                    // Try to extract valid JSON even if there’s stray text
                    const cleaned = response.text.replace(/```json|```/g, "").trim();
                    parsedData = JSON.parse(cleaned);
                } catch (e) {
                    console.warn("Failed to parse JSON, showing raw text:", e);
                    parsedData = response.text;
                }

                setSteps(parsedData);
                setSelectedRecipe(null);
                setStepsModalOpen(true);
            }
            else {
                setSteps("No instructions found. Try again.");
            }
        } catch (err) {
            console.error(err);
            setSteps("Error fetching steps from Google GenAI.");
        } finally {
            setStepsLoading(false);
        }
    };

    const submitRating = async (recipeId, rating) => {
        try {
            // Example: send rating to your backend API
            const res = await fetch("/api/ratings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ recipeId, rating }),
            });

            if (!res.ok) throw new Error("Failed to submit rating");

            alert(`Thanks! You rated this recipe ${rating} ⭐`);
            setUserRating(0); // reset after submission
        } catch (err) {
            console.error(err);
            // alert("Error submitting rating. Try again.");
        }
    };


    return (
        <div className="flex flex-col items-center mt-6">
            {/* Fetch Recipes Button */}
            <button
                onClick={getRecipes}
                disabled={loading}
                className="mt-4 bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-3 rounded-xl shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-xl animate-bounce-slight"
            >
                {loading ? "Loading..." : "Get Your Recipe 🍽️"}
            </button>

            {/* Recipe Cards */}
            {recipes.length > 0 && (
                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-[90%] max-w-6xl">
                    {recipes.map((recipe) => (
                        <div
                            key={recipe.id}
                            onClick={() => openPopup(recipe)}
                            className="bg-white/10 rounded-2xl p-4 flex flex-col items-center shadow-lg hover:scale-105 transition-transform backdrop-blur-md cursor-pointer"
                        >
                            <img
                                src={recipe.image}
                                alt={recipe.title}
                                className="w-48 h-48 object-cover rounded-xl mb-3"
                            />
                            <h3 className="text-lg font-semibold text-white mb-2 text-center">
                                {recipe.title}
                            </h3>
                        </div>
                    ))}
                </div>
            )}

            {/* Recipe Modal */}
            {selectedRecipe && (
                <div
                    className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 transition-opacity duration-300"
                    onClick={closePopup}
                >
                    <div
                        className="bg-white/10 p-6 rounded-2xl shadow-2xl w-[90%] max-w-lg text-white relative border border-white/20 overflow-y-auto max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={closePopup}
                            className="absolute top-3 right-3 text-white bg-red-500 hover:bg-red-600 rounded-full w-8 h-8 flex items-center justify-center font-bold"
                        >
                            ✕
                        </button>

                        <img
                            src={selectedRecipe.image}
                            alt={selectedRecipe.title}
                            className="w-full h-56 object-cover rounded-xl mb-4"
                        />
                        <h2 className="text-2xl font-bold mb-4 text-center">
                            {selectedRecipe.title}
                        </h2>

                        <div className="max-h-64 overflow-y-auto space-y-4">
                            <div>
                                <h3 className="font-semibold text-yellow-300 flex items-center justify-center gap-2">
                                    <img src="search.png" alt="Used" className="w-9 h-9 object-contain" />
                                    Used Ingredients
                                </h3>
                                <ul className="list-disc list-inside">
                                    {selectedRecipe.usedIngredients.map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-red-400 flex items-center justify-center gap-2">
                                    <img src="complaint.png" alt="Missing" className="w-9 h-9 object-contain" />
                                    Missing Ingredients
                                </h3>
                                <ul className="list-disc list-inside">
                                    {selectedRecipe.missedIngredients.map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Rating Section */}
                        <div className="mt-4 flex flex-col items-center">
                            <h3 className="text-white font-semibold mb-2">Rate this Recipe ⭐</h3>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setUserRating(star)}
                                        className={`text-2xl transition-colors ${userRating >= star ? "text-yellow-400" : "text-white/50"
                                            }`}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => submitRating(selectedRecipe.id, userRating)}
                                disabled={userRating === 0}
                                className="mt-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50"
                            >
                                Submit Rating
                            </button>
                        </div>


                        <button
                            onClick={() => generateRecipeSteps(selectedRecipe)}
                            disabled={stepsLoading}
                            className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 disabled:opacity-50"
                        >
                            {stepsLoading ? "Generating..." : "Get Step-by-Step Guide 👨‍🍳"}
                        </button>
                    </div>
                </div>
            )}


            {/* Steps Modal */}
            {stepsModalOpen && steps && (
                <div
                    className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50"
                    onClick={() => setStepsModalOpen(false)}
                >
                    <div
                        className="bg-white/10 p-6 rounded-2xl shadow-2xl w-[90%] max-w-lg text-white relative border border-white/20 overflow-y-auto max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setStepsModalOpen(false)}
                            className="absolute top-3 right-3 text-white bg-red-500 hover:bg-red-600 rounded-full w-8 h-8 flex items-center justify-center font-bold"
                        >
                            ✕
                        </button>

                        {/* If steps is a string (fallback case) */}
                        {typeof steps === "string" ? (
                            <div className="text-sm whitespace-pre-wrap">
                                <h2 className="text-2xl font-bold mb-4 text-center text-yellow-300">Recipe Instructions</h2>
                                <p className="bg-black/40 p-4 rounded-lg">{steps.replace(/^["']|["']$/g, "")}</p>
                            </div>
                        ) : (
                            <>
                                {/* Dish Name */}
                                <h2 className="text-2xl font-bold mb-2 text-center">{steps.name}</h2>

                                {/* Prep Time */}
                                {steps.prep_time && (
                                    <p className="text-center text-sm text-yellow-300 mb-4">
                                        ⏱️ Approx. {steps.prep_time} minutes
                                    </p>
                                )}

                                {/* Nutrition Info */}
                                {steps.nutrition && (
                                    <div className="flex justify-around text-sm mb-4 bg-black/40 p-3 rounded-lg">
                                        {steps.nutrition.calories && <div>🔥 {steps.nutrition.calories}</div>}
                                        {steps.nutrition.protein && <div>💪 {steps.nutrition.protein}</div>}
                                        {steps.nutrition.carbs && <div>🍞 {steps.nutrition.carbs}</div>}
                                        {steps.nutrition.fat && <div>🥑 {steps.nutrition.fat}</div>}
                                    </div>
                                )}

                                {/* Step-by-step Instructions */}
                                {steps.steps && (
                                    <div className="bg-black/40 p-4 rounded-lg max-h-[60vh] overflow-y-auto text-sm">
                                        <h3 className="text-yellow-300 font-bold mb-2 text-center">Steps</h3>
                                        <ol className="list-decimal list-inside space-y-2">
                                            {steps.steps.map((step) => (
                                                <li key={step.step_number}>{step.description}</li>
                                            ))}
                                        </ol>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}


        </div>
    );
};

export default GetRecipes;
