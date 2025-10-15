from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from PIL import Image
import io
import os

# Load model
MODEL_PATH = os.path.join(os.getcwd(), "rtdetr-x.pt")
model = YOLO(MODEL_PATH)

app = FastAPI(title="Ingredient Detection API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all origins for testing, can restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
