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
    setRecommendations([]);
    
    try {
      const res = await axios.get(`http://localhost:5000/api/movies/search?query=${encodeURIComponent(searchQuery)}`);
      setResults(res.data);
      
      // Automatically get recommendations for the top result
      if (res.data.length > 0) {
        handleGetRecommendations(res.data[0]);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch search results.');
    } finally {
      setLoading(false);
    }
  };

  const handleGetRecommendations = async (movie) => {
    setSelectedMovie(movie);
    setRecLoading(true);
    setRecError(null);

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

      {/* Render the selected movie and its recommendations directly on the page instead of a modal */}
      {selectedMovie && !loading && (
        <div style={{ marginTop: '40px', paddingTop: '40px', borderTop: '1px solid var(--border-glass)' }}>
          <h2 style={{ marginBottom: '24px' }}>Because you searched for: <span style={{ color: 'var(--primary)' }}>{selectedMovie.title}</span></h2>
          
          {recLoading ? (
            <p style={{ color: 'var(--text-secondary)' }}>Analyzing similarities and computing recommendations...</p>
          ) : recError ? (
            <p style={{ color: 'var(--primary)' }}>{recError}</p>
          ) : recommendations.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No recommendations found.</p>
          ) : (
            <div className="movie-grid">
              {recommendations.map(movie => (
                <div 
                  key={movie.id} 
                  className="movie-card"
                  onClick={() => navigate(`/movie/${movie.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  {movie.poster_path ? (
                    <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} />
                  ) : (
                    <div style={{ width: '100%', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a24' }}>
                      <ImageIcon size={48} color="var(--text-secondary)" />
                    </div>
                  )}
                  <div style={{ padding: '16px', background: 'var(--bg-card)' }}>
                    <div className="movie-title" style={{ fontSize: '16px', marginBottom: '8px' }}>{movie.title}</div>
                    <div className="movie-meta">
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{movie.genres || 'Similar Genre'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
