// frontened/src/components/pages/Location.jsx
import { useState } from "react";
import "./Location.css";
import map from "../../assets/map.png";

// ⭐ Auto XP — identical to Ask AI
async function giveXP(type) {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?._id) return;

    await fetch("http://localhost:5000/api/study/feature-used", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user._id, type }),
    });
  } catch (err) {
    console.log("XP Error:", err);
  }
}

export default function Location() {
  const [coords, setCoords] = useState(null);
  const [mapUrl, setMapUrl] = useState("");

  // 1️⃣ Enable My Location
  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        setCoords({ lat, lon });

        setMapUrl(
          `https://www.google.com/maps?q=${lat},${lon}&hl=es;z=14&output=embed`
        );

        // 🎉 XP Award (same style as Ask AI)
        await giveXP("location");
      },
      () => alert("Please allow location access!")
    );
  };

  // 2️⃣ Search any location
  const searchPlaces = async (query) => {
    if (!coords) return alert("First enable your location!");

    const url = `https://www.google.com/maps?q=${query} near ${coords.lat},${coords.lon}&output=embed`;

    setMapUrl(url);

    // ⭐ XP on each search
    await giveXP("map-search");
  };

  // 3️⃣ Quick buttons (automatic XP)
  const quickSearch = async (query) => {
    if (!coords) return alert("Enable location first!");

    const url = `https://www.google.com/maps?q=${query} near ${coords.lat},${coords.lon}&output=embed`;
    setMapUrl(url);

    // ⭐ XP on quick button usage
    await giveXP("quick-search");
  };

  return (
    <div
      className="map-img"
      style={{
        backgroundImage: `url(${map})`,
      }}
    >
      <div className="loc-wrapper">
        <h1 className="loc-title">📍 Smart Location Finder</h1>

        {!coords && (
          <button className="loc-main-btn" onClick={getLocation}>
            Enable My Location
          </button>
        )}

        {/* SEARCH BAR */}
        <div className="search-section">
          <input
            type="text"
            className="search-box"
            placeholder="Search bookstores, libraries, coaching…"
            onKeyDown={(e) => e.key === "Enter" && searchPlaces(e.target.value)}
          />
        </div>

        {/* QUICK BUTTONS */}
        <div className="quick-row">
          <button className="quick-btn" onClick={() => quickSearch("bookstore")}>
            📚 Bookstores
          </button>
          <button className="quick-btn" onClick={() => quickSearch("library")}>
            📖 Libraries
          </button>
          <button className="quick-btn" onClick={() => quickSearch("stationary shop")}>
            ✏️ Stationary
          </button>
          <button className="quick-btn" onClick={() => quickSearch("coaching center")}>
            🏫 Coaching
          </button>
          <button className="quick-btn" onClick={() => quickSearch("college")}>
            🎓 College
          </button>
        </div>

        {/* MAP RESULT */}
        {mapUrl ? (
          <iframe src={mapUrl} className="map-frame" loading="lazy" allowFullScreen></iframe>
        ) : (
          <p className="waiting">Click “Enable My Location”</p>
        )}
      </div>
    </div>
  );
}
