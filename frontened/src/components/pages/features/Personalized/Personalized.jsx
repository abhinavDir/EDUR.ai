import React, { useState, useRef, useEffect } from "react";
import "./Personalized.css";
import {
  FaRobot,
  FaMicrophone,
  FaMicrophoneSlash,
  FaVolumeMute,
  FaPlay
} from "react-icons/fa";
import voice from "../../../../assets/voice.png";
export default function GrammarFix() {
  const [sentence, setSentence] = useState("");
  const [aiReply, setAiReply] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const recognitionRef = useRef(null);
  const API_KEY = import.meta.env.VITE_GEMINI;

  // Ensure voices load
  useEffect(() => {
    window.speechSynthesis.getVoices();
  }, []);

  // -------------------------------------------
  // 1️⃣ HELPER → ALWAYS return a GIRL VOICE
  // -------------------------------------------
  function getGirlVoice() {
    const voices = window.speechSynthesis.getVoices();

    let female =
      voices.find(v => v.name.includes("Female")) ||
      voices.find(v => v.name.includes("Samantha")) ||
      voices.find(v => v.name.includes("Google US English")) ||
      voices.find(v => v.name.includes("Google UK English Female")) ||
      voices.find(v => v.lang === "en-US" && v.name.toLowerCase().includes("female")) ||
      voices.find(v => v.lang === "en-US");

    return female || voices[0];
  }

  // -------------------------------------------
  // 2️⃣ GIRL VOICE SPEAK FUNCTION
  // -------------------------------------------
  const speakAI = (text) => {
    window.speechSynthesis.cancel();

    const speakAfterVoiceLoad = () => {
      const msg = new SpeechSynthesisUtterance(text);
      msg.lang = "en-US";
      msg.pitch = 1.23;
      msg.rate = 0.93;
      msg.voice = getGirlVoice(); // ALWAYS female voice
      window.speechSynthesis.speak(msg);
    };

    if (speechSynthesis.getVoices().length > 0) {
      speakAfterVoiceLoad();
    } else {
      window.speechSynthesis.onvoiceschanged = speakAfterVoiceLoad;
    }
  };

  // -------------------------------------------
  // 3️⃣ MIC START
  // -------------------------------------------
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
      await askAI(spokenText);
    };

    rec.onend = () => setIsRecording(false);
  };

  // MIC STOP
  const stopMic = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  // -------------------------------------------
  // 4️⃣ AI RESPONSE (3 step format)
  // -------------------------------------------
  const askAI = async (text) => {
    const prompt = `
User said:
"${text}"

Reply EXACTLY like this:

Status: <Correct or Incorrect sentence>
Corrected: <correct English version>
Answer: <reply to the meaning>

Example:
Status:  Incorrect sentence
Corrected: What time is it now?
Answer: The time is 5:30 PM.
`;

    try {
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

      // Extract responses
      const status = (output.match(/Status:\s*(.*)/i) || [])[1]?.trim();
      const corrected = (output.match(/Corrected:\s*(.*)/i) || [])[1]?.trim();
      const answer = (output.match(/Answer:\s*(.*)/i) || [])[1]?.trim();

      // SPEAK AI in ORDER (Girl voice)
      if (status) speakAI(status);
      setTimeout(() => corrected && speakAI("Corrected sentence: " + corrected), 2000);
      setTimeout(() => answer && speakAI("Answer: " + answer), 4500);

    } catch (e) {
      console.error(e);
      setAiReply("AI error.");
    }
  };

  // -------------------------------------------
  // 5️⃣ STOP AI VOICE
  // -------------------------------------------
  const stopAI = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
  };

  // -------------------------------------------
  // 6️⃣ RESUME AI VOICE
  // -------------------------------------------
  const resumeAI = () => {
    window.speechSynthesis.resume();
    setIsPaused(false);
  };

  // -------------------------------------------
  // UI RENDER
  // -------------------------------------------
  return (
     <div 
    className="gf-bg"
    style={{
      backgroundImage: `url(${voice})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      width: "100%",
      minHeight: "100vh",
    }}
  >
    <div className="gf-container" 
      >
      <h1 className="gf-title">🎤 AI Grammar Voice Assistant</h1>

      <textarea className="gf-input" value={sentence} readOnly />

      {/* MIC BUTTON */}
      <button
        className={`mic-btn ${isRecording ? "recording" : ""}`}
        onClick={isRecording ? stopMic : startMic}
      >
        {isRecording ? <FaMicrophoneSlash /> : <FaMicrophone />}
        {isRecording ? " Stop Speaking" : " Start Speaking"}
      </button>

      {/* STOP / RESUME VOICE */}
      <div className="ai-control">
        <button className="stop-ai-btn" onClick={stopAI}>
          <FaVolumeMute /> Stop
        </button>

        <button className="resume-ai-btn" onClick={resumeAI} disabled={!isPaused}>
          <FaPlay /> Resume
        </button>
      </div>

      {/* AI RESPONSE */}
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
