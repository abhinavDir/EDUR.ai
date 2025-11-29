import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoadScript } from "@react-google-maps/api";

import Nav from "./components/Navbar/nav.jsx";
import Home from "./components/pages/Home.jsx";
import About from "./components/pages/About.jsx";
import Features from "./components/pages/Features.jsx";
import Login from "./components/pages/Login.jsx";
import Signup from "./components/pages/Signup.jsx";
import Location from "./components/pages/Location.jsx";
import Dashboard from "./components/pages/Dashboard.jsx";
import ForgotPassword from "./components/pages/ForgotPassword.jsx";
import ResetPassword from "./components/pages/Resetpassword.jsx";
import Features2 from "./components/pages/features1.jsx";
import Footer from "./components/pages/Footer.jsx";
import AskAI from "./components/pages/features/AskAi/AskAI.jsx";
import MCQGenerator from "./components/pages/features/MCQ/MCQ.jsx";
import Reader from "./components/pages/features/Reader/Reader.jsx";
import GrammarFix from "./components/pages/features/Personalized/Personalized.jsx";
import Dashboard1 from "./components/pages/features/Notes/Notes.jsx";

const libraries = ["places"];

export default function App() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API;

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login on page load OR refresh
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  // Listen for login/logout events
  useEffect(() => {
    const checkLogin = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
    };

    window.addEventListener("storage", checkLogin);
    return () => window.removeEventListener("storage", checkLogin);
  }, []);

  // Protected Routes
  const ProtectedRoute = ({ children }) => {
    return localStorage.getItem("token") ? children : <Navigate to="/login" />;
  };

  return (
    <LoadScript googleMapsApiKey={apiKey} libraries={libraries}>
      <BrowserRouter>
        <Nav isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      
        <div style={{ paddingTop: "70px", paddingBottom: "60px" }}>
          <Routes>
            {/* Public */}
           <Route
  path="/"
  element={
    <>
      <Home />
      <Features2 />
      <About />
      <Footer/>
    </>
  }
/>             
             {/* fetures module routes */}
              <Route path="/ask-ai" element={<AskAI />} />
               <Route path="/mcq" element={<MCQGenerator />} />
                 <Route path="/reader" element={<Reader />} />
                   <Route path="/personalized" element={<GrammarFix />} />
                   <Route path="/notes" element={<Dashboard1 />} />


            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
                 
            {/* Private */}
            <Route path="/features" element={<ProtectedRoute><Features isLoggedIn={isLoggedIn} /></ProtectedRoute>} />
            <Route path="/location" element={<ProtectedRoute><Location /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          </Routes>
        </div>
      </BrowserRouter>
    </LoadScript>
  );
}
