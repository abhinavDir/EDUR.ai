import { useState, useEffect, useRef } from "react";
import "./AskAI.css";
import { FaBars } from "react-icons/fa";
import aibg from "../../../../assets/aipage.png";

// -----------------------------------------
//        CLEAN MARKDOWN (Keeps bullets)
// -----------------------------------------
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

  // AUTO SCROLL
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentChat]);

  // LOAD CHATS
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
        setCurrentChat(
          list.length > 0
            ? list.sort((a, b) => b.id - a.id)[0]
            : { id: Date.now(), messages: [] }
        );
      }
    }
    loadChats();
  }, []);

  // SAVE CHAT
  async function saveChatToDB(chat) {
    await fetch("http://localhost:5000/api/chat/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId: chat.id, messages: chat.messages }),
    });
  }

  // DELETE CHAT FROM DATABASE
  async function deleteChat(chatId) {
    await fetch(`http://localhost:5000/api/chat/delete/${chatId}`, {
      method: "DELETE",
    });

    setChats(prev => prev.filter(c => c.id !== chatId));

    if (currentChat?.id === chatId) {
      const updated = chats.filter(c => c.id !== chatId);
      setCurrentChat(
        updated.length > 0
          ? updated.sort((a, b) => b.id - a.id)[0]
          : { id: Date.now(), messages: [] }
      );
    }
  }

  useEffect(() => {
    if (currentChat) {
      saveChatToDB(currentChat);
      setChats(prev => [
        ...prev.filter(c => c.id !== currentChat.id),
        currentChat,
      ]);
    }
  }, [currentChat]);

  const newChat = () => {
    const fresh = { id: Date.now(), messages: [] };
    setCurrentChat(fresh);
    setMenuOpen(false);
  };

  // SEND MESSAGE
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
      messages: [...prev.messages, { role: "assistant", text: cleanMarkdown(reply) }],
    }));
  };

  // ------------------------------------------------------------
  //      GEMINI API — ULTRA SMART FORMAT DETECTION
  // ------------------------------------------------------------
  async function callGeminiAPI(userText) {
    try {
      const lower = userText.toLowerCase();
      let formatInstruction = "";
      let wordLimit = "60-90 words";

      // Bullet format
      if (
        lower.includes("bullet") ||
        lower.includes("points") ||
        lower.includes("list") ||
        lower.includes("dot")
      ) {
        formatInstruction = `
Use bullet points only.
Use "-" as bullet.
Short bullets, no paragraph.
        `;
      }

      // Paragraph format
      else if (
        lower.includes("para") ||
        lower.includes("paragraph") ||
        lower.includes("line")
      ) {
        formatInstruction = `
Write only one short paragraph.
Do NOT use bullets.
        `;
      }

      // Meaning / translation only
      else if (
        lower.includes("meaning") ||
        lower.includes("hindi meaning") ||
        lower.includes("translate") ||
        lower.includes("translation") ||
        lower.includes("arth")
      ) {
        formatInstruction = `
Give only the meaning or translation.
NO extra lines.
NO examples.
NO paragraph.
Just the meaning (5–15 words).
        `;
        wordLimit = "5-15 words";
      }

      // Default behavior
      else {
        formatInstruction = `
Write a short paragraph.
No extra examples.
No headings.
        `;
      }

      const finalPrompt = `
You MUST reply in the same language as the user.

Rules:
- If user asks meaning → ONLY meaning (5–15 words)
- If user asks bullet → ONLY bullets using "-"
- If user asks paragraph → ONLY paragraph
- Default → short paragraph (60–90 words)
- NO markdown (**,_ ,#, code blocks)

Formatting:
${formatInstruction}

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
        
        {/* Mobile toggle */}
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
              >
                <div
                  onClick={() => {
                    setCurrentChat(chat);
                    setMenuOpen(false);
                  }}
                  style={{ flex: 1, cursor: "pointer" }}
                >
                  {chat.messages[0]?.text.slice(0, 20) || "New Chat"}
                </div>

                {/* DELETE BUTTON */}
                <button
                  className="delete-chat-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Are you sure you want to delete this chat?")) {
                      deleteChat(chat.id);
                    }
                  }}
                >
                  ✖
                </button>
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

          {/* Input */}
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
