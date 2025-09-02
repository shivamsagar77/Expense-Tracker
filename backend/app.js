  const express = require("express");
  const cors = require("cors");
  const app = express();
  const { sequelize } = require("./config/db"); // ✅ Import DB pool


  const signup = require('./routes/signup')
  const login = require('./routes/login')
  const category = require('./routes/category')
  const expense = require('./routes/expense')
  // Middleware
  app.use(cors());
  app.use(express.json()); // Parse incoming JSON


  // Root route (should be before listen for consistency)
  app.get("/", (req, res) => {
    res.send("Welcome to the Feedback API");
  });

  // app.use("/api/bus_booking/create_user",bus_booking_app);
  // app.use("/api/bus_booking/bus_system",bus_system)
  // app.use("/api/student_system",student_system)
app.use("/signup",signup)
app.use("/login",login)
app.use("/categories", category)
app.use("/expenses", expense)
  // ✅ Set correct PORT (5000, not 500)
  const PORT = 5000;

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });

  module.exports = app;
