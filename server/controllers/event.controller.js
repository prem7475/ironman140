const Event = require('../models/Event');
const mongoose = require('mongoose');

const CATEGORIES = ['Marathon', 'Cycling', 'Swimming', 'Triathlon', 'Duathlon', 'IRONMAN', 'HYROX', 'Devils Circuit'];

// @desc    Get all events
// @route   GET /api/events
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get events by category
// @route   GET /api/events/category/:category
exports.getEventsByCategory = async (req, res) => {
  try {
    if (!CATEGORIES.includes(req.params.category)) {
      return res.status(400).json({ msg: 'Invalid race category' });
    }
    const events = await Event.find({ category: req.params.category }).sort({ date: 1 });
    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get events by city
// @route   GET /api/events/city/:city
exports.getEventsByCity = async (req, res) => {
  try {
    const city = req.params.city === 'Bangalore' ? 'Bengaluru' : req.params.city;
    const events = await Event.find({ location: city }).sort({ date: 1 });
    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get event by ID or Slug
// @route   GET /api/events/:id
exports.getEvent = async (req, res) => {
  try {
    const query = mongoose.isValidObjectId(req.params.id)
      ? { $or: [{ _id: req.params.id }, { slug: req.params.id }] }
      : { slug: req.params.id };
    const event = await Event.findOne(query);
    if (!event) return res.status(404).json({ msg: 'Race not found' });
    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Admin handlers with WebSocket Real-Time Event Emits
exports.createEvent = async (req, res) => {
  try {
    const event = await Event.create(req.body);
    const io = req.app.get('io');
    if (io) io.emit('race_created', event);
    res.status(201).json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!event) return res.status(404).json({ msg: 'Race not found' });
    const io = req.app.get('io');
    if (io) io.emit('race_updated', event);
    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ msg: 'Race not found' });
    const io = req.app.get('io');
    if (io) io.emit('race_deleted', { id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
