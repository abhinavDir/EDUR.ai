import "./About.css";
import bg from "../../assets/bg1.png";

export default function About() {
  const features = [
    { emoji: "📝", title: "AI Notes Generator", desc: "Convert long text into clean, structured notes instantly." },
    { emoji: "🎯", title: "MCQ Creator", desc: "Generate exam-level MCQs with one click." },
    { emoji: "🤖", title: "AI Tutor", desc: "Ask doubts and get quick, accurate answers." },
    { emoji: "📸", title: "OCR Extractor", desc: "Extract text from images and handwritten notes." },
  ];

  return (
    <div 
      className="about-page"
      style={{
        backgroundImage: `url(${bg})`,
      
      }}
    >
      <div className="about-container">

        {/* HERO SECTION */}
        <section className="hero">
          <h1>✨ Welcome to AI Education Platform</h1>
          <p className="hero-sub">
            A modern learning assistant designed to help students learn faster,
            smarter, and more efficiently.
          </p>
        </section>

        {/* MISSION CARD */}
        <div className="glass-card mission">
          <h2>🎯 Our Mission</h2>
          <p>
            To reinvent self-study using Artificial Intelligence by giving
            students instant access to notes, MCQs, summaries, explanations, and more.
          </p>
        </div>

        {/* FEATURES */}
        <h2 className="section-title">🚀 Core Features</h2>

        <div className="features-grid">
          {features.map((f, i) => (
            <div className="glass-card feature-card" key={i}>
              <div className="emoji">{f.emoji}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* FOUNDER */}
        {/* <h2 className="section-title">👨‍💻 Founder</h2> */}
{/* 
        <div className="glass-card founder-card">
          <div className="founder-emoji">🙋‍♂️</div>
          <h3>Abhinav Pandey</h3>
          <p>B.Tech CSE (AI) | MERN + AI Developer</p>
          <p>Passionate about building intelligent tools that enhance learning.</p>
        </div> */}

        {/* FUTURE VISION */}
        <div className="glass-card vision-card">
          <h2>🌟 Future Vision</h2>
          <ul>
            <li>AI Timetable Generator</li>
            <li>Voice-Based Doubt Solver</li>
            <li>Exam Strategy AI</li>
            <li>Real-Time Notes Maker</li>
          </ul>
        </div>

      </div>
    </div>
  );
}
