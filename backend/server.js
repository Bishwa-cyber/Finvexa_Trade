require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const WebSocket = require("ws");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"],
  },
});

app.use(cors());

app.get("/", (req, res) => {
  res.send("Backend running with Twelve Data WebSocket.");
});

if (!process.env.TWELVEDATA_API_KEY) {
  console.error("⚠️  TWELVEDATA_API_KEY is missing in .env!");
  process.exit(1);
}

io.on("connection", (socket) => {
  console.log("Frontend Connected");

  // Connect to Twelve Data WebSocket
  const twelveSocket = new WebSocket(
  `wss://ws.twelvedata.com/v1/quotes/price?apikey=${process.env.TWELVEDATA_API_KEY}`
);

  twelveSocket.onopen = () => {
    console.log("Twelve Data WebSocket Connected");

    // Subscribe to syl  want to track
  twelveSocket.send(
  JSON.stringify({
    action: "subscribe",
    params: {
      symbols: "AAPL,BTC/USD,ETH/USD,EUR/USD,GBP/USD,USD/JPY,USD/INR"
    }
  })
);

    };

  twelveSocket.onmessage = (msg) => {
    try {
      const data = JSON.parse(msg.data);

      //  filter data here 
      socket.emit("stockData", data);
      console.log("Forwarding stockData to frontend:", data);
    } catch (error) {
      console.error("Error parsing Twelve Data message:", error);
    }
  };

  twelveSocket.onerror = (err) => {
    console.error("Twelve Data WebSocket error:", err);
  };

  socket.on("disconnect", () => {
    console.log("Frontend Disconnected");
    if (twelveSocket.readyState === WebSocket.OPEN) {
      twelveSocket.close();
    }
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
