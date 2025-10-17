// index.js
import express from "express";
import { PrismaClient } from "@prisma/client";
import bodyParser from "body-parser";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(bodyParser.json());

// Health check route
app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is up and running!" });
});

app.post("/api/webhooks/user", async (req, res) => {
  try {
    const { id, email_addresses, first_name, last_name, image_url } = req.body.data;

    if (!id || !email_addresses?.length) {
      return res.status(400).json({ error: "Invalid Clerk user payload" });
    }

    await prisma.user.upsert({
      where: { clerkId: id },
      update: {
        email: email_addresses[0]?.email_address,
        name: `${first_name || ""} ${last_name || ""}`.trim(),
        imageUrl: image_url,
      },
      create: {
        clerkId: id,
        email: email_addresses[0]?.email_address,
        name: `${first_name || ""} ${last_name || ""}`.trim(),
        imageUrl: image_url,
      },
    });

    console.log(`✅ Synced user: ${email_addresses[0]?.email_address}`);
    res.status(200).send("User synced successfully");
  } catch (err) {
    console.error("Error syncing user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

//
// 🔹 (Optional) Example route to fetch all users
//
app.get("/api/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        recipes: true,
        ratings: true,
      },
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching users" });
  }
});

//
// 🔹 Start the server
//
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
