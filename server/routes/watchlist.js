const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Movie = require('../models/Movie');
const { protect } = require('../middleware/auth');

// @route   GET /api/watchlist
// @desc    Get user's watchlist
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('watchlist');
    res.json(user.watchlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/watchlist/:movieId
// @desc    Add a movie to watchlist (movieId is the MongoDB _id)
// @access  Private
router.post('/:movieId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Check if movie exists in our DB
    const movie = await Movie.findById(req.params.movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found in database' });
    }

    if (user.watchlist.includes(req.params.movieId)) {
      return res.status(400).json({ message: 'Movie already in watchlist' });
    }

    user.watchlist.push(req.params.movieId);
    await user.save();

    res.status(201).json({ message: 'Movie added to watchlist', watchlist: user.watchlist });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/watchlist/:movieId
// @desc    Remove a movie from watchlist
// @access  Private
router.delete('/:movieId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    user.watchlist = user.watchlist.filter(
      (id) => id.toString() !== req.params.movieId
    );
    
    await user.save();

    res.json({ message: 'Movie removed from watchlist', watchlist: user.watchlist });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
