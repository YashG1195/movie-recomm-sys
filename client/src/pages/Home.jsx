import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, Play, Image as ImageIcon } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/movies/trending');
        setTrending(res.data);
      } catch (err) {
        console.error("Failed to fetch trending movies:", err);
        setError("Failed to load trending movies.");
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);
  return (
    <div className="animate-fade-in">
      <section className="hero">
        <div className="hero-content" style={{ zIndex: 1 }}>
          <h1>Find Your Next <br/><span style={{ color: 'var(--primary)' }}>Favorite Movie</span></h1>
          <p style={{ maxWidth: '600px', margin: '0 auto 32px' }}>
            Discover thousands of movies, get personalized recommendations using AI, and keep track of what you want to watch next.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button className="btn-primary" onClick={() => navigate('/search')}>
              <Search size={20} />
              Start Searching
            </button>
            <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Play size={20} />
              Trending Now
            </button>
          </div>
        </div>
      </section>

      <section style={{ margin: '60px 0' }}>
        <h2>Trending Now</h2>
        {error && <p style={{ color: 'var(--primary)', marginBottom: '16px' }}>{error}</p>}
        <div className="movie-grid">
          {loading ? (
            /* Loading Skeleton */
            [1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="movie-card animate-pulse" style={{ background: 'var(--bg-card)' }}>
                <div style={{ width: '100%', height: '300px', background: 'rgba(255,255,255,0.05)' }}></div>
                <div style={{ padding: '20px' }}>
                  <div style={{ width: '80%', height: '20px', background: 'rgba(255,255,255,0.05)', marginBottom: '10px', borderRadius: '4px' }}></div>
                  <div style={{ width: '40%', height: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}></div>
                </div>
              </div>
            ))
          ) : (
            trending.map(movie => (
              <div key={movie.id} className="movie-card">
                {movie.poster_path ? (
                  <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} />
                ) : (
                  <div style={{ width: '100%', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a24' }}>
                    <ImageIcon size={48} color="var(--text-secondary)" />
                  </div>
                )}
                <div className="movie-info">
                  <div className="movie-title">{movie.title}</div>
                  <div className="movie-meta">
                    <span>{movie.release_date ? movie.release_date.substring(0, 4) : 'N/A'}</span>
                    <span>⭐ {movie.vote_average ? movie.vote_average.toFixed(1) : 'NR'}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
