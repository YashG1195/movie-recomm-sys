const express = require('express');
const router = express.Router();
const axios = require('axios');
const User = require('../models/User');
const Movie = require('../models/Movie');
const { protect } = require('../middleware/auth');

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const getTmdbHeaders = () => {
  return {
    headers: {
      Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
      accept: 'application/json'
    }
  };
};

// Helper function to ensure movie is in our DB
const getOrCacheMovie = async (tmdbId) => {
  let movie = await Movie.findOne({ tmdbId });
  
  if (!movie) {
    // Fetch from TMDB
    try {
      const response = await axios.get(
        `${TMDB_BASE_URL}/movie/${tmdbId}`,
        getTmdbHeaders()
      );
      const mData = response.data;
      
      movie = await Movie.create({
        tmdbId: mData.id,
        title: mData.title,
        overview: mData.overview,
        posterPath: mData.poster_path,
        genres: mData.genres,
        releaseDate: mData.release_date ? new Date(mData.release_date) : null,
        voteAverage: mData.vote_average,
        voteCount: mData.vote_count
      });
    } catch (error) {
      console.error('Error fetching movie from TMDB to cache:', error.message);
      throw new Error('Movie not found on TMDB');
    }
  }
  return movie;
};

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

// @route   POST /api/watchlist/:tmdbId
// @desc    Add a movie to watchlist
// @access  Private
router.post('/:tmdbId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Ensure movie is cached in our DB and get its internal MongoDB _id
    const movie = await getOrCacheMovie(req.params.tmdbId);
    
    if (user.watchlist.includes(movie._id)) {
      return res.status(400).json({ message: 'Movie already in watchlist' });
    }

    user.watchlist.push(movie._id);
    await user.save();

    res.status(201).json({ message: 'Movie added to watchlist', watchlist: user.watchlist });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/watchlist/:tmdbId
// @desc    Remove a movie from watchlist
// @access  Private
router.delete('/:tmdbId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const movie = await Movie.findOne({ tmdbId: req.params.tmdbId });
    
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found in database' });
    }

    user.watchlist = user.watchlist.filter(
      (id) => id.toString() !== movie._id.toString()
    );
    
    await user.save();

    res.json({ message: 'Movie removed from watchlist', watchlist: user.watchlist });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
