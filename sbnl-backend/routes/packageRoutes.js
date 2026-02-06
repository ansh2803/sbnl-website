const express = require("express");
const router = express.Router();
const Package = require("../models/Package");
const multer = require("multer");
const auth = require("../middleware/auth");
const fs = require("fs");
const path = require("path");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// STORAGE FOR IMAGE
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

/* ================= ADD PACKAGE (ADMIN) ================= */
router.post(
  "/",
  auth,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "galleryImages", maxCount: 3 },
  ]),
  async (req, res) => {
    try {
      console.log("BODY:", req.body);
      console.log("FILES:", req.files);

      if (!req.files || !req.files.image || !req.files.image[0]) {
        return res.status(400).json({ error: "Image file is required" });
      }

      const heroImage = req.files.image[0].filename;
      const galleryImages = (req.files.galleryImages || []).map((file) => file.filename);

      const newPackage = new Package({
        title: req.body.title,
        location: req.body.location,
        // location: (req.body.location && req.body.location !== "undefined") ? req.body.location : "",
        description: req.body.description,
        price: req.body.price,
        offerPrice: req.body.offerPrice,
        image: heroImage,
        galleryImages,
        includes: req.body.includes
          ? req.body.includes.split(",").map((item) => item.trim())
          : [],
        thingsToDo: req.body.thingsToDo
          ? req.body.thingsToDo.split(",").map((item) => item.trim())
          : [],
        attractions: req.body.attractions
          ? req.body.attractions.split(",").map((item) => item.trim())
          : [],
      });

      
      console.log("Saving package:", newPackage);
      await newPackage.save();
      res.json({ message: "Package Added", newPackage });
    } catch (err) {
      console.error("Error adding package:", err);
      res.status(500).json({ error: err.message, stack: err.stack });
    }
  },
);

/* ================= GET ALL PACKAGES ================= */
router.get("/", async (req, res) => {
  const packages = await Package.find();
  res.json(packages);
});

/* ================= GET SINGLE PACKAGE ================= */
router.get("/:id", async (req, res) => {
  const pkg = await Package.findById(req.params.id);
  res.json(pkg);
});

function unlinkSafe(dir, filename) {
  if (!filename) return;
  const filePath = path.join(dir, filename);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (e) {
      console.error("Unlink error:", e);
    }
  }
}

router.delete("/:id", auth, async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) return res.status(404).json({ error: "Package not found" });
    if (pkg.image) unlinkSafe(uploadsDir, pkg.image);
    (pkg.galleryImages || []).forEach((f) => unlinkSafe(uploadsDir, f));
    await Package.findByIdAndDelete(req.params.id);
    res.json({ message: "Package Deleted" });
  } catch (err) {
    console.error("Delete package error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.put(
  "/:id",
  auth,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "galleryImages", maxCount: 3 },
  ]),
  async (req, res) => {
    try {
      const existing = await Package.findById(req.params.id);
      if (!existing) return res.status(404).json({ error: "Package not found" });

      const updatedData = {
        title: req.body.title,
        location: req.body.location,
        description: req.body.description,
        price: req.body.price,
        offerPrice: req.body.offerPrice,
        includes: req.body.includes
          ? req.body.includes.split(",").map((s) => s.trim())
          : existing.includes,
        thingsToDo: req.body.thingsToDo
          ? req.body.thingsToDo.split(",").map((s) => s.trim())
          : existing.thingsToDo,
        attractions: req.body.attractions
          ? req.body.attractions.split(",").map((s) => s.trim())
          : existing.attractions,
      };

      const heroImage = req.files?.image?.[0]?.filename;
      const galleryImages = req.files?.galleryImages?.map((f) => f.filename);

      if (heroImage) {
        if (existing.image) unlinkSafe(uploadsDir, existing.image);
        updatedData.image = heroImage;
      } else {
        updatedData.image = existing.image;
      }

      if (galleryImages && galleryImages.length > 0) {
        (existing.galleryImages || []).forEach((f) => unlinkSafe(uploadsDir, f));
        updatedData.galleryImages = galleryImages;
      } else {
        updatedData.galleryImages = existing.galleryImages || [];
      }

      const updated = await Package.findByIdAndUpdate(
        req.params.id,
        updatedData,
        { new: true }
      );
      res.json(updated);
    } catch (err) {
      console.error("Update package error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
