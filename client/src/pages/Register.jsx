import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Film, User, Mail, Lock } from 'lucide-react';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', {
        username,
        email,
        password
      });
      
      const { token, user } = res.data;
      login(user, token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 120px)' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '40px', background: '#0d0d0d' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Film size={48} color="#e5195e" style={{ margin: '0 auto 16px' }} />
          <h2>Create Account</h2>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ position: 'relative' }}>
            <User size={20} color="var(--text-secondary)" style={{ position: 'absolute', top: '14px', left: '16px' }} />
            <input 
              type="text" 
              className="input-field" 
              placeholder="Username" 
              style={{ paddingLeft: '48px', background: 'rgba(255,255,255,0.05)' }}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Mail size={20} color="var(--text-secondary)" style={{ position: 'absolute', top: '14px', left: '16px' }} />
            <input 
              type="email" 
              className="input-field" 
              placeholder="Email" 
              style={{ paddingLeft: '48px', background: 'rgba(255,255,255,0.05)' }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={20} color="var(--text-secondary)" style={{ position: 'absolute', top: '14px', left: '16px' }} />
            <input 
              type="password" 
              className="input-field" 
              placeholder="Password" 
              style={{ paddingLeft: '48px', background: 'rgba(255,255,255,0.05)' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={20} color="var(--text-secondary)" style={{ position: 'absolute', top: '14px', left: '16px' }} />
            <input 
              type="password" 
              className="input-field" 
              placeholder="Confirm Password" 
              style={{ paddingLeft: '48px', background: 'rgba(255,255,255,0.05)' }}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', justifyContent: 'center', background: '#e5195e', marginTop: '10px' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          {error && (
            <p style={{ color: 'red', textAlign: 'center', marginTop: '10px' }}>{error}</p>
          )}

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Link to="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
              Already have an account? <span style={{ color: '#e5195e' }}>Sign In</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
