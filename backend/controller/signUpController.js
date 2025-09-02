const Signup = require('../model/signup'); // Sequelize model
const bcrypt = require('bcrypt');

const signUpController = {
  signup: async (req, res) => {
    try {
      const { name, phone, email, password } = req.body;

      // basic validation
      if (!name || !phone || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // check if user already exists
      const existingUser = await Signup.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ message: "User already exists with this email" });
      }

      // hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // create new user
      const newUser = await Signup.create({
        name,
        phone,
        email,
        password: hashedPassword,
        created_at: new Date(),
      });

      return res.status(201).json({
        message: "User signed up successfully",
        user: newUser,
      });
    } catch (error) {
      console.error("Error in signup:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
};

module.exports = signUpController;
