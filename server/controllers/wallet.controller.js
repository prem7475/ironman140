const crypto = require('crypto');
const User = require('../models/User');

exports.getWallet = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('walletBalance walletTransactions');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Unable to fetch wallet' });
  }
};

exports.addMoney = async (req, res) => {
  const amount = Number(req.body.amount);
  const source = String(req.body.source || '');
  if (!Number.isFinite(amount) || amount <= 0 || !['UPI', 'CREDIT_CARD', 'DEBIT_CARD', 'NET_BANKING'].includes(source)) {
    return res.status(400).json({ msg: 'Enter a valid amount and funding source' });
  }

  const reference = `PF-WALLET-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $inc: { walletBalance: amount },
        $push: { walletTransactions: { type: 'CREDIT', amount, source, reference } }
      },
      { new: true }
    ).select('walletBalance walletTransactions');

    // Emit Real-Time WebSocket Event
    const io = req.app.get('io');
    if (io) {
      io.emit('wallet_updated', {
        userId: req.user.id,
        walletBalance: user.walletBalance,
        walletTransactions: user.walletTransactions
      });
    }

    res.json({ msg: 'Wallet credited successfully', reference, wallet: user });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Unable to credit wallet' });
  }
};

exports.withdrawMoney = async (req, res) => {
  const amount = Number(req.body.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ msg: 'Enter a valid amount' });
  }

  const reference = `PF-WITHDRAW-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

  try {
    const user = await User.findOneAndUpdate(
      { _id: req.user.id, walletBalance: { $gte: amount } },
      {
        $inc: { walletBalance: -amount },
        $push: { walletTransactions: { type: 'DEBIT', amount, source: 'WITHDRAWAL', reference } }
      },
      { new: true }
    ).select('walletBalance walletTransactions');

    if (!user) {
      return res.status(400).json({ msg: 'Insufficient wallet balance' });
    }

    // Emit Real-Time WebSocket Event
    const io = req.app.get('io');
    if (io) {
      io.emit('wallet_updated', {
        userId: req.user.id,
        walletBalance: user.walletBalance,
        walletTransactions: user.walletTransactions
      });
    }

    res.json({ msg: 'Wallet withdrawal recorded successfully', reference, wallet: user });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Unable to record withdrawal' });
  }
};
