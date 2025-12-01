import "./features.css";
import { Link } from "react-router-dom";
import {
  FaRobot,
  FaFilePdf,
  FaQuestion,
  FaMapMarkedAlt,
  FaUserGraduate,
  FaBook
} from "react-icons/fa";

import bg2 from "../../assets/bg3.png";  // ✅ Correct path




export default function Features({ isLoggedIn }) {

  const block = (e) => {
    if (!isLoggedIn) {
      e.preventDefault();
      alert("Please login to use this feature.");
    }
  };

  return (
    <div
      className="features-page"
      style={{
        backgroundImage: `url(${bg2})`,
        
      }}
    >
    

      <div className="features-container">
         <div className="floating-logos">
  <img src="https://cdn-icons-png.flaticon.com/512/4712/4712100.png" className="float-logo l1" />
  {/* <img src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png" className="float-logo l2" /> */}
  <img src="https://cdn-icons-png.flaticon.com/512/337/337946.png" className="float-logo l3" />
  <img src="https://cdn-icons-png.flaticon.com/512/545/545682.png" className="float-logo l4" />
  <img src="https://cdn-icons-png.flaticon.com/512/684/684908.png" className="float-logo l5" />
  <img src="https://cdn-icons-png.flaticon.com/512/2921/2921222.png" className="float-logo l6" />
</div>


        <h2 className="features-title">🚀 Ultra Smart Features</h2>
        <p className="features-subtitle">Next-gen AI tools designed for modern learners</p>

        <div className="features-grid">

          <Link to="/ask-ai" className="feature-card" onClick={block}>
            <FaRobot className="feature-icon" />
            <h3>🧠 Ask AI</h3>
            <p>Your personal AI assistant.</p>
          </Link>

          <Link to="/reader" className="feature-card" onClick={block}>
            <FaFilePdf className="feature-icon" />
            <h3>📄 PDF / Image Reader</h3>
            <p>Auto extract what's inside.</p>
          </Link>

          <Link to="/mcq" className="feature-card" onClick={block}>
            <FaQuestion className="feature-icon" />
            <h3>📚 MCQ Generator</h3>
            <p>Instant questions, instantly better.</p>
          </Link>

          <Link to="/location" className="feature-card" onClick={block}>
            <FaMapMarkedAlt className="feature-icon" />
            <h3>📍 Location Finder</h3>
            <p>Discover learning places near you.</p>
          </Link>

          <Link to="/personalized" className="feature-card" onClick={block}>
            <FaUserGraduate className="feature-icon" />
            <h3>🎙️ TrueGrammar AI</h3>
            <p>AI crafted just for you.</p>
          </Link>

          <Link to="/notes" className="feature-card" onClick={block}>
            <FaBook className="feature-icon" />
            <h3>🧩SmartAnalytics</h3>
            <p>Perfect notes in one click.</p>
          </Link>

        </div>
      </div>
    </div>
  );
}
