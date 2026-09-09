const crypto = require('crypto');
const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const User = require('../models/User');

const createId = (prefix) => `${prefix}-${new Date().getFullYear()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

// @desc    Register for a race
// @route   POST /api/registrations/events/:eventId/register
exports.registerForRace = async (req, res) => {
  try {
    const { eventId } = req.params;
    if (!mongoose.isValidObjectId(eventId)) {
      return res.status(400).json({ msg: 'Invalid race' });
    }

    const event = await Event.findById(eventId);
    if (!event || !event.date || !event.title) {
      return res.status(400).json({ msg: 'Race is unavailable' });
    }

    const { category, distance, participant = {}, registrationData = {}, paymentSource = 'UPI' } = req.body;
    if (!category) {
      return res.status(400).json({ msg: 'Race category is required' });
    }

    const duplicate = await Ticket.findOne({
      user: req.user.id,
      event: event.id,
      category,
      status: { $ne: 'CANCELLED' }
    });

    if (duplicate) {
      return res.status(409).json({ msg: 'You are already registered for this race category' });
    }

    const user = await User.findById(req.user.id).select('name email walletBalance');
    if (!user) return res.status(401).json({ msg: 'User account not found' });

    const registrationId = createId('PF-REG');
    const bookingId = createId('PF-BOOK');
    const ticketNumber = createId('PF-BIB');

    const amount = Number(event.price || 0);
    const tax = Number((amount * 0.18).toFixed(2));
    const extraCharges = amount > 0 ? 25 : 0;
    const totalAmount = amount + tax + extraCharges;
    const walletAmount = Math.min(Number(user.walletBalance || 0), totalAmount);
    const externalAmount = totalAmount - walletAmount;

    await User.findOneAndUpdate(
      { _id: user.id, walletBalance: { $gte: walletAmount } },
      {
        $inc: { walletBalance: -walletAmount },
        $push: { walletTransactions: { type: 'DEBIT', amount: walletAmount, source: 'RACE_REGISTRATION', reference: registrationId } }
      }
    );

    const ticket = await Ticket.create({
      user: user.id,
      event: event.id,
      registrationId,
      bookingId,
      ticketNumber,
      bibNumber: ticketNumber,
      category,
      distance,
      participant: {
        name: participant.name || user.name,
        email: participant.email || user.email,
        phone: participant.phone,
        age: participant.age,
        gender: participant.gender
      },
      amount,
      tax,
      extraCharges,
      totalAmount,
      walletAmount,
      externalAmount,
      paymentSource,
      customData: registrationData
    });

    await User.findByIdAndUpdate(user.id, { $addToSet: { registeredEvents: event.id } });

    // Emit Real-Time WebSocket Event to all connected clients
    const io = req.app.get('io');
    if (io) {
      io.emit('race_registered', {
        registrationId,
        raceName: event.title,
        participantName: ticket.participant.name || user.name,
        category,
        date: new Date().toISOString()
      });
    }

    res.status(201).json(ticket);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ msg: 'Could not create a unique registration. Please try again.' });
    }
    console.error(err.message);
    res.status(500).json({ msg: 'Unable to create registration' });
  }
};

// @desc    Verify registration by ID
// @route   GET /api/registrations/verify/:registrationId
exports.verifyRegistration = async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ registrationId: req.params.registrationId })
      .populate('event', 'title category date location');

    if (!ticket) {
      return res.status(404).json({ success: false, verified: false, msg: 'Registration not found' });
    }

    res.json({
      success: true,
      verified: ticket.status === 'CONFIRMED',
      registration: {
        registrationId: ticket.registrationId,
        raceName: ticket.event.title,
        category: ticket.category,
        date: ticket.event.date,
        venue: ticket.event.location,
        participantName: ticket.participant.name,
        status: ticket.status
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get current user's races
// @route   GET /api/registrations/my-races
exports.getMyRaces = async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user.id })
      .populate('event')
      .sort({ registrationDate: -1 });
    res.json(tickets);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get specific registration details
// @route   GET /api/registrations/:registrationId
exports.getRegistration = async (req, res) => {
  try {
    const ticket = await Ticket.findOne({
      registrationId: req.params.registrationId,
      user: req.user.id
    }).populate('event');

    if (!ticket) return res.status(404).json({ msg: 'Registration not found' });
    res.json(ticket);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
