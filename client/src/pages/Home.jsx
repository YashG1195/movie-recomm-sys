import React from 'react';
import { Search, Play } from 'lucide-react';

const Home = () => {
  return (
    <div className="animate-fade-in">
      <section className="hero">
        <div className="hero-content" style={{ zIndex: 1 }}>
          <h1>Find Your Next <br/><span style={{ color: 'var(--primary)' }}>Favorite Movie</span></h1>
          <p style={{ maxWidth: '600px', margin: '0 auto 32px' }}>
            Discover thousands of movies, get personalized recommendations using AI, and keep track of what you want to watch next.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button className="btn-primary">
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
        <div className="movie-grid">
          {/* Dummy placeholders for now */}
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="movie-card">
              <img src={`https://via.placeholder.com/300x450/1a1a24/ffffff?text=Movie+${i}`} alt="Movie" />
              <div className="movie-info">
                <div className="movie-title">Awesome Movie {i}</div>
                <div className="movie-meta">
                  <span>2026</span>
                  <span>⭐ 8.{i}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
