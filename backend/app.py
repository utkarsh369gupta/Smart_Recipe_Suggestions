from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from prisma import Prisma
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from ultralytics import YOLO
from PIL import Image
import io
import os
from dotenv import load_dotenv

# ---------------------------
# Load environment variables
# ---------------------------
load_dotenv()

# ---------------------------
# Prisma client
# ---------------------------
prisma = Prisma()

# ---------------------------
# Load YOLO model
# ---------------------------
MODEL_PATH = os.path.join(os.getcwd(), "rtdetr-x.pt")
model = YOLO(MODEL_PATH)

# ---------------------------
# Initialize FastAPI app
# ---------------------------
app = FastAPI(title="Ingredient Detection & Prisma API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------
# Pydantic models for webhook
# ---------------------------
class EmailAddress(BaseModel):
    email_address: EmailStr

class UserPayload(BaseModel):
    id: str
    email_addresses: List[EmailAddress]
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    image_url: Optional[str] = None

class WebhookRequest(BaseModel):
    data: UserPayload

# ---------------------------
# Startup & Shutdown events
# ---------------------------
@app.on_event("startup")
async def startup():
    await prisma.connect()

@app.on_event("shutdown")
async def shutdown():
    await prisma.disconnect()

# ---------------------------
# Health check
# ---------------------------
@app.get("/")
async def health_check():
    return {"message": "Server is up and running!"}

# ---------------------------
# Prisma Webhook: create/update user
# ---------------------------
@app.post("/api/webhooks/user")
async def sync_user(request: WebhookRequest):
    payload = request.data
    if not payload.id or not payload.email_addresses:
        raise HTTPException(status_code=400, detail="Invalid Clerk user payload")

    user = await prisma.user.upsert(
        where={"clerkId": payload.id},
        update={
            "email": payload.email_addresses[0].email_address,
            "name": f"{payload.first_name or ''} {payload.last_name or ''}".strip(),
            "imageUrl": payload.image_url,
        },
        create={
            "clerkId": payload.id,
            "email": payload.email_addresses[0].email_address,
            "name": f"{payload.first_name or ''} {payload.last_name or ''}".strip(),
            "imageUrl": payload.image_url,
        },
    )
    return {"message": f"✅ Synced user: {user.email}"}

# ---------------------------
# Fetch all users
# ---------------------------
@app.get("/api/users")
async def get_users():
    users = await prisma.user.find_many(
        include={
            "recipes": True,
            "ratings": True
        }
    )
    return users

# ---------------------------
# AI Endpoint: detect ingredients
# ---------------------------
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
