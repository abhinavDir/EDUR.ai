import { useState, useEffect } from "react";
import "./MCQ.css";
import { FaPlus, FaHistory, FaMagic, FaEllipsisV } from "react-icons/fa";

export default function MCQUltra() {
  const [sets, setSets] = useState([]);
  const [currentSet, setCurrentSet] = useState(null);
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(10);
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreMenu, setMoreMenu] = useState(null);

  // Load saved sets on mount
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("http://localhost:5000/api/mcq/all");
        const data = await res.json();
        if (data.status) {
          const list = data.sets.map((s) => ({
            id: s.setId,
            topic: s.topic,
            mcqs: s.mcqs,
          }));
          setSets(list);
          setCurrentSet(list.length > 0 ? list[list.length - 1] : null);
        }
      } catch (err) {
        console.error("Load MCQ error", err);
      }
    }
    load();
  }, []);

  // Save set to backend
  async function saveToDB(setData) {
    try {
      await fetch("http://localhost:5000/api/mcq/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(setData),
      });
    } catch (err) {
      console.error("Save MCQ error", err);
    }
  }

  // Delete Set
  async function deleteSet(id) {
    try {
      await fetch("http://localhost:5000/api/mcq/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setId: id }),
      });

      const updated = sets.filter((s) => s.id !== id);
      setSets(updated);
      setCurrentSet(updated.length > 0 ? updated[0] : null);
      setMoreMenu(null);
    } catch (err) {
      console.error("Delete error", err);
    }
  }

  // New empty set
  const newSet = () => {
    const blank = { id: Date.now(), topic: "", mcqs: [] };
    setCurrentSet(blank);
    setMoreMenu(null);
  };

  // Generate MCQs using Gemini
  async function generate() {
    if (!topic.trim()) return alert("Enter a topic!");

    const prompt = `
Generate ${count} MCQs on topic: ${topic}
Format:

Q1. question text
A) option
B) option
C) option
D) option
Correct: B
Explain: short explanation
`;

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      );

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

      // parse basic Q blocks (robust enough for common outputs)
      const blocks = text.split(/Q\d+\./).filter(Boolean);
      const parsed = blocks.map((b, i) => {
        const lines = b.split("\n").map((l) => l.trim()).filter(Boolean);
        return {
          qno: i + 1,
          question: lines[0] || `Question ${i + 1}`,
          options: lines.filter((l) => /^[A-D]\)/.test(l)),
          correct: lines.find((l) => /^Correct[:\s]/i.test(l)) || "",
          explain: lines.find((l) => /^Explain[:\s]/i.test(l)) || "",
        };
      });

      const newSetData = { id: Date.now(), topic, mcqs: parsed };
      setSets((p) => [...p, newSetData]);
      setCurrentSet(newSetData);
      saveToDB({ setId: newSetData.id, topic: newSetData.topic, mcqs: newSetData.mcqs });
      setTopic("");
    } catch (err) {
      console.error("Generate error", err);
      alert("Error generating MCQs — check console.");
    }
  }

  // Download printable page (opens print dialog)
  function downloadPDF() {
    if (!currentSet) return;
    const printable = window.open("", "_blank");
    printable.document.write(`
      <html>
      <head>
        <title>MCQ Paper - ${currentSet.topic}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: #111; }
          h1 { margin-bottom: 6px; font-size: 22px; }
          p.meta { margin-top: 0; color: #444; }
          hr { margin: 12px 0; border: none; height: 3px; background: linear-gradient(90deg,#2563eb,#9333ea); }
          .q { margin-bottom: 12px; }
          ul { margin-top: 6px; }
          .correct { color: #059669; font-weight: bold; margin-top:6px; }
        </style>
      </head>
      <body>
        <h1>MCQ Question Paper</h1>
        <p class="meta"><strong>Topic:</strong> ${currentSet.topic || "—"}</p>
        <hr />
        ${currentSet.mcqs.map(m => `
          <div class="q">
            <div><strong>Q${m.qno}.</strong> ${m.question}</div>
            <ul>
              ${m.options.map(o => `<li>${o}</li>`).join("")}
            </ul>
            <div class="correct">${m.correct || ""}</div>
            <div class="explain">${m.explain || ""}</div>
          </div>`).join("")}
      </body>
      </html>
    `);
    printable.document.close();
    printable.print();
  }

  return (
    <div className="ultra-container">
      {/* mobile menu button */}
      <button
        className={`ultra-menu-btn ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="menu"
      >
        <span></span><span></span><span></span>
      </button>

      {/* overlay for mobile */}
      <div className={`ultra-overlay ${menuOpen ? "show" : ""}`} onClick={() => setMenuOpen(false)} />

      {/* sidebar */}
      <aside className={`ultra-sidebar ${menuOpen ? "show" : ""}`}>
        <h2 className="side-title"><FaHistory /> History</h2>

        <button className="side-btn" onClick={newSet}><FaPlus /> New MCQ Set</button>

        {sets.sort((a,b)=>b.id-a.id).map((s) => (
          <div key={s.id} className={`side-item ${currentSet?.id === s.id ? "active" : ""}`}
               onClick={() => { setCurrentSet(s); setMenuOpen(false); setMoreMenu(null); }}>
            <h4>{s.topic || "Untitled"}</h4>
            <span>{s.mcqs.length} Questions</span>

            {/* three dots */}
            <div className="three-dot"
                 onClick={(e) => { e.stopPropagation(); setMoreMenu(moreMenu === s.id ? null : s.id); }}>
              <FaEllipsisV />
            </div>

            {moreMenu === s.id && (
              <div className="popup-menu">
                <p onClick={() => deleteSet(s.id)}>Delete</p>
              </div>
            )}
          </div>
        ))}
      </aside>

      {/* main */}
      <main className="ultra-main">
        <div className="top-banner">
          <h1>🎓 AI MCQ Generator</h1>
          <p>Generate MCQs for school, college & competitive exams.</p>
        </div>

        {/* input area */}
        <div className="mcq-input-container">
          <input
            className="mcq-input-topic"
            type="text"
            placeholder="Enter topic (e.g. Cloud Computing)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />

          <select className="mcq-count" value={count} onChange={(e) => setCount(Number(e.target.value))}>
            <option value={5}>5 MCQs</option>
            <option value={10}>10 MCQs</option>
            <option value={15}>15 MCQs</option>
            <option value={20}>20 MCQs</option>
            <option value={30}>30 MCQs</option>
            <option value={50}>50 MCQs</option>
          </select>

          <button className="mcq-generate-btn" onClick={generate}><FaMagic /> </button>
        </div>

        {/* download */}
        {currentSet && currentSet.mcqs.length > 0 && (
          <button className="mcq-download-btn" onClick={downloadPDF}>⬇ Download MCQ Paper (PDF)</button>
        )}

        {/* list */}
        <div className="mcq-list">
          {!currentSet && <p className="empty">No MCQ Set Selected</p>}
          {currentSet && currentSet.mcqs.map((m, i) => (
            <div key={i} className="mcq-card">
              <h3>Q{m.qno}. {m.question}</h3>
              <ul className="options">{m.options.map((op, idx) => <li key={idx}>{op}</li>)}</ul>
              <p className="correct">{m.correct}</p>
              <p className="explain">{m.explain}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
