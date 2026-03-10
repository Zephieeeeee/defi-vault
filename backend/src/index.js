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
    await connectDb(process.env.MONGO_URI);

    const artifactsPath = path.join(__dirname, "..", "artifacts");
    console.log("Expecting Hardhat artifacts at:", artifactsPath);

    await startBlockchainListener();

    app.listen(PORT, () => {
      console.log(`DeFiVault backend listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start backend:", err);
    process.exit(1);
  }
}

bootstrap();

