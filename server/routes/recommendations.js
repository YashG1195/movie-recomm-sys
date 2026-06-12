const express = require('express');
const router = express.Router();
const axios = require('axios');
const RecommendationHistory = require('../models/RecommendationHistory');
const { protect } = require('../middleware/auth');

// @route   POST /api/recommendations
// @desc    Get movie recommendations from ML service
// @access  Private
router.post('/', protect, async (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Movie title is required' });
  }

  try {
    // Call the Python ML Microservice
    const mlResponse = await axios.post(`${process.env.ML_SERVICE_URL}/recommend`, {
      title
    });

    const recommendations = mlResponse.data.recommendations || [];

    // Optional: save to history
    // We would need the baseMovieId from the frontend (TMDB ID) to save properly,
    // assuming it's passed in the body.
    if (req.body.baseMovieId) {
      await RecommendationHistory.create({
        user: req.user._id,
        baseMovieId: req.body.baseMovieId,
        // Since ML service might just return titles or TMDB IDs, we save them
        // Let's assume it returns a list of titles for now, or TMDB IDs if integrated with dataset
        recommendations: recommendations.map(r => r.id || 0) // Placeholder
      });
    }

    res.json({ recommendations });
  } catch (error) {
    console.error('ML Service Error:', error.message);
    res.status(500).json({ message: 'Error fetching recommendations from ML service', error: error.message });
  }
});

module.exports = router;
