const Signup = require('../model/signup'); // Sequelize model
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const signUpController = {
  signup: async (req, res) => {
    try {
      const { name, phone, email, password } = req.body;

      // basic validation
      if (!name || !phone || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // check if user already exists (case insensitive)
      const existingUser = await Signup.findOne({ where: { email: email.toLowerCase() } });
      if (existingUser) {
        return res.status(409).json({ message: "User already exists with this email" });
      }

      // hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // create new user (store email in lowercase)
      const newUser = await Signup.create({
        name,
        phone,
        email: email.toLowerCase(),
        password: hashedPassword,
        created_at: new Date(),
      });

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: newUser.id, 
          email: newUser.email, 
          name: newUser.name,
          ispremimumuser: newUser.ispremimumuser
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.status(201).json({
        message: "User signed up successfully",
        user: newUser,
        token: token
      });
    } catch (error) {
      console.error("Error in signup:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
};

module.exports = signUpController;
