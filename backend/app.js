require('dotenv').config();
const express = require("express");
const cors = require("cors");
const app = express();
const { sequelize } = require("./config/db"); // ✅ Import DB pool


const signup = require('./routes/signup')
const login = require('./routes/login')
const category = require('./routes/category')
const expense = require('./routes/expense')
const verify = require('./routes/verify')
const payment = require('./routes/payment')
const forgotpassword = require('./routes/forgotpassword')
// Middleware
app.use(cors());
app.use(express.json()); // Parse incoming JSON


app.get("/", (req, res) => {
  res.send("Welcome to the Feedback API");
});

app.use("/signup",signup)
app.use("/login",login)
app.use("/categories", category)
app.use("/expenses", expense)
app.use("/verify", verify)
app.use("/payment", payment)
app.use("/forgotpassword",forgotpassword)
const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });

  module.exports = app;