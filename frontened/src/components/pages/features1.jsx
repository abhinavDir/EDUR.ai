import "./Features1.css";
import bg3 from "../../assets/bg2.png";  // ⭐ correct path

export default function Features2() {
  const items = [
    { emoji: "🧠", title: "AI Memory", desc: "Smart learning memory saves your progress." },
    { emoji: "📊", title: "Progress Tracker", desc: "Track your study growth in real-time." },
    { emoji: "📅", title: "Smart Planner", desc: "Let AI plan your daily study schedule." },
    { emoji: "🎧", title: "Audio Notes", desc: "Convert text into audio lessons instantly." },
    { emoji: "💡", title: "Study Tips", desc: "AI-powered curated study suggestions." },
    { emoji: "🔖", title: "Bookmarks", desc: "Save important topics instantly." },
    { emoji: "🗂️", title: "Organized Library", desc: "Auto-manages your notes and files." },
    { emoji: "🔥", title: "Streak Counter", desc: "Stay motivated with streak badges." }
  ];

  return (
    <div
      className="f2-bg"
      style={{
        backgroundImage: `url(${bg3})`,
      }}
    >
      <div className="f2-container">
        <h2 className="f2-title">Extra Smart Features ✨</h2>
        <p className="f2-sub">Explore more advanced tools designed for smarter learning.</p>

        <div className="f2-grid">
          {items.map((item, index) => (
            <div key={index} className="f2-card">
              <div className="f2-emoji">{item.emoji}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
