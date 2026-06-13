import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BookmarkMinus, Image as ImageIcon } from 'lucide-react';

const Watchlist = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchWatchlist = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/watchlist', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMovies(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load watchlist.');
      } finally {
        setLoading(false);
      }
    };
    fetchWatchlist();
  }, [user, token, navigate]);

  const handleRemove = async (tmdbId) => {
    try {
      await axios.delete(`http://localhost:5000/api/watchlist/${tmdbId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMovies(movies.filter(m => m.tmdbId.toString() !== tmdbId.toString()));
    } catch (err) {
      console.error('Failed to remove movie', err);
    }
  };

  if (loading) {
    return <div className="container" style={{ paddingTop: '60px' }}>Loading...</div>;
  }

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
      <h2 style={{ marginBottom: '32px' }}>Your Watchlist</h2>
      
      {error && <p style={{ color: 'var(--primary)' }}>{error}</p>}
      
      {!loading && !error && movies.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: '16px' }}>
          <BookmarkMinus size={48} color="var(--text-secondary)" style={{ marginBottom: '16px' }} />
          <h3>Your Watchlist is empty</h3>
          <p style={{ marginTop: '8px', marginBottom: '24px' }}>Save movies to keep track of what you want to watch next.</p>
          <button className="btn-primary" onClick={() => navigate('/search')}>Explore Movies</button>
        </div>
      )}

      <div className="movie-grid">
        {movies.map(movie => (
          <div key={movie._id} className="movie-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div 
              style={{ position: 'relative', flex: 1, cursor: 'pointer' }}
              onClick={() => navigate(`/movie/${movie.tmdbId}`)}
            >
              {movie.posterPath ? (
                <img src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`} alt={movie.title} />
              ) : (
                <div style={{ width: '100%', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a24' }}>
                  <ImageIcon size={48} color="var(--text-secondary)" />
                </div>
              )}
            </div>
            <div style={{ padding: '16px', background: 'var(--bg-card)', borderTop: '1px solid var(--border-glass)' }}>
              <div className="movie-title" style={{ fontSize: '16px', marginBottom: '8px' }}>{movie.title}</div>
              <div className="movie-meta" style={{ marginBottom: '16px' }}>
                <span>{movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 'N/A'}</span>
                <span>⭐ {movie.voteAverage ? movie.voteAverage.toFixed(1) : 'NR'}</span>
              </div>
              <button 
                className="btn-secondary" 
                style={{ width: '100%', justifyContent: 'center', padding: '8px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(movie.tmdbId);
                }}
              >
                <BookmarkMinus size={16} /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Watchlist;
