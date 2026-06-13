import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Bookmark, BookmarkCheck, Star, Calendar, Clock, Play } from 'lucide-react';

const MovieDetail = () => {
  const { id } = useParams();
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [inWatchlist, setInWatchlist] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/movies/${id}`);
        setMovie(res.data);
        
        // If user is logged in, check if movie is in watchlist
        if (token) {
          const wlRes = await axios.get('http://localhost:5000/api/watchlist', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const isInList = wlRes.data.some(m => m.tmdbId.toString() === id.toString());
          setInWatchlist(isInList);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load movie details.');
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [id, token]);

  const handleWatchlistToggle = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setActionLoading(true);
    try {
      if (inWatchlist) {
        await axios.delete(`http://localhost:5000/api/watchlist/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setInWatchlist(false);
      } else {
        await axios.post(`http://localhost:5000/api/watchlist/${id}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setInWatchlist(true);
      }
    } catch (err) {
      console.error('Failed to toggle watchlist:', err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="container" style={{ paddingTop: '100px', textAlign: 'center' }}>Loading...</div>;
  }

  if (error || !movie) {
    return <div className="container" style={{ paddingTop: '100px', textAlign: 'center', color: 'var(--primary)' }}>{error || 'Movie not found'}</div>;
  }

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '60px' }}>
      {/* Backdrop Hero */}
      <div style={{ 
        position: 'relative', 
        height: '60vh', 
        width: '100%',
        backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(to top, var(--bg-dark) 0%, rgba(15,17,21,0.5) 50%, rgba(15,17,21,0.8) 100%)'
        }}></div>
      </div>

      {/* Main Content Overlay */}
      <div className="container" style={{ position: 'relative', marginTop: '-30vh', display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        
        {/* Poster */}
        <div style={{ flex: '0 0 300px' }}>
          <img 
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
            alt={movie.title}
            style={{ width: '100%', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
            onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.jpg'; }}
          />
        </div>

        {/* Details */}
        <div style={{ flex: 1, paddingTop: '40px' }}>
          <h1 style={{ marginBottom: '8px' }}>{movie.title}</h1>
          <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', marginBottom: '24px' }}>{movie.tagline}</p>
          
          <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Star size={20} color="#fbbf24" fill="#fbbf24" />
              <span style={{ fontWeight: 600 }}>{movie.vote_average?.toFixed(1)} / 10</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
              <Clock size={20} />
              <span>{movie.runtime} min</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
              <Calendar size={20} />
              <span>{movie.release_date?.substring(0, 4)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '40px' }}>
            <button 
              className={inWatchlist ? "btn-secondary" : "btn-primary"}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: inWatchlist ? 'rgba(255,255,255,0.1)' : '' }}
              onClick={handleWatchlistToggle}
              disabled={actionLoading}
            >
              {inWatchlist ? <BookmarkCheck size={20} color="var(--primary)" /> : <Bookmark size={20} />}
              {actionLoading ? 'Updating...' : (inWatchlist ? 'In Watchlist' : 'Add to Watchlist')}
            </button>
            <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Play size={20} />
              Trailer
            </button>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h3>Overview</h3>
            <p style={{ marginTop: '12px', lineHeight: 1.8, fontSize: '16px' }}>{movie.overview}</p>
          </div>

          <div>
            <h3 style={{ marginBottom: '12px' }}>Genres</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {movie.genres?.map(g => (
                <span key={g.id} style={{ padding: '6px 16px', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', fontSize: '14px' }}>
                  {g.name}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
