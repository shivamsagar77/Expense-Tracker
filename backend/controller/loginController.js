const Signup = require('../model/signup');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }
  try {
    const user = await Signup.findOne({ where: { email, password } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    return res.status(200).json({ message: 'Login successful', name: user.name });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
