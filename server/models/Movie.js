const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  tmdbId: {
    type: Number,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  overview: {
    type: String,
  },
  posterPath: {
    type: String,
  },
  genres: [{
    id: Number,
    name: String
  }],
  releaseDate: {
    type: Date,
  },
  voteAverage: {
    type: Number,
  },
  voteCount: {
    type: Number,
  }
}, { timestamps: true });

module.exports = mongoose.model('Movie', movieSchema);
