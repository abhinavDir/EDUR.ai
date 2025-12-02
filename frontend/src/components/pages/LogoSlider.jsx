import React, { useEffect } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import useMeasure from "react-use-measure";
import "./logoslider.css";

// ------------ Infinite Slider ------------
function InfiniteSlider({ children, gap = 40, duration = 100 }) {
  const [ref, { width }] = useMeasure();
  const x = useMotionValue(0);

  useEffect(() => {
    const totalWidth = width + gap;

    const controls = animate(x, [0, -totalWidth / 2], {
      ease: "linear",
      duration,
      repeat: Infinity,
      repeatType: "loop",
      onRepeat: () => x.set(0),
    });

    return () => controls.stop();
  }, [width, gap, duration]);

  return (
    <div className="slider-container-clean">
      <motion.div className="slider-motion-clean" style={{ x }} ref={ref}>
        {children}
        {children}
      </motion.div>
    </div>
  );
}

// ------------ Feature Icons Slider ------------
export default function LogosSliderPage() {
  const features = [
    // Core Features
    { id: "mcq", image: "https://cdn-icons-png.flaticon.com/512/2991/2991148.png" },
    { id: "askai", image: "https://cdn-icons-png.flaticon.com/512/4712/4712100.png" },
    { id: "image", image: "https://cdn-icons-png.flaticon.com/512/545/545682.png" },
    { id: "pdf", image: "https://cdn-icons-png.flaticon.com/512/337/337946.png" },
    { id: "voice", image: "https://cdn-icons-png.flaticon.com/512/724/724715.png" },
    { id: "location", image: "https://cdn-icons-png.flaticon.com/512/684/684908.png" },

    // Extra Features Added Now
    // { id: "video", image: "https://cdn-icons-png.flaticon.com/512/727/727245.png" },
    { id: "notes", image: "https://cdn-icons-png.flaticon.com/512/2921/2921222.png" },
    { id: "chatbot", image: "https://cdn-icons-png.flaticon.com/512/4712/4712101.png" },
    { id: "results", image: "https://cdn-icons-png.flaticon.com/512/992/992700.png" },
    { id: "profile", image: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" },
    // { id: "settings", image: "https://cdn-icons-png.flaticon.com/512/2099/2099058.png" },
    { id: "certificate", image: "https://cdn-icons-png.flaticon.com/512/992/992616.png" },
    { id: "assignment", image: "https://cdn-icons-png.flaticon.com/512/3061/3061341.png" },
    { id: "attendance", image: "https://cdn-icons-png.flaticon.com/512/3135/3135711.png" },
    { id: "coding", image: "https://cdn-icons-png.flaticon.com/512/906/906324.png" },
    { id: "doubt", image: "https://cdn-icons-png.flaticon.com/512/1828/1828970.png" },
    { id: "quiz", image: "https://cdn-icons-png.flaticon.com/512/3135/3135688.png" },
    { id: "leaderboard", image: "https://cdn-icons-png.flaticon.com/512/1828/1828884.png" },
    { id: "aisummary", image: "https://cdn-icons-png.flaticon.com/512/4712/4712103.png" },
    { id: "upload", image: "https://cdn-icons-png.flaticon.com/512/1828/1828911.png" },
  ];

  return (
    <div className="clean-wrapper">
      <InfiniteSlider>
        {features.map((f) => (
          <div key={f.id} className="clean-logo-box">
            <img src={f.image} alt={f.id} className="clean-logo-img" />
          </div>
        ))}
      </InfiniteSlider>
    </div>
  );
}
