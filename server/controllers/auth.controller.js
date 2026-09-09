const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @desc    Register a new user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      countryCode,
      address,
      nationality,
      aadhaar,
      docType,
      membershipStatus
    } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const admin = await User.findOne({ role: 'ADMIN' }).select('membershipPrice');
    user = new User({
      name,
      email,
      password,
      phone,
      countryCode,
      address,
      nationality,
      aadhaar,
      docType,
      membershipStatus: membershipStatus === 'ACTIVE' ? 'ACTIVE' : 'FREE',
      membershipPrice: admin?.membershipPrice ?? 4999
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = {
      user: { id: user.id, role: user.role }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 36000 },
      async (err, token) => {
        if (err) throw err;

        // Save active session token to MongoDB under user.tokens placeholder
        try {
          await User.findByIdAndUpdate(user.id, {
            $push: { tokens: { token, createdAt: new Date() } }
          });
        } catch (dbErr) {
          console.error('Error saving token to MongoDB:', dbErr.message);
        }

        res.json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            membershipStatus: user.membershipStatus
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const payload = {
      user: { id: user.id, role: user.role }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 36000 },
      async (err, token) => {
        if (err) throw err;

        // Save active session token to MongoDB under user.tokens placeholder
        try {
          await User.findByIdAndUpdate(user.id, {
            $push: { tokens: { token, createdAt: new Date() } }
          });
        } catch (dbErr) {
          console.error('Error saving token to MongoDB:', dbErr.message);
        }

        res.json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            membershipStatus: user.membershipStatus
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Google OAuth Sign In / Sign Up Verification
// @route   POST /api/auth/google
exports.googleAuth = async (req, res) => {
  try {
    const { email, name, avatarUrl } = req.body;
    if (!email) return res.status(400).json({ msg: 'Google email is required' });

    let user = await User.findOne({ email });

    if (!user) {
      // Auto-create new athlete account from Google credentials
      const randomPassword = Math.random().toString(36).slice(-10);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      user = new User({
        name: name || email.split('@')[0],
        email,
        password: hashedPassword,
        membershipStatus: 'FREE',
        role: 'USER'
      });
      await user.save();
    }

    const payload = {
      user: { id: user.id, role: user.role }
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 36000 }, async (err, token) => {
      if (err) throw err;
      try {
        await User.findByIdAndUpdate(user.id, { $push: { tokens: { token, createdAt: new Date() } } });
      } catch (dbErr) {
        console.error('Error saving token to MongoDB:', dbErr.message);
      }

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          membershipStatus: user.membershipStatus
        }
      });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
