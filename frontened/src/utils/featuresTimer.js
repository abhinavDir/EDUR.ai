// src/utils/featureTimer.js
import socket from "../socket";

/*
  Usage:
    const timer = createFeatureTimer(userId, "askAI");
    timer.start(); // call when user opens the feature
    timer.pause(); // when leaves
    timer.stop(); // when done
*/

export function createFeatureTimer(userId, feature, tickInterval = 10) {
  // tickInterval seconds (default 10s)
  let seconds = 0;
  let running = false;
  let intervalId = null;

  function emitTick(amount) {
    // send small increments to backend to update daily study minutes
    socket.emit("featureTime", { userId, feature, seconds: amount }); // backend handles aggregation
  }

  return {
    start() {
      if (running) return;
      running = true;
      // immediate notify start (optional)
      socket.emit("featureStarted", { userId, feature });
      intervalId = setInterval(() => {
        seconds += tickInterval;
        emitTick(tickInterval);
      }, tickInterval * 1000);
    },
    pause() {
      if (!running) return;
      clearInterval(intervalId);
      running = false;
      if (seconds > 0) {
        // send remaining seconds if needed
        emitTick(seconds);
        seconds = 0;
      }
      socket.emit("featureStopped", { userId, feature });
    },
    stop() {
      this.pause();
      socket.emit("featureStopped", { userId, feature });
    },
  };
}
