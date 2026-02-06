const express = require("express");
const mongoose = require("mongoose");
const packageRoutes = require("./routes/packageRoutes");
const cors = require("cors");
const multer = require("multer");
const PORT = process.env.PORT || 5000;
require("dotenv").config();

const app = express();

app.use(cors());

app.use(
  cors({
    origin: ["http://127.0.0.1:5500", "http://localhost:5500", "https://sbnl-website.vercel.app"],
    credentials: true,
  }),
);
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Backend Running 🚀");
});

app.use("/api/admin", require("./routes/authRoutes"));
app.use("/api/packages", packageRoutes);

// app.use("/uploads", express.static("uploads"));
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// Error handling middleware - must be last
app.use((err, req, res, next) => {
  console.error("Error:", err);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: "File upload error: " + err.message });
  }
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});
app.get("/", (req, res) => {
  res.send("Backend is working 🚀");
});


// app.listen(5000, () => console.log("Server started on 5000"));
app.listen(PORT, () => console.log(`Server started on ${PORT}`));
