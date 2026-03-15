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

    console.log("⚠ Blockchain listener disabled for demo");

    app.listen(PORT, () => {
      console.log(`DeFiVault backend listening on port ${PORT}`);
    });

  } catch (err) {
    console.error("Failed to start backend:", err);
  }
}

bootstrap();
