// backend/routes/placesRoutes.js
import express from "express";
import fetch from "node-fetch";

const router = express.Router();

// FREE NOMINATIM SEARCH (NO CORS IN FRONTEND)
router.get("/search", async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) return res.json([]);

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=15`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "AI-Education-App", // REQUIRED BY OSM
      },
    });

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.log("Place API error:", error);
    res.status(500).json({ error: "Search failed" });
  }
});

export default router;
