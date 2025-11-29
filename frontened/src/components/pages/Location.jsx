import { useState } from "react";
import "./Location.css";
import map from "../../assets/map.png"
export default function Location() {
  const [coords, setCoords] = useState(null);
  const [mapUrl, setMapUrl] = useState("");

  // 1️⃣ Get user location
  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        setCoords({ lat, lon });

        // Default map
        setMapUrl(
          `https://www.google.com/maps?q=${lat},${lon}&hl=es;z=14&output=embed`
        );
      },
      () => alert("Please allow location access!")
    );
  };

  // 2️⃣ Search on Google Maps
  const searchPlaces = (query) => {
    if (!coords) return alert("First enable your location!");

    const url = `https://www.google.com/maps?q=${query} near ${coords.lat},${coords.lon}
      &output=embed`;

    setMapUrl(url);
  };

  return (
    <div className="map-img"
     style={{
      backgroundImage:`url(${map})`,
      
     }}>
    <div className="loc-wrapper">
      <h1 className="loc-title">📍 Smart Location Finder</h1>

      {!coords && (
        <button className="loc-main-btn" onClick={getLocation}>
          Enable My Location
        </button>
      )}

      {/* SEARCH BOX */}
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
        <button className="quick-btn" onClick={() => searchPlaces("bookstore")}>
          📚 Bookstores
        </button>
        <button className="quick-btn" onClick={() => searchPlaces("library")}>
          📖 Libraries
        </button>
        <button className="quick-btn" onClick={() => searchPlaces("stationery shop")}>
          ✏️ Stationary
        </button>
        <button className="quick-btn" onClick={() => searchPlaces("coaching center")}>
          🏫 Coaching
        </button>
        <button className="quick-btn" onClick={() => searchPlaces("college/institute center")}>
          🏫 college
        </button>
      </div>

      {/* GOOGLE MAP */}
      {mapUrl ? (
        <iframe
          src={mapUrl}
          className="map-frame"
          loading="lazy"
          allowFullScreen
        ></iframe>
      ) : (
        <p className="waiting">Click “Enable My Location”</p>
      )}
    </div>
    </div>
  );
}
