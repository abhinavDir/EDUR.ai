import "./Footer.css";
import { FaInstagram, FaLinkedin, FaGithub, FaEnvelope } from "react-icons/fa";

export default function Footer() {
  const year = new Date().getFullYear(); // ⭐ real year

  return (
    <footer className="footer">

      <div className="footer-left">
        <h2 className="footer-logo">AI Education 🚀</h2>
        <p className="footer-desc">
          Smarter learning powered by AI.  
          Notes, MCQs, summaries & more — all in one place.
        </p>

        <div className="footer-social">
          <a href="#"><FaInstagram /></a>
          <a href="https://www.linkedin.com/in/abhinav-pandey-830128334/"><FaLinkedin /></a>
          <a href="#"><FaGithub /></a>
          <a href="#"><FaEnvelope /></a>
        </div>
      </div>

      <div className="footer-links">
        <p><a href="#" className="footer-link">Privacy Policy</a></p>
        <p><a href="#" className="footer-link">Terms & Conditions</a></p>
        <p><a href="#" className="footer-link">Contact Us</a></p>
      </div>

      {/* ⭐ COPYRIGHT LINE */}
      <div className="footer-copy">
        <p>© {year} All Rights Reserved • Designed by <span>Abhinav Pandey</span></p>
      </div>

    </footer>
  );
}
