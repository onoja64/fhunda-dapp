// Mock HeartbeatWorker to avoid build issues
// This replaces the problematic wagmi HeartbeatWorker

self.addEventListener("message", (event) => {
  // Handle heartbeat messages
  const { type, data } = event.data;

  if (type === "start") {
    // Start heartbeat functionality
    console.log("Heartbeat started");
  } else if (type === "stop") {
    // Stop heartbeat functionality
    console.log("Heartbeat stopped");
  }
});

// Stop heartbeat on unload
self.addEventListener("beforeunload", () => {
  console.log("Heartbeat worker unloading");
});
