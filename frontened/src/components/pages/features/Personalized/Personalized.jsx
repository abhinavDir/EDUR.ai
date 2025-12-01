// frontend/src/components/Personalized/GrammarFix.jsx
import React, { useEffect, useState, useRef } from "react";
import "./Personalized.css";
import {
  FaRobot,
  FaMicrophone,
  FaMicrophoneSlash,
  FaVolumeMute,
  FaPlay
} from "react-icons/fa";

import socket from "../../../../socket";   // ⭐ REAL-TIME XP
import voice from "../../../../assets/voice.png";

export default function GrammarFix() {
  const [sentence, setSentence] = useState("");
  const [aiReply, setAiReply] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const recognitionRef = useRef(null);
  const API_KEY = import.meta.env.VITE_GEMINI;

  // Logged-in user
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?._id;

  // XP + streak (REAL-TIME FIX)
  function giveRealTimeXP() {
    if (!userId) return;

    socket.emit("featureUsed", {
      userId,
      feature: "grammar"      // ⭐ Backend uses this
    });
  }

  useEffect(() => {
    window.speechSynthesis.getVoices();
  }, []);

  function getGirlVoice() {
    const voices = window.speechSynthesis.getVoices();
    return (
      voices.find(v => v.name.includes("Female")) ||
      voices.find(v => v.name.includes("Samantha")) ||
      voices.find(v => v.name.includes("Google US English")) ||
      voices.find(v => v.lang === "en-US") ||
      voices[0]
    );
  }

  const speakAI = (text) => {
    window.speechSynthesis.cancel();
    const run = () => {
      const msg = new SpeechSynthesisUtterance(text);
      msg.lang = "en-US";
      msg.pitch = 1.23;
      msg.rate = 0.93;
      msg.voice = getGirlVoice();
      window.speechSynthesis.speak(msg);
    };

    if (speechSynthesis.getVoices().length > 0) run();
    else window.speechSynthesis.onvoiceschanged = run;
  };

  const startMic = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Browser does not support speech recognition.");
      return;
    }

    const rec = new window.webkitSpeechRecognition();
    rec.lang = "en-US";
    rec.interimResults = false;

    recognitionRef.current = rec;
    setIsRecording(true);
    rec.start();

    rec.onresult = async (e) => {
      const spokenText = e.results[0][0].transcript;
      setSentence(spokenText);

      // ⭐ XP + STREAK INCREASE ON EACH USER VOICE INPUT
      giveRealTimeXP();

      await askAI(spokenText);
    };

    rec.onend = () => setIsRecording(false);
  };

  const stopMic = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  // ---------------------------
  //     AI PROCESSING
  // ---------------------------
  const askAI = async (text) => {
    try {
      const prompt = `
User said:
"${text}"

Reply EXACTLY like this:

Status: <Correct or Incorrect sentence>
Corrected: <correct English version>
Answer: <reply to the meaning>
`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
          }),
        }
      );

      const data = await res.json();
      const output = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      setAiReply(output);

      const status = (output.match(/Status:\s*(.*)/i) || [])[1]?.trim();
      const corrected = (output.match(/Corrected:\s*(.*)/i) || [])[1]?.trim();
      const answer = (output.match(/Answer:\s*(.*)/i) || [])[1]?.trim();

      if (status) speakAI(status);
      setTimeout(() => corrected && speakAI("Corrected sentence: " + corrected), 2000);
      setTimeout(() => answer && speakAI("Answer: " + answer), 4500);

    } catch (err) {
      console.error(err);
      setAiReply("AI error.");
    }
  };

  const stopAI = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
  };

  const resumeAI = () => {
    window.speechSynthesis.resume();
    setIsPaused(false);
  };

  return (
    <div 
      className="gf-bg"
      style={{
        backgroundImage: `url(${voice})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        width: "100%",
        minHeight: "100vh",
      }}
    >
      <div className="gf-container">
        <h1 className="gf-title">🎤 AI Grammar Voice Assistant</h1>

        <textarea className="gf-input" value={sentence} readOnly />

        <button
          className={`mic-btn ${isRecording ? "recording" : ""}`}
          onClick={isRecording ? stopMic : startMic}
        >
          {isRecording ? <FaMicrophoneSlash /> : <FaMicrophone />}
          {isRecording ? " Stop Speaking" : " Start Speaking"}
        </button>

        <div className="ai-control">
          <button className="stop-ai-btn" onClick={stopAI}>
            <FaVolumeMute /> Stop
          </button>

          <button className="resume-ai-btn" onClick={resumeAI} disabled={!isPaused}>
            <FaPlay /> Resume
          </button>
        </div>

        {aiReply && (
          <div className="gf-output">
            <h3><FaRobot /> AI Response</h3>
            <p>{aiReply}</p>
          </div>
        )}
      </div>
    </div>
  );
}
