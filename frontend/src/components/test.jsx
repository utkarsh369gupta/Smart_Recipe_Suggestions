import React, { useState } from "react";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: "AIzaSyCeZisuFcbv5dB40FkKIwR2kYL7agVlW2U",
});

const GetRecipes = ({ ingredients, onDetect }) => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState(null); // for popup
    const [steps, setSteps] = useState(""); // generated instructions
    const [stepsLoading, setStepsLoading] = useState(false);

    const getRecipes = async () => {
        if (!ingredients || ingredients.length === 0) {
            alert("No ingredients detected yet!");
            return;
        }

        setLoading(true);

        try {
            const apiKey = "2dc9379cbc55424495f006e1500d3e91";
            const query = ingredients.join(",");

            const url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(
                query
            )}&number=15&ranking=1&ignorePantry=true&apiKey=${apiKey}`;

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
            console.log(JSON.stringify(formattedRecipes, null, 2));

            if (onDetect) onDetect(formattedRecipes);
        } catch (err) {
            console.error(err);
            alert("Error fetching recipes from Spoonacular.");
        } finally {
            setLoading(false);
        }
    };

    const openPopup = (recipe) => {
        setSelectedRecipe(recipe);
        setSteps(""); // clear previous
    };

    const closePopup = () => {
        setSelectedRecipe(null);
        setSteps("");
    };


    const getRecipeSteps = async (recipe) => {
        setStepsLoading(true);
        setSteps("Generating cooking steps...");

        try {
            const prompt = `
      You are a chef. Create a detailed step-by-step recipe for "${recipe.title}" 
      using the following ingredients: ${[...recipe.usedIngredients, ...recipe.missedIngredients].join(", ")}.
      Include preparation and cooking steps.
    `;

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
            });

            console.log("Google GenAI Response:", response);

            // response.text usually contains the generated text
            if (response?.text) {
                setSteps(response.text);
            } else {
                setSteps("No instructions found. Try again.");
            }
        } catch (err) {
            console.error(err);
            setSteps("Error fetching steps from Google GenAI.");
        } finally {
            setStepsLoading(false);
        }
    };


    return (
        <div className="flex flex-col items-center mt-6">
            {/* Fetch Button */}
            <button
                onClick={getRecipes}
                disabled={loading}
                className="mt-4 bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-3 rounded-xl shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative z-20 text-xl animate-bounce-slight"
            >
                {loading ? "Loading..." : "Get Your Recipe 🍽️"}
            </button>

            {/* Recipe Cards */}
            {recipes.length > 0 && (
                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-[90%] max-w-6xl relative z-20">
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

            {/* Popup Modal */}
            {selectedRecipe && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
                    <div className="bg-white/10 p-6 rounded-2xl shadow-2xl w-[90%] max-w-lg text-white relative border border-white/20">
                        {/* Close Button */}
                        <button
                            onClick={closePopup}
                            className="absolute top-3 right-3 text-white bg-red-500 hover:bg-red-600 rounded-full w-8 h-8 flex items-center justify-center font-bold"
                        >
                            ✕
                        </button>

                        {/* Image & Title */}
                        <img
                            src={selectedRecipe.image}
                            alt={selectedRecipe.title}
                            className="w-full h-56 object-cover rounded-xl mb-4"
                        />
                        <h2 className="text-2xl font-bold mb-4 text-center">
                            {selectedRecipe.title}
                        </h2>

                        {/* Ingredients */}
                        <div className="max-h-64 overflow-y-auto space-y-4">
                            <div>
                                <h3 className="font-semibold text-yellow-300 flex items-center justify-center gap-2">
                                    <img
                                        src="search.png"
                                        alt="Used"
                                        className="w-9 h-9 object-contain"
                                    />
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
                                    <img
                                        src="complaint.png"
                                        alt="Missing"
                                        className="w-9 h-9 object-contain"
                                    />
                                    Missing Ingredients
                                </h3>
                                <ul className="list-disc list-inside">
                                    {selectedRecipe.missedIngredients.map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* 🧑‍🍳 Generate Steps Button */}
                        <button
                            onClick={() => getRecipeSteps(selectedRecipe)}
                            disabled={stepsLoading}
                            className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 disabled:opacity-50"
                        >
                            {stepsLoading ? "Generating..." : "Get Step-by-Step Guide 👨‍🍳"}
                        </button>

                        {/* Display Steps */}
                        {steps && (
                            <div className="mt-4 bg-black/40 p-4 rounded-lg max-h-64 overflow-y-auto text-sm whitespace-pre-wrap">
                                <h3 className="text-yellow-300 font-bold mb-2 text-center">
                                    Cooking Instructions
                                </h3>
                                <p>{steps}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GetRecipes;
