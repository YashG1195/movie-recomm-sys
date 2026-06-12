import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Search from './pages/Search';
import { Search as SearchIcon, Film, Bookmark, User, LogOut } from 'lucide-react';

// Placeholders for other pages
const MovieDetail = () => <div className="container" style={{paddingTop: '40px'}}><h2>Movie Details</h2></div>;
const Watchlist = () => <div className="container" style={{paddingTop: '40px'}}><h2>Your Watchlist</h2></div>;

// Navigation component to consume AuthContext
const Navigation = () => {
  const { user, logout } = React.useContext(AuthContext);
  
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
        <Link to="/watchlist" style={{ color: 'var(--text-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Bookmark size={18} /> Watchlist
        </Link>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Hi, {user.username}</span>
            <button onClick={logout} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        ) : (
          <Link to="/login" className="btn-primary" style={{ padding: '8px 16px', fontSize: '14px' }}>
            <User size={16} /> Sign In
          </Link>
        )}
      </div>
    </nav>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="container">
          <Navigation />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/movie/:id" element={<MovieDetail />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
