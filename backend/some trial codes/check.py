# import requests

# url = "http://localhost:8000/detect-ingredients"
# files = {"file": open("test.jpg", "rb")}

# response = requests.post(url, files=files)
# print(response.json())



from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from PIL import Image
import io
import torch
import os

# -----------------------------
# Load YOLO model from Hugging Face
# -----------------------------
MODEL_URL = "https://huggingface.co/utk369gupta/yolov8m-nutrition5k/blob/main/yolov8m_nutrition5k.pt"

# Cache model locally after first load
MODEL_CACHE = "cached_model.pt"

if not os.path.exists(MODEL_CACHE):
    torch.hub.download_url_to_file(MODEL_URL, MODEL_CACHE)
    print(f"✅ Downloaded model from Hugging Face to {MODEL_CACHE}")

model = YOLO(MODEL_CACHE)
print("✅ Model loaded successfully!")

# -----------------------------
# FastAPI setup
# -----------------------------
app = FastAPI(title="Ingredient Detection API")

# Enable CORS for frontend calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all origins for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# API endpoint
# -----------------------------
@app.post("/detect-ingredients")
async def detect_ingredients(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")

        results = model.predict(image, imgsz=640, conf=0.25)

        if len(results) == 0 or len(results[0].boxes) == 0:
            return JSONResponse(content={"ingredients": []})

        labels = [model.names[int(b.cls[0])] for b in results[0].boxes]
        unique_ingredients = list(dict.fromkeys(labels))

        return JSONResponse(content={"ingredients": unique_ingredients})

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)


@app.get("/")
def home():
    return {"message": "Ingredient Detection API is running!"}
