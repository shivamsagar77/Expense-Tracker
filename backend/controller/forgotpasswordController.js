const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");
const User = require('../model/signup');
const ForgotPassword = require('../model/ForgotPassword'); // <- new model banani hogi

// Mail transporter
let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "shivam.itechsarathi@gmail.com",
        pass: "gapa pwxc slvm zlaa"
    }
});

const forgotpasswordController = {
    // STEP 1: Send reset link
    forgotpassword: async (req, res) => {
        try {
            console.log("hello")
            const { email } = req.body;
            const user = await User.findOne({ where: { email } });
            if (!user) return res.status(404).json({ message: 'User not found' });

            // generate uuid
            const requestId = uuidv4(); 
            const randomgenerate = uuidv4();
            console.log(randomgenerate,"randomgenerate")
            await ForgotPassword.create({
                id: requestId,
                user_id: user.id,
                is_active: true
            });

            // reset link
            const resetUrl = `http://localhost:5173/password/resetpassword/${requestId}`;

            // send mail
            await transporter.sendMail({
                from: "shivam.itechsarathi@gmail.com",
                to: user.email,
                subject: "Password Reset Link",
                text: `Click this link to reset your password: ${resetUrl}`
            });

            res.json({ message: "Reset link sent to your email" });
        } catch (e) {
            console.error(e);
            res.status(500).json({ error: e.message });
        }
    },

    // STEP 3: Reset password
    resetpassword: async (req, res) => {

      
        try {
      
            const { newPassword } = req.body;
            const requestId = req.params.id;
         
         
            const resetReq = await ForgotPassword.findOne({ where: { id: requestId, is_active: true } });
         
            if (!resetReq) return res.status(400).json({ message: "Invalid or expired reset link" });

            const user = await User.findByPk(resetReq.user_id);
            if (!user) return res.status(404).json({ message: "User not found" });

            user.password = await bcrypt.hash(newPassword, 10);
            await user.save();

            resetReq.is_active = false;
            await resetReq.save();

            res.json({ message: "Password updated successfully" });
        } catch (e) {
            console.error(e);
            res.status(500).json({ error: e.message });
        }
    }
};

module.exports = forgotpasswordController;
