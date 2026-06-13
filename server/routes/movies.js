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
    const FALLBACK_MOVIES = [
      { id: 27205, title: "Inception", poster_path: "/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg", vote_average: 8.8, release_date: "2010-07-15", genre_ids: [28, 878, 53] },
      { id: 157336, title: "Interstellar", poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", vote_average: 8.6, release_date: "2014-11-05", genre_ids: [12, 18, 878] },
      { id: 155, title: "The Dark Knight", poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg", vote_average: 8.5, release_date: "2008-07-16", genre_ids: [28, 80, 18] },
      { id: 19995, title: "Avatar", poster_path: "/kyeqWdyKOUAcDzEQqn6EWkEZ2Fs.jpg", vote_average: 7.9, release_date: "2009-12-15", genre_ids: [28, 12, 14, 878] },
      { id: 293660, title: "Deadpool", poster_path: "/fSRb7vyIP8rQpL0I47P3qUsEKX3.jpg", vote_average: 7.6, release_date: "2016-02-09", genre_ids: [28, 12, 35] },
      { id: 24428, title: "The Avengers", poster_path: "/RYMX2wcKCBAr24UyPD7xwaStcg.jpg", vote_average: 7.7, release_date: "2012-04-25", genre_ids: [878, 28, 12] },
      { id: 1726, title: "Iron Man", poster_path: "/78lPtwv72eTNqFW9COBYI0dWDJa.jpg", vote_average: 7.6, release_date: "2008-04-30", genre_ids: [28, 878, 12] }
    ];
    const results = FALLBACK_MOVIES.filter(m => m.title.toLowerCase().includes(query.toLowerCase()));
    res.json(results);
  }
});

// @route   GET /api/movies/trending
// @desc    Get trending movies
// @access  Public
router.get('/trending', async (req, res) => {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    const response = await axios.get(
      `${TMDB_BASE_URL}/trending/movie/week?api_key=${apiKey}`
    );
    const movies = response.data.results.map(movie => ({
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      vote_average: movie.vote_average,
      release_date: movie.release_date,
      genre_ids: movie.genre_ids
    }));
    res.json(movies);
  } catch (error) {
    console.error('TMDB Trending Error:', error?.response?.data || error.message);
    // Return fallback movies instead of failing
    const FALLBACK_MOVIES = [
      { id: 27205, title: "Inception", poster_path: "/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg", vote_average: 8.8, release_date: "2010-07-15" },
      { id: 157336, title: "Interstellar", poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", vote_average: 8.6, release_date: "2014-11-05" },
      { id: 155, title: "The Dark Knight", poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg", vote_average: 8.5, release_date: "2008-07-16" },
      { id: 19995, title: "Avatar", poster_path: "/kyeqWdyKOUAcDzEQqn6EWkEZ2Fs.jpg", vote_average: 7.9, release_date: "2009-12-15" },
      { id: 293660, title: "Deadpool", poster_path: "/fSRb7vyIP8rQpL0I47P3qUsEKX3.jpg", vote_average: 7.6, release_date: "2016-02-09" }
    ];
    res.json(FALLBACK_MOVIES);
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

// @route   GET /api/movies/recommend/:movieId
// @desc    Get recommendations for a movie
// @access  Public
router.get('/recommend/:movieId', async (req, res) => {
  try {
    const mlResponse = await axios.post(`${process.env.ML_SERVICE_URL || 'http://localhost:5001'}/recommend`, {
      movie_id: req.params.movieId
    });
    res.json(mlResponse.data);
  } catch (error) {
    console.error('ML Service Error:', error?.response?.data || error.message);
    res.status(500).json({ message: 'Error fetching recommendations', error: error?.response?.data || error.message });
  }
});

module.exports = router;
