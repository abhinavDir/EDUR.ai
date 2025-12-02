import { useState, useEffect } from "react";
import img1 from "../../assets/home.png";
import img2 from "../../assets/home2.png";
import img3 from "../../assets/home3.png";
import "./Home.css";
import Features from "./Features";

export default function Home() {
  const images = [img1,img2,img3];
  const [index, setIndex] = useState(0);

  // Auto image change every 3 sec
  useEffect(() => {
    const change = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(change);
  }, []);

  return (
    <div className="home-container">
        <div className="slider-box">
        <img src={images[index]} alt="slider" className="slider-img" />
      </div>

     
    </div>
  );
}

