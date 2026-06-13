const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

// Database connection
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Basic route
app.get('/', (req, res) => {
  res.send('CineMatch API is running');
});

// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
app.use('/api/movies', require('./routes/movies'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/watchlist', require('./routes/watchlist'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
