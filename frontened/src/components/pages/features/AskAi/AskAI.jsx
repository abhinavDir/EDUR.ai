import { useState, useEffect, useRef } from "react";
import "./AskAI.css";
import { FaBars } from "react-icons/fa";
import aibg from "../../../../assets/aipage.png";

// ------- CLEAN MARKDOWN --------
function cleanMarkdown(text) {
  if (!text) return "";

  return text
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/__/g, "")
    .replace(/_/g, "")
    .replace(/#+\s?/g, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/>\s?/g, "")
    .trim();
}

export default function AskAI() {
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [input, setInput] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const messagesEndRef = useRef(null);

  // ---- AUTO SCROLL ----
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentChat]);

  // ---- LOAD CHATS FROM DB ----
  useEffect(() => {
    async function loadChats() {
      const res = await fetch("http://localhost:5000/api/chat/all");
      const data = await res.json();

      if (data.status) {
        const list = data.chats.map(c => ({
          id: c.chatId,
          messages: c.messages,
        }));

        setChats(list);

        // open latest chat or create new
        setCurrentChat(
          list.length > 0
            ? list.sort((a, b) => b.id - a.id)[0]
            : { id: Date.now(), messages: [] }
        );
      }
    }
    loadChats();
  }, []);

  // ---- SAVE CHAT TO DB ----
  async function saveChatToDB(chat) {
    await fetch("http://localhost:5000/api/chat/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId: chat.id, messages: chat.messages }),
    });
  }

  // ---- SAVE CHAT ON UPDATE ----
  useEffect(() => {
    if (currentChat) {
      saveChatToDB(currentChat);
      setChats(prev => [
        ...prev.filter(c => c.id !== currentChat.id),
        currentChat,
      ]);
    }
  }, [currentChat]);

  // ---- CREATE NEW CHAT ----
  const newChat = () => {
    const fresh = { id: Date.now(), messages: [] };
    setCurrentChat(fresh);
    setMenuOpen(false);
  };

  // ---- SEND MESSAGE ----
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };

    setCurrentChat(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
    }));

    const reply = await callGeminiAPI(input);
    setInput("");

    setCurrentChat(prev => ({
      ...prev,
      messages: [
        ...prev.messages,
        { role: "assistant", text: cleanMarkdown(reply) },
      ],
    }));
  };

  // ------ GEMINI 2.5 FLASH + CLEAN FORMAT ------
  async function callGeminiAPI(userText) {
    try {
      const finalPrompt = `
You MUST reply in the SAME LANGUAGE as the user message.

Rules:
1. 120–180 words with headings + bullets.
2. If user says "add more", write 300–600 words.
3. If user says "pdf", reply: "Sorry, I can't generate PDF files but I can format text beautifully."
4. Format:
- Title
- Intro
- Bullet points
- Numbered points
- UPPERCASE instead of bold
- Example section
- Summary

DO NOT use *, **, _, #, code blocks.

User message:
${userText}
`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${
          import.meta.env.VITE_GEMINI
        }`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: finalPrompt }] }],
          }),
        }
      );

      const data = await res.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || "⚠ No response.";
    } catch {
      return "⚠ Error contacting server.";
    }
  }

  if (!currentChat) return <p>Loading...</p>;

  return (
    <div
      className="ai-bg"
      style={{
        backgroundImage: `url(${aibg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        width: "100%",
        minHeight: "100vh",
      }}
    >
      <div className="askai-layout">

        {/* Mobile menu toggle */}
        <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
          <FaBars />
        </button>

        {/* Sidebar */}
        <aside className={`sidebar ${menuOpen ? "show" : ""}`}>
          <button className="new-chat-btn" onClick={newChat}>+ New Chat</button>

          {chats
            .sort((a, b) => b.id - a.id)
            .map(chat => (
              <div
                key={chat.id}
                className={`chat-item ${chat.id === currentChat.id ? "active" : ""}`}
                onClick={() => {
                  setCurrentChat(chat);
                  setMenuOpen(false);
                }}
              >
                {chat.messages[0]?.text.slice(0, 20) || "New Chat"}
              </div>
            ))}
        </aside>

        {/* Chat Screen */}
        <div className="chat-screen">
          <div className="messages">
            {currentChat.messages.map((msg, idx) => (
              <div key={idx} className={`msg ${msg.role}`}>
                <div className="bubble">{cleanMarkdown(msg.text)}</div>
              </div>
            ))}

            <div ref={messagesEndRef}></div>
          </div>

          {/* Input Box */}
          <div className="input-area">
            <input
              type="text"
              placeholder="Ask anything…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              className="chat-input"
            />
            <button className="send-btn" onClick={sendMessage}>➤</button>
          </div>
        </div>

      </div>
    </div>
  );
}
