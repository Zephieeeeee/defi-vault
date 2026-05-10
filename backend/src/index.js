require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

const { connectDb } = require("./config/db");
const { startBlockchainListener } = require("./blockchain/listener");

const protocolRoutes = require("./routes/protocol");
const userRoutes = require("./routes/user");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Ensure DB connection for serverless
app.use(async (req, res, next) => {
  if (process.env.VERCEL) {
    try {
      await connectDb(process.env.MONGO_URI);
      next();
    } catch (err) {
      res.status(500).json({ error: "Failed to connect to database" });
    }
  } else {
    next();
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/protocol", protocolRoutes);
app.use("/api/user", userRoutes);

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  try {
  
    try {
      await connectDb(process.env.MONGO_URI);
    } catch (err) {
      console.warn("⚠ MongoDB disabled");
    }

    const artifactsPath = path.join(__dirname, "..", "..", "artifacts");
    console.log("Expecting Hardhat artifacts at:", artifactsPath);

    // In serverless environments, we might not want to start the listener 
    // or we might want to handle it differently.
    if (!process.env.VERCEL) {
      await startBlockchainListener();
      app.listen(PORT, () => {
        console.log(`DeFiVault backend listening on port ${PORT}`);
      });
    }

  } catch (err) {
    console.error("Failed to start backend:", err);
    if (!process.env.VERCEL) process.exit(1);
  }
}

if (!process.env.VERCEL) {
  bootstrap();
}

module.exports = app;
