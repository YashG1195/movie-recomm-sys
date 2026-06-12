const mongoose = require('mongoose');

const recommendationHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  baseMovieId: {
    type: Number, // TMDB ID or local ID of the movie they requested recommendations for
    required: true
  },
  recommendations: [{
    type: Number // Array of TMDB IDs that were recommended
  }]
}, { timestamps: true });

module.exports = mongoose.model('RecommendationHistory', recommendationHistorySchema);
