// frontened/src/components/pages/AskAI.jsx
import { useState, useEffect, useRef } from "react";
import "./AskAI.css";
import { FaBars } from "react-icons/fa";
import aibg from "../../../../assets/aipage.png";


// ----------------- giveXP (inline) -----------------
async function giveXP(type) {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?._id) return;

    await fetch(`${import.meta.env.VITE_API_URL}/api/study/feature-used`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user._id, type }),
    });
  } catch (err) {
    console.log("XP Error:", err);
  }
}


// CLEAN MARKDOWN
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
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/feature-used`);
        const data = await res.json();

        if (data.status) {
          const list = data.chats.map((c) => ({
            id: c.chatId,
            messages: c.messages,
          }));

          setChats(list);
          setCurrentChat(
            list.length > 0
              ? list.sort((a, b) => b.id - a.id)[0]
              : { id: Date.now(), messages: [] }
          );

        } else {
          setCurrentChat({ id: Date.now(), messages: [] });
        }

      } catch (err) {
        setCurrentChat({ id: Date.now(), messages: [] });
      }
    }

    loadChats();
  }, []);


  // SAVE CHAT
  async function saveChatToDB(chat) {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/chat/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId: chat.id, messages: chat.messages }),
      });
    } catch {}
  }


  // DELETE CHAT
  async function deleteChat(chatId) {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/chat/delete/${chatId}`, {
        method: "DELETE",
      });
    } catch {}

    setChats((prev) => prev.filter((c) => c.id !== chatId));

    if (currentChat?.id === chatId) {
      const updated = chats.filter((c) => c.id !== chatId);

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
      setChats((prev) => [...prev.filter((c) => c.id !== currentChat.id), currentChat]);
    }
  }, [currentChat]);



  // NEW CHAT
  const newChat = () => {
    const fresh = { id: Date.now(), messages: [] };
    setCurrentChat(fresh);
    setMenuOpen(false);
  };



  // SEND MESSAGE
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };

    setCurrentChat((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
    }));

    await giveXP("askAI");

    const reply = await callGeminiAPI(input);
    setInput("");

    setCurrentChat((prev) => ({
      ...prev,
      messages: [...prev.messages, { role: "assistant", text: cleanMarkdown(reply) }],
    }));
  };



  // ============================================================
  //  GEMINI RESPONSE SYSTEM (ChatGPT-like + SAFE + NO SOURCE CODE)
  // ============================================================
  async function callGeminiAPI(userText) {

    try {
      const lower = userText.toLowerCase();

      let formatInstruction = "";
      let wordLimit = "60–90 words";
      let includeExample = false;


      // DETECT CONFLICT bullet + para
      const wantsBullet =
        lower.includes("bullet") ||
        lower.includes("points") ||
        lower.includes("list");

      const wantsParagraph =
        lower.includes("paragraph") ||
        lower.includes("para") ||
        lower.includes("line");

      if (wantsBullet && wantsParagraph) {
        return (
          "Fizzz! ⚡ Yeh thoda confusing lag raha hai 😅\n" +
          "Bullet chahiye ya paragraph? Dono ek saath nahi ho sakte!\n" +
          "What are your problem bro 😂 Thoda clear bol do."
        );
      }


      // WORD COUNT DETECTOR
      const countMatch = lower.match(/(\d+)\s*words?/);
      if (countMatch) {
        const n = Number(countMatch[1]);
        wordLimit = `${n - 20}–${n + 20} words`;
      }


      // EXAMPLE DETECTOR
      if (lower.includes("example")) includeExample = true;



      // FORMAT LOGIC
      if (wantsBullet) {
        formatInstruction = `
Write ONLY bullet points.
Use "-".
Limit: ${wordLimit}.
${includeExample ? "Add 1 simple example." : "No examples."}
        `;
      }

      else if (wantsParagraph) {
        formatInstruction = `
Write ONLY one paragraph.
Limit: ${wordLimit}.
${includeExample ? "Include one simple example." : "No examples."}
        `;
      }

      else if (
        lower.includes("meaning") ||
        lower.includes("translation") ||
        lower.includes("arth")
      ) {
        formatInstruction = `
Give ONLY meaning.
Strict 5–15 words.
No examples.
        `;
        wordLimit = "5–15 words";
      }

      else {
        formatInstruction = `
Write a clean natural paragraph.
Limit: ${wordLimit}.
${includeExample ? "Add one small example." : ""}
        `;
      }



      // BLOCK FULL SOURCE CODE REQUESTS
      if (
        lower.includes("html") ||
        lower.includes("react") ||
        lower.includes("javascript file") ||
        lower.includes("full code") ||
        lower.includes("source code") ||
        lower.includes("css") ||
        lower.includes("jsx")
      ) {
        return (
          "Sorry! 😅 Main poora source code provide nahi kar sakta, " +
          "par main concept, logic, explanation ya pseudocode zaroor de sakta hoon. " +
          "Aap kya samajhna chahte ho?"
        );
      }



      // FINAL SYSTEM PROMPT
      const finalPrompt = `
Reply naturally in SAME language as user.

STRICT RULES:
- NEVER mention rules, bullets, paragraphs, examples or formatting.
- NEVER say “I will reply like this…”.
- NEVER output real source code (HTML, CSS, JS, React, etc.)
- If user asks for code → give safe explanation only.
- Only output final content.

Formatting mode:
${formatInstruction}

User message:
${userText}
`;



      // GEMINI REQUEST
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: finalPrompt }] }],
          }),
        }
      );


      const data = await res.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";

    } catch (err) {
      return "⚠ Error contacting AI server.";
    }
  }





  // UI RENDER ---------------------------------------------------

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

        <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
          <FaBars />
        </button>

        {/* SIDEBAR */}
        <aside className={`sidebar ${menuOpen ? "show" : ""}`}>
          <button className="new-chat-btn" onClick={newChat}>+ New Chat</button>

          {chats
            .sort((a, b) => b.id - a.id)
            .map((chat) => (
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
                  {chat.messages[0]?.text?.slice(0, 20) || "New Chat"}
                </div>

                <button
                  className="delete-chat-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Delete this chat?")) deleteChat(chat.id);
                  }}
                >
                  ✖
                </button>
              </div>
            ))}
        </aside>



        {/* CHAT SCREEN */}
        <div className="chat-screen">

          <div className="messages">
            {currentChat.messages.map((msg, idx) => (
              <div key={idx} className={`msg ${msg.role}`}>
                <div className="bubble">{cleanMarkdown(msg.text)}</div>
              </div>
            ))}
            <div ref={messagesEndRef}></div>
          </div>



          {/* INPUT AREA */}
          <div className="input-area">
            <input
              type="text"
              placeholder="Ask anything…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="chat-input"
            />

            <button className="send-btn" onClick={sendMessage}>➤</button>
          </div>

        </div>

      </div>
    </div>
  );
}
