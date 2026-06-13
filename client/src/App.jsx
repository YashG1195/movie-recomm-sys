import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Search from './pages/Search';
import MovieDetail from './pages/MovieDetail';
import Watchlist from './pages/Watchlist';
import { Search as SearchIcon, Film, Bookmark, User, LogOut } from 'lucide-react';

const Navigation = () => {
  const { user, logout } = React.useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleWatchlistClick = (e) => {
    e.preventDefault();
    if (user) {
      navigate('/watchlist');
    } else {
      navigate('/login');
    }
  };

  return (
    <nav className="nav-bar">
      <Link to="/" className="brand" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Film color="var(--primary)" size={28} />
        CineMatch
      </Link>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <Link to="/search" style={{ color: 'var(--text-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <SearchIcon size={18} /> Search
        </Link>
        <button 
          onClick={handleWatchlistClick} 
          style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '16px', fontFamily: 'inherit' }}
        >
          <Bookmark size={18} /> Watchlist
        </button>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Hi, {user.username}</span>
            <button onClick={handleLogout} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        ) : (
          <button onClick={() => navigate('/login')} className="btn-primary" style={{ padding: '8px 16px', fontSize: '14px' }}>
            <User size={16} /> Sign In
          </button>
        )}
      </div>
    </nav>
  );
};

const App = () => {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/movie/:id" element={<MovieDetail />} />
        <Route path="/watchlist" element={<Watchlist />} />
      </Routes>
    </Router>
  );
};

export default App;
