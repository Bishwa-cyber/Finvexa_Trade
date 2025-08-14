// require("dotenv").config();
// const express = require("express");
// const http = require("http");
// const { Server } = require("socket.io");
// const WebSocket = require("ws"); // You missed this import!
// const cors = require("cors");

// const app = express();
// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: "http://192.168.40.6:8081", // Update with your frontend’s actual development URL or LAN IP
//     methods: ["GET", "POST"],
//   },
// });

// app.use(cors());

// // REST Test Endpoint
// app.get("/", (req, res) => {
//   res.send("Backend running");
// });

// Socket.io Setup
// io.on("connection", (socket) => {
//   console.log("Frontend Connected");

//   const polygonSocket = new WebSocket("wss://socket.polygon.io/stocks");

//   polygonSocket.onopen = () => {
//     console.log("Polygon WebSocket Connected");

//     polygonSocket.send(
//       JSON.stringify({
//         action: "auth",
//         params: process.env.POLYGON_API_KEY, // Make sure this exists in your .env file
//       })
//     );

//     polygonSocket.send(
//       JSON.stringify({
//         action: "subscribe",
//         params: "T.TSLA", // Example ticker
//       })
//     );
//   };

//   polygonSocket.onmessage = (msg) => {
//     try {
//       const data = JSON.parse(msg.data);
//       socket.emit("stockData", data);
//     } catch (error) {
//       console.error("Error parsing Polygon message:", error);
//     }
//   };

//   polygonSocket.onerror = (err) => {
//     console.error("Polygon WebSocket error:", err);
//   };

//   socket.on("disconnect", () => {
//     console.log("Frontend Disconnected");
//     if (polygonSocket.readyState === WebSocket.OPEN) {
//       polygonSocket.close();
//     }
//   });
// });


// io.on("connection", (socket) => {
//   console.log("Frontend Connected");

//   setInterval(() => {
//     socket.emit("stockData", { price: Math.random() * 1000 });
//   }, 2000);

//   socket.on("disconnect", () => {
//     console.log("Frontend Disconnected");
//   });
// });

// // Start Server
// server.listen(process.env.PORT || 5001, () => {
//   console.log(`Server running on http://localhost:${process.env.PORT || 5001}`);
// });





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
    origin: "*", // Set your frontend origin here in production
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

    // Subscribe to symbols you want to track
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

      // You can filter or transform data here if needed
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
