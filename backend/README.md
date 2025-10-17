# 🍳 Smart Recipe Generator — Backend

The **Smart Recipe Generator (Backend)** powers AI-driven recipe creation by combining **computer vision** and **generative AI**.  
It detects ingredients from food images, retrieves relevant recipes, and can optionally generate detailed cooking instructions.

---

## 🚀 Overview

The backend is developed using **FastAPI** and integrates an **RT-DETR-X (Real-Time DEtection TRansformer)** model for ingredient detection.  
After identifying ingredients, it fetches corresponding recipes from external APIs (like **Spoonacular**) and can enhance them using **Google GenAI (Gemini API)** to produce step-by-step recipe guides.

---

## 🧠 Core Features

- 🥕 **Ingredient Detection**  
  Utilizes the *RT-DETR-X* object detection model to identify food ingredients from uploaded images (PyTorch-based model).

- 🍲 **Recipe Retrieval**  
  Connects to external recipe APIs to fetch suitable recipes based on the detected ingredients.

- 🤖 **AI-Enhanced Instructions**  
  Uses the **Google Gemini API** for generating structured, conversational recipe steps and detailed methods.

- ⚡ **Fast and Lightweight**  
  Built using **FastAPI**, ensuring high performance and easy scalability.

- 🧩 **Seamless Integration**  
  Provides **JSON-formatted responses** designed to integrate smoothly with frontend clients such as Streamlit or React.

---

## 📁 Project Structure



backend/

  ├── .gitattributes      # Git configuration file
  
  ├── app.py              # Main FastAPI application
  
  ├── requirements.txt    # Python dependency list
  
  └── rtdetr-x.pt         # Trained RT-DETR-X model weights



---

## 🧰 Installation

### 1 Clone the repository
```bash
git clone https://github.com/utkarsh369gupta/Smart_Recipe_Suggestions.git
```

### 2 Go to the repository
```bash
cd Smart_Recipe_Suggestions/backend
```

### 3 Create and activate a virtual environment
```
python -m venv venv
source venv/bin/activate        # (Linux/Mac)
venv\Scripts\activate           # (Windows)
```

### 4 Install dependencies
```
pip install -r requirements.txt
```

#### Note: Ensure the model file is present. If not, place rtdetr-x.pt in the backend/ directory


### 6 Run the Server
```
uvicorn app:app --host 0.0.0.0 --port 8000
```


### 7 Your Backend model is running fine. Now Run the frontend locally:

---

## 🧠 Model: RT-DETR-X (Real-Time DEtection TRansformer)

- **Framework:** PyTorch / Ultralytics  
- **Task:** Object Detection (Ingredient recognition)  
- **Input:** Food image  
- **Output:** Detected ingredients with confidence scores


