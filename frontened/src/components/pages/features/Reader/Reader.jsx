import React, { useState, useRef } from "react";
import "./Reader.css";
import { FaUpload, FaRobot } from "react-icons/fa";

export default function Reader() {
  const [file, setFile] = useState(null);
  const [previewURL, setPreviewURL] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [summary, setSummary] = useState("");   // ⭐ Auto summary
  const [question, setQuestion] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef();

  // 🔥 Use your environment variable key
  const API_KEY = import.meta.env.VITE_GEMINI;

  // Convert file to Base64
  const toBase64 = (file) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.readAsDataURL(file);
    });

  // Handle file upload
  const handleFile = async (f) => {
    setFile(f);
    setPreviewURL(URL.createObjectURL(f));
    setAiResponse("");
    setSummary("");

    // ⭐ Auto summarize when file is uploaded
    autoSummarize(f);
  };

  // Drag events
  const drag = (e, t) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(t === "enter" || t === "over");
  };

  const drop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  // -----------------------------------------------------
  // ⭐ AUTO SUMMARY (PDF or Image)
  // -----------------------------------------------------
  const autoSummarize = async (file) => {
    setLoading(true);

    try {
      const base64 = await toBase64(file);

      const body = {
        contents: [
          {
            role: "user",
            parts: [
              { text: "Summarize this document or image briefly in 5–7 lines." },
              {
                inline_data: {
                  mime_type: file.type,
                  data: base64
                }
              }
            ]
          }
        ]
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();
      const summaryText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text || "Could not summarize the file.";

      setSummary(summaryText);
    } catch (err) {
      console.error(err);
      setSummary("Error: Could not summarize the document.");
    }

    setLoading(false);
  };

  // -----------------------------------------------------
  // ⭐ USER ASKS QUESTION ABOUT THE FILE
  // -----------------------------------------------------
  const askAI = async () => {
    if (!file) return alert("Upload a file first.");
    if (!question.trim()) return;

    setLoading(true);
    setAiResponse("");

    try {
      const base64 = await toBase64(file);

      const body = {
        contents: [
          {
            role: "user",
            parts: [
              { text: `Answer this question based on the uploaded file: ${question}` },
              {
                inline_data: {
                  mime_type: file.type,
                  data: base64
                }
              }
            ]
          }
        ]
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();
      const answer =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "AI couldn't answer from the file.";

      setAiResponse(answer);
    } catch (err) {
      console.error(err);
      alert("AI request failed");
    }

    setLoading(false);
  };

  return (
    <div className="reader-container">
      <h1 className="reader-title">📑 AI Document & Image Analyzer</h1>
      <p className="reader-sub">Upload → Auto Summary → Ask Anything</p>

      {/* Drag + Upload */}
      <div
        className={`drop-box ${dragActive ? "active" : ""}`}
        onClick={() => fileInputRef.current.click()}
        onDragEnter={(e) => drag(e, "enter")}
        onDragOver={(e) => drag(e, "over")}
        onDragLeave={(e) => drag(e, "leave")}
        onDrop={drop}
      >
        <FaUpload className="upload-icon" />
        <p>{file ? file.name : "Click or Drag & Drop PDF / Image"}</p>

        <input
          hidden
          type="file"
          accept=".pdf,image/*"
          ref={fileInputRef}
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </div>

      {/* Preview */}
      <div className="preview-box">
        {previewURL ? (
          file.type === "application/pdf" ? (
            <iframe src={previewURL} className="pdf-view" />
          ) : (
            <img src={previewURL} className="img-view" />
          )
        ) : (
          <div className="empty-preview">Preview will appear here</div>
        )}
      </div>

      {/* AI Summary */}
      {summary && (
        <div className="response-box">
          <h3>📘 Auto Summary:</h3>
          <p>{summary}</p>
        </div>
      )}

      {/* Ask AI */}
      <div className="ask-box">
        <h3><FaRobot /> Ask Anything About This File</h3>

        <input
          type="text"
          placeholder="Ask a question… (e.g., what is shown in this image?)"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && askAI()}
        />

        <button className="btn ask-btn" onClick={askAI}>
          {loading ? "Processing…" : "Ask AI"}
        </button>

        {aiResponse && (
          <div className="response-box">
            <h4>🤖 AI Answer:</h4>
            <p>{aiResponse}</p>
          </div>
        )}
      </div>
    </div>
  );
}
