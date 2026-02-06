const bcrypt = require("bcryptjs");
const Admin = require("./models/Admin");
require("dotenv").config();
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URL);

(async () => {
  const hashed = await bcrypt.hash("sbnl@2000", 10);

  await Admin.create({
    email: "sbnlworldholidays2@gmail.com",
    password: hashed,
  });

  console.log("Admin Created");
  process.exit();
})();