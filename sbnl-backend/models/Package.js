const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema(
  {
    title: String,
    location: String,
    description: String,
    price: Number,
    offerPrice: Number,
    image: String,
    includes: [String],
    thingsToDo: [String],
    attractions: [String],
    galleryImages: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Package", packageSchema);
