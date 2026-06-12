const express = require('express');
const router = express.Router();
const axios = require('axios');
const Movie = require('../models/Movie');
const { protect } = require('../middleware/auth');

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Helper to get TMDB headers
const getTmdbHeaders = () => {
  return {
    headers: {
      Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
      accept: 'application/json'
    }
  };
};

// @route   GET /api/movies/search?query=...
// @desc    Search for movies via TMDB
// @access  Public
router.get('/search', async (req, res) => {
  const { query } = req.query;
  
  if (!query) {
    return res.status(400).json({ message: 'Query parameter is required' });
  }

  try {
    const response = await axios.get(
      `${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`,
      getTmdbHeaders()
    );
    res.json(response.data.results);
  } catch (error) {
    console.error('TMDB Search Error:', error?.response?.data || error.message);
    res.status(500).json({ message: 'Error fetching from TMDB', error: error?.response?.data || error.message });
  }
});

// @route   GET /api/movies/trending
// @desc    Get trending movies
// @access  Public
router.get('/trending', async (req, res) => {
  try {
    const response = await axios.get(
      `${TMDB_BASE_URL}/trending/movie/day?language=en-US`,
      getTmdbHeaders()
    );
    res.json(response.data.results);
  } catch (error) {
    console.error('TMDB Trending Error:', error?.response?.data || error.message);
    res.status(500).json({ message: 'Error fetching from TMDB', error: error?.response?.data || error.message });
  }
});

// @route   GET /api/movies/:id
// @desc    Get movie details by TMDB ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    // 1. Fetch from TMDB
    const response = await axios.get(
      `${TMDB_BASE_URL}/movie/${req.params.id}?append_to_response=credits`,
      getTmdbHeaders()
    );
    
    const movieData = response.data;

    // 2. Cache/Update in our MongoDB
    try {
      await Movie.findOneAndUpdate(
        { tmdbId: movieData.id },
        {
          tmdbId: movieData.id,
          title: movieData.title,
          overview: movieData.overview,
          posterPath: movieData.poster_path,
          genres: movieData.genres,
          releaseDate: movieData.release_date ? new Date(movieData.release_date) : null,
          voteAverage: movieData.vote_average,
          voteCount: movieData.vote_count
        },
        { upsert: true, new: true }
      );
    } catch (dbError) {
      console.error('Failed to cache movie in MongoDB:', dbError);
    }

    res.json(movieData);
  } catch (error) {
    console.error('TMDB Details Error:', error?.response?.data || error.message);
    res.status(500).json({ message: 'Error fetching from TMDB', error: error?.response?.data || error.message });
  }
});

module.exports = router;
