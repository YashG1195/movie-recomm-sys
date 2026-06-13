import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search as SearchIcon, Image as ImageIcon, X } from 'lucide-react';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Recommendations Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length > 0) {
        fetchSearchResults(query);
      } else {
        setResults([]);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const fetchSearchResults = async (searchQuery) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`http://localhost:5000/api/movies/search?query=${encodeURIComponent(searchQuery)}`);
      setResults(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch search results.');
    } finally {
      setLoading(false);
    }
  };

  const handleGetRecommendations = async (movie) => {
    setSelectedMovie(movie);
    setShowModal(true);
    setRecLoading(true);
    setRecError(null);
    setRecommendations([]);

    try {
      const res = await axios.get(`http://localhost:5000/api/movies/recommend/${movie.id}`);
      setRecommendations(res.data.recommendations || []);
    } catch (err) {
      console.error(err);
      setRecError('Failed to load recommendations.');
    } finally {
      setRecLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto 40px', position: 'relative' }}>
        <SearchIcon size={20} style={{ position: 'absolute', top: '16px', left: '16px', color: 'var(--text-secondary)' }} />
        <input 
          type="text" 
          className="input-field"
          style={{ paddingLeft: '48px', fontSize: '16px' }}
          placeholder="Search for movies by title..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading && <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Searching...</p>}
      {error && <p style={{ textAlign: 'center', color: 'var(--primary)' }}>{error}</p>}
      
      {!loading && !error && results.length === 0 && query.trim().length > 0 && (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No movies found for "{query}"</p>
      )}

      <div className="movie-grid">
        {results.map(movie => (
          <div 
            key={movie.id} 
            className="movie-card" 
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            <div 
              style={{ position: 'relative', flex: 1, cursor: 'pointer' }}
              onClick={() => navigate(`/movie/${movie.id}`)}
            >
              {movie.poster_path ? (
                <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} />
              ) : (
                <div style={{ width: '100%', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a24' }}>
                  <ImageIcon size={48} color="var(--text-secondary)" />
                </div>
              )}
            </div>
            <div style={{ padding: '16px', background: 'var(--bg-card)', borderTop: '1px solid var(--border-glass)' }}>
              <div className="movie-title" style={{ fontSize: '16px', marginBottom: '8px' }}>{movie.title}</div>
              <div className="movie-meta" style={{ marginBottom: '16px' }}>
                <span>{movie.release_date ? movie.release_date.substring(0, 4) : 'N/A'}</span>
                <span>⭐ {movie.vote_average ? movie.vote_average.toFixed(1) : 'NR'}</span>
              </div>
              <button 
                className="btn-primary" 
                style={{ width: '100%', justifyContent: 'center', padding: '8px', fontSize: '14px' }}
                onClick={() => handleGetRecommendations(movie)}
              >
                Get Recommendations
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', 
          alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '900px', maxHeight: '80vh', overflowY: 'auto', padding: '32px', position: 'relative' }}>
            <button 
              onClick={() => setShowModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
            
            <h2 style={{ marginBottom: '24px' }}>Because you searched for: {selectedMovie?.title}</h2>
            
            {recLoading ? (
              <p style={{ color: 'var(--text-secondary)' }}>Analyzing similarities and computing recommendations...</p>
            ) : recError ? (
              <p style={{ color: 'var(--primary)' }}>{recError}</p>
            ) : recommendations.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No recommendations found.</p>
            ) : (
              <div className="movie-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
                {recommendations.map(movie => (
                  <div key={movie.id} className="movie-card">
                    {movie.poster_path ? (
                      <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} style={{ height: '225px' }} />
                    ) : (
                      <div style={{ width: '100%', height: '225px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a24' }}>
                        <ImageIcon size={32} color="var(--text-secondary)" />
                      </div>
                    )}
                    <div style={{ padding: '8px', background: 'var(--bg-card)' }}>
                      <div className="movie-title" style={{ fontSize: '12px' }}>{movie.title}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
