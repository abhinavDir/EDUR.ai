import { useEffect, useState } from "react";
import socket from "../../socket";
import confetti from "canvas-confetti";
import "./reminder.css";

import levelUpSound from "../../assets/sounds/level-up.wav";
import notifySound from "../../assets/sounds/notify.wav";
import achievementSound from "../../assets/sounds/achievement.wav";

export default function Reminder() {
  const [streak, setStreak] = useState(0);

  // Logged-in user
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?._id;

  const playSound = (file) => new Audio(file).play();

  useEffect(() => {
    if (!userId) return;

    Notification.requestPermission();
    socket.emit("registerUser", userId);

    // -------------------------------
    // 🎯 STREAK UPDATE
    // -------------------------------
    const streakListener = ({ streak }) => {
      setStreak(streak);

      // Fire Mode Confetti (streak >= 50)
      if (streak >= 50 && streak % 10 === 0) {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    };

    socket.on("streakUpdate", streakListener);

    // -------------------------------
    // 🔔 REAL NOTIFICATIONS
    // -------------------------------
    const notifyListener = ({ title, body, icon }) => {
      new Notification(title, { body, icon });
      playSound(notifySound);
    };

    socket.on("notify", notifyListener);

    // -------------------------------
    // ⭐ LEVEL UP SOUND + CONFETTI
    // -------------------------------
    const levelUpListener = ({ level }) => {
      playSound(levelUpSound);

      confetti({
        particleCount: 140,
        spread: 100,
        origin: { y: 0.7 }
      });
    };

    socket.on("levelUp", levelUpListener);

    // -------------------------------
    // 🏆 ACHIEVEMENT SOUND
    // -------------------------------
    const achievementListener = ({ title }) => {
      playSound(achievementSound);

      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 }
      });
    };

    socket.on("achievementUnlocked", achievementListener);

    // -------------------------------
    // 🖱️ USER ACTIVITY
    // -------------------------------
    const sendActivity = () => socket.emit("activity", { userId });

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, sendActivity));

    // Heartbeat activity = every 2 sec
    const heartbeat = setInterval(sendActivity, 2000);

    // -------------------------------
    // 🔥 CLEANUP
    // -------------------------------
    return () => {
      socket.off("streakUpdate", streakListener);
      socket.off("notify", notifyListener);
      socket.off("levelUp", levelUpListener);
      socket.off("achievementUnlocked", achievementListener);

      events.forEach((e) => window.removeEventListener(e, sendActivity));
      clearInterval(heartbeat);
    };
  }, [userId]);

  if (!userId)
    return (
      <h2 className="no-user">
        ❌ Please login first to activate Study Reminders.
      </h2>
    );

  return (
    <div className="reminder-body">
      <h1 className="reminder-title">📚 Smart Study Reminder</h1>

      <div className={`streak-box-animated ${streak >= 50 ? "fire-glow" : ""}`}>
        🔥 <span>{streak}</span> Day Study Streak!
      </div>

      <p className="reminder-info">Move, type or touch — your streak increases live!</p>
      <p className="reminder-info">AI keeps sending real-time study alerts ⚡</p>
    </div>
  );
}
