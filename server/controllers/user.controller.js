const User = require('../models/User');

// @desc    Get current user profile
// @route   GET /api/user/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User account not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.upgradeMembership = async (req, res) => {
  const source = String(req.body.source || '');
  if (!['UPI', 'CREDIT_CARD', 'DEBIT_CARD', 'NET_BANKING'].includes(source)) {
    return res.status(400).json({ msg: 'Select a valid payment source' });
  }
  try {
    const user = await User.findByIdAndUpdate(req.user.id, { membershipStatus: 'ACTIVE', membershipPrice: 4999 }, { new: true }).select('-password');

    // Emit Real-Time WebSocket Event
    const io = req.app.get('io');
    if (io) {
      io.emit('user_updated', { userId: req.user.id, user });
    }

    res.json({ msg: 'Premium membership activated successfully', user });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Unable to activate membership' });
  }
};

// @desc    Update user health details
// @route   POST /api/user/health-details
exports.updateHealthDetails = async (req, res) => {
  try {
    const account = await User.findById(req.user.id).select('membershipStatus');
    if (account?.membershipStatus !== 'ACTIVE') return res.status(403).json({ msg: 'Premium membership required' });
    const { height, weight, age, gender } = req.body;

    if (!Number.isFinite(Number(height)) || !Number.isFinite(Number(weight)) || Number(height) <= 0 || Number(weight) <= 0) {
      return res.status(400).json({ msg: 'Height and weight must be positive numbers' });
    }

    const h = height / 100;
    const bmi = Number((weight / (h * h)).toFixed(2));
    const bmiCategory = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obesity';

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          'healthDetails.height': height,
          'healthDetails.weight': weight,
          'healthDetails.age': age,
          'healthDetails.gender': gender,
          'healthDetails.bmi': bmi,
          'healthDetails.bmiCategory': bmiCategory
        }
      },
      { new: true }
    );

    // Emit Real-Time WebSocket Event
    const io = req.app.get('io');
    if (io) {
      io.emit('user_updated', { userId: req.user.id, user });
    }

    res.json(user.healthDetails);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Estimate VO2 Max from a 12-minute run distance
// @route   POST /api/user/vo2-max
exports.getVo2Max = async (req, res) => {
  const account = await User.findById(req.user.id).select('membershipStatus');
  if (account?.membershipStatus !== 'ACTIVE') return res.status(403).json({ msg: 'Premium membership required' });
  const distanceMeters = Number(req.body.distanceMeters);
  if (!Number.isFinite(distanceMeters) || distanceMeters < 500 || distanceMeters > 6000) {
    return res.status(400).json({ msg: 'Enter a valid 12-minute run distance between 500 and 6000 metres.' });
  }

  try {
    const vo2Max = Number(((distanceMeters - 504.9) / 44.73).toFixed(1));
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: { 'healthDetails.vo2Max': vo2Max, 'healthDetails.vo2MaxUpdatedAt': new Date() },
        $push: { 'healthDetails.vo2MaxHistory': { value: vo2Max, date: new Date() } }
      },
      { new: true }
    );

    // Emit Real-Time WebSocket Event
    const io = req.app.get('io');
    if (io) {
      io.emit('user_updated', { userId: req.user.id, user });
    }

    res.json({ vo2Max, updatedAt: user.healthDetails.vo2MaxUpdatedAt });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Unable to update VO2 Max' });
  }
};
